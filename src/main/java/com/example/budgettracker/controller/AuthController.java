package com.example.budgettracker.controller;

import com.example.budgettracker.dto.TokenPair;
import com.example.budgettracker.model.AppUser;
import com.example.budgettracker.service.AppUserService;
import com.example.budgettracker.service.JwtService;
import com.example.budgettracker.service.RefreshTokenService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

  private final JwtService jwtService;
  private final AppUserService appUserService;
  private final RefreshTokenService refreshTokenService;

  private static final String ANONYMOUS_USER = "anonymousUser";

  @Value("${spring.profiles.active:}")
  private String activeProfile;

  @Value("${app.security.cookie.secure:true}")
  private boolean cookieSecure;

  @Value("${app.security.cookie.same-site:Strict}")
  private String cookieSameSite;

  private static final String REFRESH_TOKEN_COOKIE = "refresh_token";
  private static final int REFRESH_TOKEN_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

  @GetMapping("/status")
  public ResponseEntity<Map<String, Object>> getAuthStatus() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    Map<String, Object> response = new HashMap<>();

    if (authentication != null
        && authentication.isAuthenticated()
        && !authentication.getName().equals(ANONYMOUS_USER)) {
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
  public ResponseEntity<?> refreshToken(
      @CookieValue(value = REFRESH_TOKEN_COOKIE, required = false) String refreshToken,
      HttpServletRequest request,
      HttpServletResponse response) {

    if (refreshToken == null || refreshToken.trim().isEmpty()) {
      return ResponseEntity.badRequest().body(Map.of("error", "No refresh token provided"));
    }

    try {
      String userAgent = request.getHeader("User-Agent");
      String ipAddress = getClientIpAddress(request);

      Optional<TokenPair> tokenPairOpt =
          refreshTokenService.refreshAccessToken(refreshToken, userAgent, ipAddress);

      if (tokenPairOpt.isEmpty()) {
        clearRefreshTokenCookie(response);
        return ResponseEntity.status(401).body(Map.of("error", "Invalid or expired refresh token"));
      }

      TokenPair tokenPair = tokenPairOpt.get();

      // Set new refresh token in HttpOnly cookie
      setRefreshTokenCookie(response, tokenPair.getRefreshToken());

      // Get user info for response
      String googleSub = jwtService.extractGoogleSub(tokenPair.getAccessToken());
      AppUser user =
          appUserService
              .findByGoogleSub(googleSub)
              .orElseThrow(() -> new RuntimeException("User not found"));

      return ResponseEntity.ok(
          Map.of(
              "accessToken", tokenPair.getAccessToken(),
              "expiresIn", tokenPair.getAccessTokenExpiresIn(),
              "user",
                  Map.of(
                      "id", user.getId(),
                      "email", user.getEmail(),
                      "name", user.getFullName())));

    } catch (Exception e) {
      clearRefreshTokenCookie(response);
      return ResponseEntity.status(401).body(Map.of("error", "Token refresh failed"));
    }
  }

  @PostMapping("/logout")
  public ResponseEntity<?> logout(
      @CookieValue(value = REFRESH_TOKEN_COOKIE, required = false) String refreshToken,
      HttpServletResponse response) {

    if (refreshToken != null) {
      refreshTokenService.revokeRefreshToken(refreshToken);
    }

    clearRefreshTokenCookie(response);

    return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
  }

  private void setRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
    Cookie cookie = new Cookie(REFRESH_TOKEN_COOKIE, refreshToken);
    cookie.setHttpOnly(true);
    cookie.setSecure(cookieSecure); // Profile-dependent security
    cookie.setPath("/");
    cookie.setMaxAge(REFRESH_TOKEN_COOKIE_MAX_AGE);
    cookie.setAttribute("SameSite", cookieSameSite);
    response.addCookie(cookie);
  }

  private void clearRefreshTokenCookie(HttpServletResponse response) {
    Cookie cookie = new Cookie(REFRESH_TOKEN_COOKIE, "");
    cookie.setHttpOnly(true);
    cookie.setSecure(cookieSecure); // Profile-dependent security
    cookie.setPath("/");
    cookie.setMaxAge(0); // Expire immediately
    response.addCookie(cookie);
  }

  private String getClientIpAddress(HttpServletRequest request) {
    String xForwardedFor = request.getHeader("X-Forwarded-For");
    if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
      return xForwardedFor.split(",")[0].trim();
    }

    String xRealIP = request.getHeader("X-Real-IP");
    if (xRealIP != null && !xRealIP.isEmpty()) {
      return xRealIP;
    }

    return request.getRemoteAddr();
  }
}
