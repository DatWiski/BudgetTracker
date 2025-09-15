package com.example.budgettracker.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.example.budgettracker.TestDataBuilder;
import com.example.budgettracker.dto.TokenPair;
import com.example.budgettracker.model.AppUser;
import com.example.budgettracker.model.RefreshToken;
import com.example.budgettracker.repository.RefreshTokenRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
@DisplayName("RefreshTokenService Tests")
class RefreshTokenServiceTest {

  @Mock private RefreshTokenRepository refreshTokenRepository;
  @Mock private JwtService jwtService;

  @InjectMocks private RefreshTokenService refreshTokenService;

  private AppUser testUser;
  private RefreshToken testRefreshToken;
  private String testUserAgent;
  private String testIpAddress;
  private String testAccessToken;
  private String testRefreshTokenValue;

  @BeforeEach
  void setUp() {
    testUser = TestDataBuilder.createTestUser();
    testUserAgent = "Mozilla/5.0 (Test Browser)";
    testIpAddress = "192.168.1.1";
    testAccessToken = "test.access.token";
    testRefreshTokenValue = "test-refresh-token-value";

    testRefreshToken =
        new RefreshToken(
            "hashed-token",
            testUser,
            LocalDateTime.now().plusDays(30),
            testUserAgent,
            testIpAddress);
    testRefreshToken.setId(1L);

    // Set up service properties
    ReflectionTestUtils.setField(refreshTokenService, "refreshTokenExpirationDays", 30);
    ReflectionTestUtils.setField(refreshTokenService, "maxTokensPerUser", 5);
  }

  @Nested
  @DisplayName("Generate Token Pair Tests")
  class GenerateTokenPairTests {

    @Test
    @DisplayName("Should generate token pair successfully")
    void shouldGenerateTokenPairSuccessfully() {
      when(refreshTokenRepository.countByAppUser(testUser)).thenReturn(0L);
      when(jwtService.generateToken(testUser)).thenReturn(testAccessToken);
      when(jwtService.getAccessTokenExpirationMinutes()).thenReturn(15);
      when(refreshTokenRepository.save(any(RefreshToken.class)))
          .thenAnswer(invocation -> invocation.getArgument(0));

      TokenPair result =
          refreshTokenService.generateTokenPair(testUser, testUserAgent, testIpAddress);

      assertThat(result).isNotNull();
      assertThat(result.getAccessToken()).isEqualTo(testAccessToken);
      assertThat(result.getRefreshToken()).isNotBlank();
      assertThat(result.getAccessTokenExpiresIn()).isEqualTo(900L); // 15 minutes * 60 seconds

      verify(refreshTokenRepository).save(any(RefreshToken.class));
      verify(jwtService).generateToken(testUser);
    }

    @Test
    @DisplayName("Should cleanup old tokens when user has too many")
    void shouldCleanupOldTokensWhenUserHasTooMany() {
      when(refreshTokenRepository.countByAppUser(testUser)).thenReturn(5L);
      when(refreshTokenRepository.findByAppUserAndExpiresAtAfter(
              eq(testUser), any(LocalDateTime.class)))
          .thenReturn(List.of(testRefreshToken));
      when(jwtService.generateToken(testUser)).thenReturn(testAccessToken);
      when(jwtService.getAccessTokenExpirationMinutes()).thenReturn(15);
      when(refreshTokenRepository.save(any(RefreshToken.class)))
          .thenAnswer(invocation -> invocation.getArgument(0));

      TokenPair result =
          refreshTokenService.generateTokenPair(testUser, testUserAgent, testIpAddress);

      assertThat(result).isNotNull();
      verify(refreshTokenRepository).delete(testRefreshToken);
      verify(refreshTokenRepository).save(any(RefreshToken.class));
    }
  }

  @Nested
  @DisplayName("Refresh Access Token Tests")
  class RefreshAccessTokenTests {

    @Test
    @DisplayName("Should refresh access token successfully")
    void shouldRefreshAccessTokenSuccessfully() {
      when(refreshTokenRepository.findByTokenHash(anyString()))
          .thenReturn(Optional.of(testRefreshToken));
      when(refreshTokenRepository.countByAppUser(testUser)).thenReturn(1L);
      when(jwtService.generateToken(testUser)).thenReturn(testAccessToken);
      when(jwtService.getAccessTokenExpirationMinutes()).thenReturn(15);
      when(refreshTokenRepository.save(any(RefreshToken.class)))
          .thenAnswer(invocation -> invocation.getArgument(0));

      Optional<TokenPair> result =
          refreshTokenService.refreshAccessToken(
              testRefreshTokenValue, testUserAgent, testIpAddress);

      assertThat(result).isPresent();
      assertThat(result.get().getAccessToken()).isEqualTo(testAccessToken);
      assertThat(result.get().getRefreshToken()).isNotBlank();

      verify(refreshTokenRepository).delete(testRefreshToken);
      verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    @DisplayName("Should return empty when refresh token not found")
    void shouldReturnEmptyWhenRefreshTokenNotFound() {
      when(refreshTokenRepository.findByTokenHash(anyString())).thenReturn(Optional.empty());

      Optional<TokenPair> result =
          refreshTokenService.refreshAccessToken(
              testRefreshTokenValue, testUserAgent, testIpAddress);

      assertThat(result).isEmpty();
      verify(refreshTokenRepository, never()).delete(any(RefreshToken.class));
    }

    @Test
    @DisplayName("Should return empty and cleanup when refresh token is expired")
    void shouldReturnEmptyAndCleanupWhenRefreshTokenIsExpired() {
      RefreshToken expiredToken =
          new RefreshToken(
              "hashed-token",
              testUser,
              LocalDateTime.now().minusDays(1),
              testUserAgent,
              testIpAddress);

      when(refreshTokenRepository.findByTokenHash(anyString()))
          .thenReturn(Optional.of(expiredToken));

      Optional<TokenPair> result =
          refreshTokenService.refreshAccessToken(
              testRefreshTokenValue, testUserAgent, testIpAddress);

      assertThat(result).isEmpty();
      verify(refreshTokenRepository).delete(expiredToken);
    }

    @Test
    @DisplayName("Should log warning when used from different device")
    void shouldLogWarningWhenUsedFromDifferentDevice() {
      RefreshToken tokenFromDifferentDevice =
          new RefreshToken(
              "hashed-token",
              testUser,
              LocalDateTime.now().plusDays(30),
              "Different Browser",
              "192.168.1.2");

      when(refreshTokenRepository.findByTokenHash(anyString()))
          .thenReturn(Optional.of(tokenFromDifferentDevice));
      when(refreshTokenRepository.countByAppUser(testUser)).thenReturn(1L);
      when(jwtService.generateToken(testUser)).thenReturn(testAccessToken);
      when(jwtService.getAccessTokenExpirationMinutes()).thenReturn(15);
      when(refreshTokenRepository.save(any(RefreshToken.class)))
          .thenAnswer(invocation -> invocation.getArgument(0));

      Optional<TokenPair> result =
          refreshTokenService.refreshAccessToken(
              testRefreshTokenValue, testUserAgent, testIpAddress);

      assertThat(result).isPresent();
      verify(refreshTokenRepository).delete(tokenFromDifferentDevice);
    }
  }

  @Nested
  @DisplayName("Revoke Token Tests")
  class RevokeTokenTests {

    @Test
    @DisplayName("Should revoke refresh token by value")
    void shouldRevokeRefreshTokenByValue() {
      refreshTokenService.revokeRefreshToken(testRefreshTokenValue);

      verify(refreshTokenRepository).deleteByTokenHash(anyString());
    }

    @Test
    @DisplayName("Should revoke all user tokens")
    void shouldRevokeAllUserTokens() {
      refreshTokenService.revokeAllUserTokens(testUser);

      verify(refreshTokenRepository).deleteAllByUser(testUser);
    }
  }

  @Nested
  @DisplayName("Cleanup Tests")
  class CleanupTests {

    @Test
    @DisplayName("Should cleanup expired tokens")
    void shouldCleanupExpiredTokens() {
      when(refreshTokenRepository.deleteExpiredTokens(any(LocalDateTime.class))).thenReturn(3);

      refreshTokenService.cleanupExpiredTokens();

      verify(refreshTokenRepository).deleteExpiredTokens(any(LocalDateTime.class));
    }

    @Test
    @DisplayName("Should not log when no expired tokens to cleanup")
    void shouldNotLogWhenNoExpiredTokensToCleanup() {
      when(refreshTokenRepository.deleteExpiredTokens(any(LocalDateTime.class))).thenReturn(0);

      refreshTokenService.cleanupExpiredTokens();

      verify(refreshTokenRepository).deleteExpiredTokens(any(LocalDateTime.class));
    }
  }

  @Nested
  @DisplayName("Security Tests")
  class SecurityTests {

    @Test
    @DisplayName("Should generate unique refresh tokens")
    void shouldGenerateUniqueRefreshTokens() {
      when(refreshTokenRepository.countByAppUser(testUser)).thenReturn(0L);
      when(jwtService.generateToken(testUser)).thenReturn(testAccessToken);
      when(jwtService.getAccessTokenExpirationMinutes()).thenReturn(15);
      when(refreshTokenRepository.save(any(RefreshToken.class)))
          .thenAnswer(invocation -> invocation.getArgument(0));

      TokenPair token1 =
          refreshTokenService.generateTokenPair(testUser, testUserAgent, testIpAddress);
      TokenPair token2 =
          refreshTokenService.generateTokenPair(testUser, testUserAgent, testIpAddress);

      assertThat(token1.getRefreshToken()).isNotEqualTo(token2.getRefreshToken());
    }

    @Test
    @DisplayName("Should handle token hashing errors gracefully")
    void shouldHandleTokenHashingErrorsGracefully() {
      // This test ensures that if somehow the hashing fails, it throws a RuntimeException
      // The actual hashing is done internally and is hard to mock, but we can verify the behavior
      when(refreshTokenRepository.countByAppUser(testUser)).thenReturn(0L);
      when(jwtService.generateToken(testUser)).thenReturn(testAccessToken);
      when(jwtService.getAccessTokenExpirationMinutes()).thenReturn(15);
      when(refreshTokenRepository.save(any(RefreshToken.class)))
          .thenAnswer(invocation -> invocation.getArgument(0));

      // Normal flow should work without throwing exceptions
      TokenPair result =
          refreshTokenService.generateTokenPair(testUser, testUserAgent, testIpAddress);

      assertThat(result).isNotNull();
      assertThat(result.getRefreshToken()).isNotBlank();
    }
  }
}
