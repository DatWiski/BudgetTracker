package com.example.budgettracker.config;

import com.example.budgettracker.service.GoogleOidcUserService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.http.HttpStatus;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.beans.factory.annotation.Value;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;
    
    @Value("${app.security.csrf.cookie-secure:false}")
    private boolean csrfCookieSecure;


    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, GoogleOidcUserService googleUserService) throws Exception {
        CsrfTokenRequestAttributeHandler requestHandler = new CsrfTokenRequestAttributeHandler();
        requestHandler.setCsrfRequestAttributeName("_csrf");

        // Configure CSRF repository with hardened cookie attributes (HttpOnly)
        CookieCsrfTokenRepository csrfRepository = new CookieCsrfTokenRepository();
        csrfRepository.setCookieCustomizer(builder -> builder
                .sameSite("Lax")
                .secure(csrfCookieSecure)
                .path("/")
                .httpOnly(true)
        );

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf
                        .csrfTokenRepository(csrfRepository)
                        .csrfTokenRequestHandler(requestHandler)
                        .ignoringRequestMatchers("/api/auth/status", "/api/csrf-token")
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/status", "/api/csrf-token").permitAll()
                        .requestMatchers("/login", "/oauth-complete", "/oauth2/**", "/static/**", "/*.js", "/*.css", "/*.ico", "/*.png", "/*.svg", "/assets/**").permitAll()
                        .requestMatchers("/api/**").authenticated()
                        .anyRequest().authenticated()
                )
                .headers(headers -> {
                    // Security headers
                    headers.contentSecurityPolicy(csp -> csp
                            .policyDirectives("default-src 'self'; img-src 'self' https: data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; font-src 'self' data:"));
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
                        .defaultSuccessUrl("/", true)
                        .failureUrl("/login?error=oauth_failed")
                        .userInfoEndpoint(u -> u.oidcUserService(googleUserService))
                )
                .formLogin(form -> form.disable())
                .logout(l -> l
                        .logoutUrl("/logout")
                        .logoutSuccessUrl("/login")
                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID")
                );

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
            "X-CSRF-TOKEN",
            "X-XSRF-TOKEN",
            "Cache-Control"
        ));
        cfg.setExposedHeaders(List.of("X-CSRF-TOKEN"));
        cfg.setAllowCredentials(true);
        cfg.setMaxAge(3600L); // Cache preflight responses for 1 hour

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }


}