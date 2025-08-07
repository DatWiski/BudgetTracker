package com.example.budgettracker.controller;

import com.example.budgettracker.dto.SubscriptionRequest;
import com.example.budgettracker.dto.SubscriptionResponse;
import com.example.budgettracker.model.AppUser;
import com.example.budgettracker.model.Subscription;
import com.example.budgettracker.service.SubscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


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
    public ResponseEntity<Page<SubscriptionResponse>> listSubscriptions(
            AppUser appUser,
            @PageableDefault(size = 20, sort = "name") Pageable pageable) {
        Page<SubscriptionResponse> response = subscriptionService.getSubscriptionsForUser(appUser, pageable)
                .map(SubscriptionResponse::fromEntity);
        return ResponseEntity.ok(response);
    }
}
