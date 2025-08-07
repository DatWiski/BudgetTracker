package com.example.budgettracker.controller;

import com.example.budgettracker.model.AppUser;
import com.example.budgettracker.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final AppUserRepository appUserRepository;

    @GetMapping("/currency")
    public ResponseEntity<?> getUserCurrency(AppUser appUser) {
        return ResponseEntity.ok(Map.of("currency", appUser.getCurrency()));
    }

    @PutMapping("/currency")
    public ResponseEntity<?> updateUserCurrency(AppUser appUser, @RequestBody Map<String, String> request) {
        String currency = request.get("currency");

        if (currency == null || (!currency.equals("USD") && !currency.equals("EUR"))) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid currency"));
        }

        appUser.setCurrency(currency);
        appUserRepository.save(appUser);
        return ResponseEntity.ok(Map.of("message", "Currency updated successfully"));
    }
}
