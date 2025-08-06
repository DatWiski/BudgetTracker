package com.example.subtrackerproject.controller;

import com.example.subtrackerproject.dto.SubscriptionRequest;
import com.example.subtrackerproject.dto.SubscriptionResponse;
import com.example.subtrackerproject.model.AppUser;
import com.example.subtrackerproject.model.Subscription;
import com.example.subtrackerproject.service.SubscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {
    private final SubscriptionService subscriptionService;

    @PostMapping
    public ResponseEntity<SubscriptionResponse> addSubscription(
            @Valid @RequestBody SubscriptionRequest subscriptionRequest,
            AppUser appUser) {
        Subscription saved = subscriptionService.saveSubscriptionForUser(subscriptionRequest, appUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(SubscriptionResponse.fromEntity(saved));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubscriptionResponse> updateSubscription(
            @PathVariable Long id,
            @Valid @RequestBody SubscriptionRequest subscriptionRequest,
            AppUser appUser) {
        Subscription updated = subscriptionService.updateSubscriptionForUser(id, subscriptionRequest, appUser);
        return ResponseEntity.ok(SubscriptionResponse.fromEntity(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubscription(@PathVariable Long id, AppUser appUser) {
        subscriptionService.deleteSubscriptionForUser(id, appUser);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<SubscriptionResponse>> listSubscriptions(AppUser appUser) {
        List<SubscriptionResponse> response = subscriptionService.getSubscriptionsForUser(appUser)
                .stream()
                .map(SubscriptionResponse::fromEntity)
                .toList();
        return ResponseEntity.ok(response);
    }
}
