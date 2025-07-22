package com.example.subtrackerproject.controller;

import com.example.subtrackerproject.model.AppUser;
import com.example.subtrackerproject.repository.AppUserRepository;
import com.example.subtrackerproject.service.AppUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private AppUserService appUserService;
    
    @Autowired
    private AppUserRepository appUserRepository;

    @GetMapping("/currency")
    public ResponseEntity<?> getUserCurrency(@AuthenticationPrincipal Jwt jwt) {
        try {
            String googleSub = jwt.getClaimAsString("sub");
            Optional<AppUser> userOpt = appUserService.findByGoogleSub(googleSub);
            
            if (userOpt.isPresent()) {
                AppUser user = userOpt.get();
                return ResponseEntity.ok(Map.of("currency", user.getCurrency()));
            }
            
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to get currency"));
        }
    }

    @PutMapping("/currency")
    public ResponseEntity<?> updateUserCurrency(@AuthenticationPrincipal Jwt jwt, @RequestBody Map<String, String> request) {
        try {
            String googleSub = jwt.getClaimAsString("sub");
            String currency = request.get("currency");
            
            // Validate currency
            if (currency == null || (!currency.equals("USD") && !currency.equals("EUR"))) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid currency"));
            }
            
            Optional<AppUser> userOpt = appUserService.findByGoogleSub(googleSub);
            if (userOpt.isPresent()) {
                AppUser user = userOpt.get();
                user.setCurrency(currency);
                appUserRepository.save(user);
                return ResponseEntity.ok(Map.of("message", "Currency updated successfully"));
            }
            
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to update currency"));
        }
    }
} 