package com.example.subtrackerproject.controller;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

import java.io.IOException;
import java.nio.file.Files;

@Controller
public class SpaController {

    // Forward all non-API routes to index.html for React Router
    @GetMapping(value = {"/", "/login", "/subscriptions", "/bills", "/income", "/settings", "/{path:^(?!api|h2-console|oauth2).*$}"})
    public ResponseEntity<byte[]> forward() throws IOException {
        Resource resource = new ClassPathResource("static/index.html");
        byte[] content = Files.readAllBytes(resource.getFile().toPath());
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(content);
    }
} 