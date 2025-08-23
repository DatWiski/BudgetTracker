package com.example.budgettracker.security;

import com.example.budgettracker.model.AppUser;
import com.example.budgettracker.service.AppUserService;
import com.example.budgettracker.service.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final AppUserService appUserService;
    private final ObjectMapper objectMapper;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                      Authentication authentication) throws IOException, jakarta.servlet.ServletException {
        
        if (authentication.getPrincipal() instanceof OidcUser oidcUser) {
            try {
                // Get or create the AppUser
                AppUser user = appUserService.findByGoogleSub(oidcUser.getSubject())
                        .orElseThrow(() -> new RuntimeException("User not found after OAuth"));

                // Generate JWT token
                String token = jwtService.generateToken(user);

                // Store token and user info in query params and redirect to frontend
                String userJson = objectMapper.writeValueAsString(Map.of(
                    "id", user.getId(),
                    "email", user.getEmail(),
                    "name", user.getFullName()
                ));
                
                String redirectUrl = String.format("/?token=%s&user=%s", 
                    token,
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
}