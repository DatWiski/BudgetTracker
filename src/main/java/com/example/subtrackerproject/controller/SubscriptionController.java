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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
            @AuthenticationPrincipal(expression = "subject") String sub) {

        var appUser = appUserService.findByGoogleSub(sub)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "User not found"));

        Subscription saved = subscriptionService.saveSubscriptionForUser(subscriptionRequest, appUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(SubscriptionResponse.fromEntity(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubscriptionResponse> updateSubscription(
            @PathVariable Long id,
            @Valid @RequestBody SubscriptionRequest subscriptionRequest,
            @AuthenticationPrincipal(expression = "subject") String sub) {

        var appUser = appUserService.findByGoogleSub(sub)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        Subscription updated = subscriptionService.updateSubscriptionForUser(id, subscriptionRequest, appUser);
        return ResponseEntity.ok(SubscriptionResponse.fromEntity(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubscription(@PathVariable Long id,
                                                   @AuthenticationPrincipal(expression = "subject") String sub) {

        var appUser = appUserService.findByGoogleSub(sub)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        subscriptionService.deleteSubscriptionForUser(id, appUser);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<java.util.List<SubscriptionResponse>> listSubscriptions(@AuthenticationPrincipal(expression = "subject") String sub) {
        var appUser = appUserService.findByGoogleSub(sub)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        java.util.List<SubscriptionResponse> response = subscriptionService.getSubscriptionsForUser(appUser)
                .stream()
                .map(SubscriptionResponse::fromEntity)
                .toList();
        return ResponseEntity.ok(response);
    }
}
