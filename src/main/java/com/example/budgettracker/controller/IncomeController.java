package com.example.budgettracker.controller;

import com.example.budgettracker.dto.IncomeRequest;
import com.example.budgettracker.dto.IncomeResponse;
import com.example.budgettracker.model.AppUser;
import com.example.budgettracker.model.Income;
import com.example.budgettracker.service.IncomeService;
import com.example.budgettracker.service.PeriodCalculationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/income")
@RequiredArgsConstructor
@Tag(name = "Income", description = "Income management endpoints")
public class IncomeController {

  private final IncomeService incomeService;
  private final PeriodCalculationService periodCalculationService;

  private IncomeResponse mapToResponse(Income income) {
    LocalDate nextPaymentDate =
        periodCalculationService.getNextOccurrence(income.getIncomeDate(), income.getPeriod());
    return IncomeResponse.fromEntity(income, nextPaymentDate);
  }

  @GetMapping
  @Operation(summary = "Get all income entries for the authenticated user")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Income entries retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "User not authenticated")
      })
  public ResponseEntity<Page<IncomeResponse>> getIncomeEntries(
      @Parameter(description = "Authenticated user", hidden = true) AppUser user,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "20") int size,
      @RequestParam(defaultValue = "incomeDate") String sortBy,
      @RequestParam(defaultValue = "desc") String sortDir) {

    Sort.Direction direction =
        sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
    Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

    Page<Income> incomePage = incomeService.getIncomeForUser(user, pageable);
    Page<IncomeResponse> responsePage = incomePage.map(this::mapToResponse);

    return ResponseEntity.ok(responsePage);
  }

  @PostMapping
  @Operation(summary = "Create a new income entry")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "201", description = "Income entry created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "401", description = "User not authenticated")
      })
  public ResponseEntity<IncomeResponse> createIncome(
      @Parameter(description = "Authenticated user", hidden = true) AppUser user,
      @Valid @RequestBody IncomeRequest incomeRequest) {

    Income savedIncome = incomeService.saveIncomeForUser(incomeRequest, user);
    IncomeResponse response = mapToResponse(savedIncome);

    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  @PutMapping("/{id}")
  @Operation(summary = "Update an existing income entry")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Income entry updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "404", description = "Income entry not found")
      })
  public ResponseEntity<IncomeResponse> updateIncome(
      @Parameter(description = "Authenticated user", hidden = true) AppUser user,
      @PathVariable Long id,
      @Valid @RequestBody IncomeRequest incomeRequest) {

    Income updatedIncome = incomeService.updateIncomeForUser(id, incomeRequest, user);
    IncomeResponse response = mapToResponse(updatedIncome);

    return ResponseEntity.ok(response);
  }

  @DeleteMapping("/{id}")
  @Operation(summary = "Delete an income entry")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "204", description = "Income entry deleted successfully"),
        @ApiResponse(responseCode = "401", description = "User not authenticated"),
        @ApiResponse(responseCode = "404", description = "Income entry not found")
      })
  public ResponseEntity<Void> deleteIncome(
      @Parameter(description = "Authenticated user", hidden = true) AppUser user,
      @PathVariable Long id) {

    incomeService.deleteIncomeForUser(id, user);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/period")
  @Operation(summary = "Get income entries for a specific date range")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Income entries retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "User not authenticated")
      })
  public ResponseEntity<List<IncomeResponse>> getIncomeForPeriod(
      @Parameter(description = "Authenticated user", hidden = true) AppUser user,
      @RequestParam LocalDate startDate,
      @RequestParam LocalDate endDate) {

    List<Income> incomeList = incomeService.getIncomeForUserAndDateRange(user, startDate, endDate);
    List<IncomeResponse> responseList =
        incomeList.stream().map(this::mapToResponse).collect(Collectors.toList());

    return ResponseEntity.ok(responseList);
  }

  @GetMapping("/total")
  @Operation(summary = "Get total income for a specific period")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Total income calculated successfully"),
        @ApiResponse(responseCode = "401", description = "User not authenticated")
      })
  public ResponseEntity<BigDecimal> getTotalIncomeForPeriod(
      @Parameter(description = "Authenticated user", hidden = true) AppUser user,
      @RequestParam LocalDate startDate,
      @RequestParam LocalDate endDate) {

    BigDecimal totalIncome = incomeService.getTotalIncomeForPeriod(user, startDate, endDate);
    return ResponseEntity.ok(totalIncome);
  }
}
