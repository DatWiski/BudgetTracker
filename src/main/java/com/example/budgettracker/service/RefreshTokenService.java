package com.example.budgettracker.service;

import com.example.budgettracker.dto.TokenPair;
import com.example.budgettracker.model.AppUser;
import com.example.budgettracker.model.RefreshToken;
import com.example.budgettracker.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    
    @Value("${app.refresh-token.expiration-days:30}")
    private int refreshTokenExpirationDays;
    
    @Value("${app.refresh-token.max-per-user:5}")
    private int maxTokensPerUser;
    
    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public TokenPair generateTokenPair(AppUser user, String userAgent, String ipAddress) {
        // Clean up old tokens if user has too many
        cleanupUserTokens(user);
        
        // Generate secure refresh token
        String refreshToken = generateSecureToken();
        String tokenHash = hashToken(refreshToken);
        
        // Create and save refresh token
        RefreshToken refreshTokenEntity = new RefreshToken(
            tokenHash, 
            user, 
            LocalDateTime.now().plusDays(refreshTokenExpirationDays),
            userAgent,
            ipAddress
        );
        refreshTokenRepository.save(refreshTokenEntity);
        
        // Generate access token
        String accessToken = jwtService.generateToken(user);
        long expiresIn = jwtService.getAccessTokenExpirationMinutes() * 60; // Convert to seconds
        
        return new TokenPair(accessToken, refreshToken, expiresIn);
    }

    @Transactional
    public Optional<TokenPair> refreshAccessToken(String refreshToken, String userAgent, String ipAddress) {
        String tokenHash = hashToken(refreshToken);
        
        Optional<RefreshToken> refreshTokenOpt = refreshTokenRepository.findByTokenHash(tokenHash);
        
        if (refreshTokenOpt.isEmpty() || refreshTokenOpt.get().isExpired()) {
            // Clean up expired token if found
            refreshTokenOpt.ifPresent(rt -> refreshTokenRepository.delete(rt));
            return Optional.empty();
        }
        
        RefreshToken refreshTokenEntity = refreshTokenOpt.get();
        AppUser user = refreshTokenEntity.getAppUser();
        
        // Update last used timestamp
        refreshTokenEntity.updateLastUsed();
        
        // Security check - validate user agent and IP if configured
        if (isDifferentDevice(refreshTokenEntity, userAgent, ipAddress)) {
            log.warn("Refresh token used from different device for user: {}", user.getId());
            // Could choose to reject or allow - for now we'll allow but log
        }
        
        // Generate new token pair (rotate refresh token)
        refreshTokenRepository.delete(refreshTokenEntity);
        
        return Optional.of(generateTokenPair(user, userAgent, ipAddress));
    }

    @Transactional
    public void revokeRefreshToken(String refreshToken) {
        String tokenHash = hashToken(refreshToken);
        refreshTokenRepository.deleteByTokenHash(tokenHash);
    }

    @Transactional
    public void revokeAllUserTokens(AppUser user) {
        refreshTokenRepository.deleteAllByUser(user);
    }

    private void cleanupUserTokens(AppUser user) {
        long tokenCount = refreshTokenRepository.countByAppUser(user);
        if (tokenCount >= maxTokensPerUser) {
            // Remove oldest tokens to make room
            var tokens = refreshTokenRepository.findByAppUserAndExpiresAtAfter(user, LocalDateTime.now());
            tokens.stream()
                .sorted((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()))
                .limit(tokenCount - maxTokensPerUser + 1)
                .forEach(refreshTokenRepository::delete);
        }
    }

    private String generateSecureToken() {
        byte[] tokenBytes = new byte[32];
        secureRandom.nextBytes(tokenBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Failed to hash refresh token", e);
        }
    }

    private boolean isDifferentDevice(RefreshToken token, String userAgent, String ipAddress) {
        return (token.getUserAgent() != null && !token.getUserAgent().equals(userAgent)) ||
               (token.getIpAddress() != null && !token.getIpAddress().equals(ipAddress));
    }

    @Scheduled(fixedRate = 3600000) // Run every hour
    @Transactional
    public void cleanupExpiredTokens() {
        int deletedCount = refreshTokenRepository.deleteExpiredTokens(LocalDateTime.now());
        if (deletedCount > 0) {
            log.info("Cleaned up {} expired refresh tokens", deletedCount);
        }
    }
}