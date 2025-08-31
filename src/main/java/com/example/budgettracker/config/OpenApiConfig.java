package com.example.budgettracker.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

  @Bean
  public OpenAPI budgetTrackerOpenAPI() {
    return new OpenAPI()
        .info(
            new Info()
                .title("Budget Tracker API")
                .description("Personal Budget and Subscription Management API")
                .version("v0.0.1")
                .license(
                    new License().name("MIT License").url("https://opensource.org/licenses/MIT")))
        .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
        .addSecurityItem(new SecurityRequirement().addList("cookieAuth"))
        .components(
            new io.swagger.v3.oas.models.Components()
                .addSecuritySchemes(
                    "bearerAuth",
                    new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("JWT token authentication"))
                .addSecuritySchemes(
                    "cookieAuth",
                    new SecurityScheme()
                        .type(SecurityScheme.Type.APIKEY)
                        .in(SecurityScheme.In.COOKIE)
                        .name("JSESSIONID")
                        .description("Session cookie authentication")));
  }
}
