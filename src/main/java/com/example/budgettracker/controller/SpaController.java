package com.example.budgettracker.controller;

import io.swagger.v3.oas.annotations.Hidden;
import java.io.IOException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@Hidden
public class SpaController {

  @Value("${spring.profiles.active:default}")
  private String activeProfile;

  // In development: redirect root to Swagger UI
  // In production: serve React app for all routes
  @GetMapping("/")
  public ResponseEntity<?> handleRoot() throws IOException {
    // Development: redirect to Swagger UI
    if (!"prod".equals(activeProfile)) {
      HttpHeaders headers = new HttpHeaders();
      headers.add("Location", "/swagger-ui/index.html");
      return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }

    // Production: serve React app
    Resource resource = new ClassPathResource("static/index.html");
    byte[] content = resource.getInputStream().readAllBytes();
    return ResponseEntity.ok().contentType(MediaType.TEXT_HTML).body(content);
  }

  // Production only: Forward other non-API routes to index.html for React Router
  @GetMapping(
      value = {
        "/login",
        "/subscriptions",
        "/bills",
        "/income",
        "/settings",
        "/{path:^(?!api|oauth2|oauth-complete|swagger-ui).*$}"
      })
  public ResponseEntity<byte[]> forward() throws IOException {
    // Only serve React routes in production
    if (!"prod".equals(activeProfile)) {
      return ResponseEntity.notFound().build();
    }

    Resource resource = new ClassPathResource("static/index.html");
    byte[] content = resource.getInputStream().readAllBytes();
    return ResponseEntity.ok().contentType(MediaType.TEXT_HTML).body(content);
  }
}
