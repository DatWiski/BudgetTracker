package com.example.budgettracker.controller;

import com.example.budgettracker.model.AppUser;
import com.example.budgettracker.repository.AppUserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@Tag(name = "User", description = "User profile and settings operations")
public class UserController {

    private final AppUserRepository appUserRepository;

    @GetMapping("/currency")
    @Operation(summary = "Get user currency", description = "Retrieves the currency preference for the authenticated user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Currency retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "User not authenticated")
    })
    public ResponseEntity<?> getUserCurrency(@Parameter(hidden = true) AppUser appUser) {
        return ResponseEntity.ok(Map.of("currency", appUser.getCurrency()));
    }

    @PutMapping("/currency")
    @Operation(summary = "Update user currency", description = "Updates the currency preference for the authenticated user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Currency updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid currency provided"),
            @ApiResponse(responseCode = "401", description = "User not authenticated")
    })
    public ResponseEntity<?> updateUserCurrency(
            @Parameter(hidden = true) AppUser appUser,
            @RequestBody Map<String, String> request) {
        String currency = request.get("currency");

        if (currency == null || (!currency.equals("USD") && !currency.equals("EUR"))) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid currency"));
        }

        appUser.setCurrency(currency);
        appUserRepository.save(appUser);
        return ResponseEntity.ok(Map.of("message", "Currency updated successfully"));
    }
}
