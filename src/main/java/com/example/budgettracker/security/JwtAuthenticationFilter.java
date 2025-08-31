package com.example.budgettracker.security;

import com.example.budgettracker.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private final JwtService jwtService;

  public JwtAuthenticationFilter(JwtService jwtService) {
    this.jwtService = jwtService;
  }

  @Override
  protected void doFilterInternal(
      @NonNull HttpServletRequest request,
      @NonNull HttpServletResponse response,
      @NonNull FilterChain filterChain)
      throws ServletException, IOException {

    String authHeader = request.getHeader("Authorization");

    if (authHeader != null && authHeader.startsWith("Bearer ")) {
      try {
        String token = authHeader.substring(7);
        Jwt jwt = jwtService.validateToken(token);

        // Create authentication with Google sub as principal
        String googleSub = jwt.getSubject();
        List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_USER"));

        Authentication auth = new UsernamePasswordAuthenticationToken(googleSub, null, authorities);
        SecurityContextHolder.getContext().setAuthentication(auth);

      } catch (Exception e) {
        // Log the error but don't block the request - let it continue unauthenticated
        logger.debug("JWT validation failed: " + e.getMessage());
      }
    }

    filterChain.doFilter(request, response);
  }
}
