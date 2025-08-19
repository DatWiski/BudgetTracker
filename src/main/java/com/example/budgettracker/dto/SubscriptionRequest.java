package com.example.budgettracker.dto;

import com.example.budgettracker.model.Period;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Schema(description = "Request payload for creating or updating a subscription")
public class SubscriptionRequest {

    @NotBlank(message = "Subscription name is required")
    @Size(min = 1, max = 100, message = "Subscription name must be between 1 and 100 characters")
    @Schema(description = "Name of the subscription", example = "Netflix Premium")
    private String name;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    @DecimalMax(value = "99999999.99", message = "Price cannot exceed 99,999,999.99")
    @Digits(integer = 8, fraction = 2, message = "Price must have at most 8 digits before decimal and 2 after")
    @Schema(description = "Monthly price of the subscription", example = "15.99")
    private BigDecimal price;

    @NotNull(message = "Period is required")
    @Schema(description = "Billing frequency", example = "MONTHLY")
    private Period period;

    @NotNull(message = "Next billing date is required")
    @Schema(description = "Next billing date", example = "2024-02-15")
    private LocalDate nextBillingDate;

    @Schema(description = "Category ID (optional)", example = "1")
    private Long categoryId;
    
    @Schema(description = "Whether the subscription is active", example = "true")
    private boolean active = true;
}
