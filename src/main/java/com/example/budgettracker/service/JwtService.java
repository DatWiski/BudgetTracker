package com.example.budgettracker.service;

import com.example.budgettracker.model.AppUser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class JwtService {

    private final JwtEncoder jwtEncoder;
    private final JwtDecoder jwtDecoder;

    @Value("${app.jwt.expiration-hours:24}")
    private int expirationHours;

    public JwtService(JwtEncoder jwtEncoder, JwtDecoder jwtDecoder) {
        this.jwtEncoder = jwtEncoder;
        this.jwtDecoder = jwtDecoder;
    }

    public String generateToken(AppUser user) {
        Instant now = Instant.now();
        
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("budget-tracker")
                .issuedAt(now)
                .expiresAt(now.plus(expirationHours, ChronoUnit.HOURS))
                .subject(user.getGoogleSub())
                .claim("email", user.getEmail())
                .claim("name", user.getFullName())
                .claim("userId", user.getId())
                .build();

        return jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }

    public Jwt validateToken(String token) {
        try {
            return jwtDecoder.decode(token);
        } catch (JwtException e) {
            throw new RuntimeException("Invalid JWT token", e);
        }
    }

    public String extractGoogleSub(String token) {
        Jwt jwt = validateToken(token);
        return jwt.getSubject();
    }

    public Long extractUserId(String token) {
        Jwt jwt = validateToken(token);
        return jwt.getClaim("userId");
    }
}