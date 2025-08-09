package com.example.budgettracker.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

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
}