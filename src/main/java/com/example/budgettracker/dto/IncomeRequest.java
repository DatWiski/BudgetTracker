package com.example.budgettracker.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Schema(description = "Request payload for creating or updating an income entry")
public class IncomeRequest {

    @NotBlank(message = "Income name is required")
    @Size(min = 1, max = 100, message = "Income name must be between 1 and 100 characters")
    @Schema(description = "Name/source of the income", example = "Monthly Salary")
    private String name;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    @DecimalMax(value = "99999999.99", message = "Amount cannot exceed 99,999,999.99")
    @Digits(integer = 8, fraction = 2, message = "Amount must have at most 8 digits before decimal and 2 after")
    @Schema(description = "Income amount", example = "5000.00")
    private BigDecimal amount;

    @NotNull(message = "Income date is required")
    @PastOrPresent(message = "Income date cannot be in the future")
    @Schema(description = "Date when income was received", example = "2024-01-15")
    private LocalDate incomeDate;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    @Schema(description = "Optional description", example = "January salary payment")
    private String description;

    @Schema(description = "Category ID (optional)", example = "1")
    private Long categoryId;
}