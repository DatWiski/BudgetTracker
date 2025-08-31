package com.example.budgettracker.controller;

import java.io.IOException;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

  // Forward all non-API routes to index.html for React Router
  // Note: /oauth-complete is handled by OAuthController, not SPA
  @GetMapping(
      value = {
        "/",
        "/login",
        "/subscriptions",
        "/bills",
        "/income",
        "/settings",
        "/{path:^(?!api|oauth2|oauth-complete).*$}"
      })
  public ResponseEntity<byte[]> forward() throws IOException {
    Resource resource = new ClassPathResource("static/index.html");
    byte[] content = resource.getInputStream().readAllBytes();
    return ResponseEntity.ok().contentType(MediaType.TEXT_HTML).body(content);
  }
}
