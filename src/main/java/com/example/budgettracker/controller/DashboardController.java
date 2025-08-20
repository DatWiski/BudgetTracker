package com.example.budgettracker.controller;

import com.example.budgettracker.dto.DashboardOverviewResponse;
import com.example.budgettracker.model.AppUser;
import com.example.budgettracker.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Dashboard analytics and financial overview")
public class DashboardController {
    
    private final DashboardService dashboardService;

    @GetMapping("/overview")
    @Operation(summary = "Get financial overview", description = "Returns basic financial metrics: total income vs total expenses")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Overview retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "User not authenticated")
    })
    public ResponseEntity<DashboardOverviewResponse> getOverview(
            @Parameter(hidden = true) AppUser appUser) {
        DashboardOverviewResponse overview = dashboardService.getFinancialOverview(appUser);
        return ResponseEntity.ok(overview);
    }
}