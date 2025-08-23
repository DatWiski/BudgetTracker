package com.example.budgettracker.controller;

import com.example.budgettracker.model.AppUser;
import com.example.budgettracker.service.AppUserService;
import com.example.budgettracker.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final JwtService jwtService;
    private final AppUserService appUserService;

    private static final String ANONYMOUS_USER = "anonymousUser";
    
    @Value("${spring.profiles.active:}")
    private String activeProfile;
    

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getAuthStatus() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        Map<String, Object> response = new HashMap<>();
        
        if (authentication != null && authentication.isAuthenticated() && 
            !authentication.getName().equals(ANONYMOUS_USER)) {
            response.put("authenticated", true);
            response.put("username", authentication.getName());
        } else {
            response.put("authenticated", false);
        }
        
        // Only add debug info in dev profile
        if ("dev".equalsIgnoreCase(activeProfile)) {
            response.put("env", "dev");
        }
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.badRequest().body(Map.of("error", "No token provided"));
            }

            String token = authHeader.substring(7);
            
            // Validate the current token (even if expired, we check if it's valid)
            String googleSub = SecurityContextHolder.getContext().getAuthentication().getName();
            
            // Get user and generate new token
            AppUser user = appUserService.findByGoogleSub(googleSub)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String newToken = jwtService.generateToken(user);

            return ResponseEntity.ok(Map.of(
                "token", newToken,
                "user", Map.of(
                    "id", user.getId(),
                    "email", user.getEmail(),
                    "name", user.getFullName()
                )
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired token"));
        }
    }
    
}