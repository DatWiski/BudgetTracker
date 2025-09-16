package com.example.budgettracker.controller;

import com.example.budgettracker.dto.AuthStatusResponse;
import com.example.budgettracker.dto.ErrorResponse;
import com.example.budgettracker.dto.LogoutResponse;
import com.example.budgettracker.dto.TokenPair;
import com.example.budgettracker.dto.TokenRefreshResponse;
import com.example.budgettracker.model.AppUser;
import com.example.budgettracker.service.AppUserService;
import com.example.budgettracker.service.JwtService;
import com.example.budgettracker.service.RefreshTokenService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.time.LocalDateTime;
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

  @GetMapping({"/status", "/v0/status"})
  public ResponseEntity<AuthStatusResponse> getAuthStatus() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

    AuthStatusResponse response;
    if (authentication != null
        && authentication.isAuthenticated()
        && !authentication.getName().equals(ANONYMOUS_USER)) {
      response = new AuthStatusResponse(true, authentication.getName());
    } else {
      response = new AuthStatusResponse(false, null);
    }

    // Only add debug info in dev profile
    if ("dev".equalsIgnoreCase(activeProfile)) {
      response.setEnv("dev");
    }

    return ResponseEntity.ok(response);
  }

  @PostMapping("/refresh")
  public ResponseEntity<?> refreshToken(
      @CookieValue(value = REFRESH_TOKEN_COOKIE, required = false) String refreshToken,
      HttpServletRequest request,
      HttpServletResponse response) {

    if (refreshToken == null || refreshToken.trim().isEmpty()) {
      return ResponseEntity.badRequest()
          .body(
              new ErrorResponse(
                  400, "Bad Request", "No refresh token provided", LocalDateTime.now()));
    }

    try {
      String userAgent = request.getHeader("User-Agent");
      String ipAddress = getClientIpAddress(request);

      Optional<TokenPair> tokenPairOpt =
          refreshTokenService.refreshAccessToken(refreshToken, userAgent, ipAddress);

      if (tokenPairOpt.isEmpty()) {
        clearRefreshTokenCookie(response);
        return ResponseEntity.status(401)
            .body(
                new ErrorResponse(
                    401, "Unauthorized", "Invalid or expired refresh token", LocalDateTime.now()));
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

      TokenRefreshResponse.UserInfo userInfo =
          new TokenRefreshResponse.UserInfo(user.getId(), user.getEmail(), user.getFullName());

      return ResponseEntity.ok(
          new TokenRefreshResponse(
              tokenPair.getAccessToken(), tokenPair.getAccessTokenExpiresIn(), userInfo));

    } catch (Exception e) {
      clearRefreshTokenCookie(response);
      return ResponseEntity.status(401)
          .body(
              new ErrorResponse(401, "Unauthorized", "Token refresh failed", LocalDateTime.now()));
    }
  }

  @PostMapping("/logout")
  public ResponseEntity<LogoutResponse> logout(
      @CookieValue(value = REFRESH_TOKEN_COOKIE, required = false) String refreshToken,
      HttpServletResponse response) {

    if (refreshToken != null) {
      refreshTokenService.revokeRefreshToken(refreshToken);
    }

    clearRefreshTokenCookie(response);

    return ResponseEntity.ok(new LogoutResponse("Logged out successfully"));
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
