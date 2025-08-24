package com.example.budgettracker.config;

import com.example.budgettracker.service.GoogleOidcUserService;
import com.example.budgettracker.security.JwtAuthenticationSuccessHandler;
import com.example.budgettracker.security.JwtAuthenticationFilter;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.http.HttpStatus;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.EnableScheduling;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
@EnableScheduling
public class SecurityConfig {

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;


    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, GoogleOidcUserService googleUserService, 
                                         JwtAuthenticationSuccessHandler jwtSuccessHandler,
                                         JwtAuthenticationFilter jwtFilter) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/status", "/api/auth/refresh").permitAll()
                        .requestMatchers("/", "/login", "/oauth-complete", "/oauth2/**", "/static/**", "/*.js", "/*.css", "/*.ico", "/*.png", "/*.svg", "/assets/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**", "/v3/api-docs").permitAll()
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().authenticated()
                )
                .headers(headers -> {
                    // Security headers
                    headers.contentSecurityPolicy(csp -> csp
                            .policyDirectives("default-src 'self'; img-src 'self' https: data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; font-src 'self' data:"));
                    headers.httpStrictTransportSecurity(hsts -> hsts
                            .includeSubDomains(true)
                            .preload(true));
                    headers.referrerPolicy(rp -> rp.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.NO_REFERRER));
                })
                .exceptionHandling(ex -> ex
                        .defaultAuthenticationEntryPointFor(
                                new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
                                PathPatternRequestMatcher.withDefaults().matcher("/api/**")
                        )
                        .authenticationEntryPoint((request, response, authException) -> {
                            if (!request.getRequestURI().startsWith("/api/")) {
                                response.sendRedirect("/login");
                            } else {
                                response.setStatus(HttpStatus.UNAUTHORIZED.value());
                            }
                        })
                )
                .oauth2Login(o -> o
                        .loginPage("/login")
                        .successHandler(jwtSuccessHandler)
                        .failureUrl("/login?error=oauth_failed")
                        .userInfoEndpoint(u -> u.oidcUserService(googleUserService))
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .formLogin(form -> form.disable())
                .logout(logout -> logout.disable());

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        List<String> origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
        cfg.setAllowedOrigins(origins);
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        cfg.setAllowedHeaders(List.of(
            "Authorization", 
            "Content-Type", 
            "Accept", 
            "X-Requested-With",
            "Cache-Control"
        ));
        cfg.setAllowCredentials(true); // Enable credentials for cookies
        cfg.setMaxAge(3600L); // Cache preflight responses for 1 hour

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }


}