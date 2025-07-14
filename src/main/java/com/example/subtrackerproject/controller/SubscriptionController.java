package com.example.subtrackerproject.controller;

import com.example.subtrackerproject.dto.SubscriptionRequest;
import com.example.subtrackerproject.dto.SubscriptionResponse;
import com.example.subtrackerproject.model.Subscription;
import com.example.subtrackerproject.service.AppUserService;
import com.example.subtrackerproject.service.SubscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {
    private final SubscriptionService subscriptionService;
    private final AppUserService appUserService;


    @PostMapping
    public ResponseEntity<SubscriptionResponse> addSubscription(
            @Valid @RequestBody SubscriptionRequest subscriptionRequest,
            @AuthenticationPrincipal Jwt jwt) {

        var appUser = appUserService.findByGoogleSub(jwt.getSubject())   // <-- new helper
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "User not found"));

        Subscription saved = subscriptionService.saveSubscriptionForUser(subscriptionRequest, appUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(SubscriptionResponse.fromEntity(saved));
    }

}
