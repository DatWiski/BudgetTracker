package com.example.budgettracker.dto;

import com.example.budgettracker.model.BillingPeriod;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class SubscriptionRequest {

    @NotBlank(message = "Subscription name is required")
    @Size(min = 1, max = 100, message = "Subscription name must be between 1 and 100 characters")
    private String name;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    @DecimalMax(value = "99999999.99", message = "Price cannot exceed 99,999,999.99")
    @Digits(integer = 8, fraction = 2, message = "Price must have at most 8 digits before decimal and 2 after")
    private BigDecimal price;

    @NotNull(message = "Billing period is required")
    private BillingPeriod billingPeriod;

    @NotNull(message = "Next billing date is required")
    @FutureOrPresent(message = "Next billing date cannot be in the past")
    private LocalDate nextBillingDate;

    private Long categoryId;
    
    private boolean active = true;
}
