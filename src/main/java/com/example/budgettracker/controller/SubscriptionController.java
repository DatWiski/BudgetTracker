package com.example.budgettracker.controller;

import com.example.budgettracker.dto.SubscriptionRequest;
import com.example.budgettracker.dto.SubscriptionResponse;
import com.example.budgettracker.model.AppUser;
import com.example.budgettracker.model.Subscription;
import com.example.budgettracker.service.SubscriptionService;
import com.example.budgettracker.service.PeriodCalculationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
@Tag(name = "Subscriptions", description = "Subscription management operations")
public class SubscriptionController {
    private final SubscriptionService subscriptionService;
    private final PeriodCalculationService periodCalculationService;

    @PostMapping
    @Operation(summary = "Create a new subscription", description = "Creates a new subscription for the authenticated user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Subscription created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data"),
            @ApiResponse(responseCode = "401", description = "User not authenticated")
    })
    public ResponseEntity<SubscriptionResponse> addSubscription(
            @RequestBody(description = "Subscription details", required = true)
            @Valid @org.springframework.web.bind.annotation.RequestBody SubscriptionRequest subscriptionRequest,
            @Parameter(hidden = true) AppUser appUser) {
        Subscription saved = subscriptionService.saveSubscriptionForUser(subscriptionRequest, appUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(SubscriptionResponse.fromEntity(saved, periodCalculationService));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a subscription", description = "Updates an existing subscription for the authenticated user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Subscription updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data"),
            @ApiResponse(responseCode = "401", description = "User not authenticated"),
            @ApiResponse(responseCode = "404", description = "Subscription not found")
    })
    public ResponseEntity<SubscriptionResponse> updateSubscription(
            @Parameter(description = "Subscription ID") @PathVariable Long id,
            @RequestBody(description = "Updated subscription details", required = true)
            @Valid @org.springframework.web.bind.annotation.RequestBody SubscriptionRequest subscriptionRequest,
            @Parameter(hidden = true) AppUser appUser) {
        Subscription updated = subscriptionService.updateSubscriptionForUser(id, subscriptionRequest, appUser);
        return ResponseEntity.ok(SubscriptionResponse.fromEntity(updated, periodCalculationService));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a subscription", description = "Deletes a subscription for the authenticated user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Subscription deleted successfully"),
            @ApiResponse(responseCode = "401", description = "User not authenticated"),
            @ApiResponse(responseCode = "404", description = "Subscription not found")
    })
    public ResponseEntity<Void> deleteSubscription(
            @Parameter(description = "Subscription ID") @PathVariable Long id,
            @Parameter(hidden = true) AppUser appUser) {
        subscriptionService.deleteSubscriptionForUser(id, appUser);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @Operation(summary = "List subscriptions", description = "Retrieves a paginated list of subscriptions for the authenticated user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Subscriptions retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "User not authenticated")
    })
    public ResponseEntity<Page<SubscriptionResponse>> listSubscriptions(
            @Parameter(hidden = true) AppUser appUser,
            @Parameter(description = "Pagination parameters") @PageableDefault(size = 20, sort = "name") Pageable pageable) {
        Page<SubscriptionResponse> response = subscriptionService.getSubscriptionsForUser(appUser, pageable)
                .map(subscription -> SubscriptionResponse.fromEntity(subscription, periodCalculationService));
        return ResponseEntity.ok(response);
    }
}
