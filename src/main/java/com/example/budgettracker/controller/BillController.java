package com.example.budgettracker.controller;

import com.example.budgettracker.dto.BillRequest;
import com.example.budgettracker.dto.BillResponse;
import com.example.budgettracker.model.AppUser;
import com.example.budgettracker.model.Bill;
import com.example.budgettracker.service.BillService;
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
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/bills")
@RequiredArgsConstructor
@Tag(name = "Bills", description = "Bill management operations")
public class BillController {
    private final BillService billService;
    private final PeriodCalculationService periodCalculationService;

    @PostMapping
    @Operation(summary = "Create a new bill", description = "Creates a new bill for the authenticated user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Bill created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data"),
            @ApiResponse(responseCode = "401", description = "User not authenticated")
    })
    public ResponseEntity<BillResponse> addBill(
            @RequestBody(description = "Bill details", required = true) @Valid @org.springframework.web.bind.annotation.RequestBody BillRequest billRequest,
            @Parameter(hidden = true) AppUser appUser) {
        Bill saved = billService.saveBillForUser(billRequest, appUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(BillResponse.fromEntity(saved, periodCalculationService));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a bill", description = "Updates an existing bill for the authenticated user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Bill updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data"),
            @ApiResponse(responseCode = "401", description = "User not authenticated"),
            @ApiResponse(responseCode = "404", description = "Bill not found")
    })
    public ResponseEntity<BillResponse> updateBill(
            @Parameter(description = "Bill ID") @PathVariable Long id,
            @RequestBody(description = "Updated bill details", required = true) @Valid @org.springframework.web.bind.annotation.RequestBody BillRequest billRequest,
            @Parameter(hidden = true) AppUser appUser) {
        Bill updated = billService.updateBillForUser(id, billRequest, appUser);
        return ResponseEntity.ok(BillResponse.fromEntity(updated, periodCalculationService));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a bill", description = "Deletes a bill for the authenticated user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Bill deleted successfully"),
            @ApiResponse(responseCode = "401", description = "User not authenticated"),
            @ApiResponse(responseCode = "404", description = "Bill not found")
    })
    public ResponseEntity<Void> deleteBill(
            @Parameter(description = "Bill ID") @PathVariable Long id,
            @Parameter(hidden = true) AppUser appUser) {
        billService.deleteBillForUser(id, appUser);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @Operation(summary = "List bills", description = "Retrieves a paginated list of bills for the authenticated user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Bills retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "User not authenticated")
    })
    public ResponseEntity<Page<BillResponse>> listBills(
            @Parameter(hidden = true) AppUser appUser,
            @Parameter(description = "Pagination parameters") @PageableDefault(size = 20, sort = "name") Pageable pageable) {
        Page<BillResponse> response = billService.getBillsForUser(appUser, pageable)
                .map(bill -> BillResponse.fromEntity(bill, periodCalculationService));
        return ResponseEntity.ok(response);
    }
}