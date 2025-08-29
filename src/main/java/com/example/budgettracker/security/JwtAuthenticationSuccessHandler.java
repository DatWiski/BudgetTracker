package com.example.budgettracker.security;

import com.example.budgettracker.dto.TokenPair;
import com.example.budgettracker.model.AppUser;
import com.example.budgettracker.service.AppUserService;
import com.example.budgettracker.service.RefreshTokenService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final AppUserService appUserService;
    private final RefreshTokenService refreshTokenService;
    private final ObjectMapper objectMapper;
    
    @Value("${app.security.cookie.secure:true}")
    private boolean cookieSecure;
    
    @Value("${app.security.cookie.same-site:Strict}")
    private String cookieSameSite;
    
    private static final String REFRESH_TOKEN_COOKIE = "refresh_token";
    private static final int REFRESH_TOKEN_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                      Authentication authentication) throws IOException, jakarta.servlet.ServletException {
        
        if (authentication.getPrincipal() instanceof OidcUser oidcUser) {
            try {
                // Get or create the AppUser
                AppUser user = appUserService.findByGoogleSub(oidcUser.getSubject())
                        .orElseThrow(() -> new RuntimeException("User not found after OAuth"));

                // Generate token pair (access + refresh)
                String userAgent = request.getHeader("User-Agent");
                String ipAddress = getClientIpAddress(request);
                TokenPair tokenPair = refreshTokenService.generateTokenPair(user, userAgent, ipAddress);

                // Set refresh token in HttpOnly cookie
                setRefreshTokenCookie(response, tokenPair.getRefreshToken());
                
                // Store access token and user info in query params and redirect to frontend
                String userJson = objectMapper.writeValueAsString(Map.of(
                    "id", user.getId(),
                    "email", user.getEmail(),
                    "name", user.getFullName()
                ));
                
                String redirectUrl = String.format("/?token=%s&user=%s", 
                    tokenPair.getAccessToken(),
                    java.net.URLEncoder.encode(userJson, "UTF-8")
                );
                
                response.sendRedirect(redirectUrl);

            } catch (Exception e) {
                response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
                Map<String, String> errorResponse = Map.of("error", "Failed to generate token");
                response.setContentType("application/json");
                response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
            }
        } else {
            // Fallback to default behavior
            super.onAuthenticationSuccess(request, response, authentication);
        }
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