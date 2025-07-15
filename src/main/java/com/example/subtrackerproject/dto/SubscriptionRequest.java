package com.example.subtrackerproject.dto;

import com.example.subtrackerproject.model.BillingPeriod;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class SubscriptionRequest {

    @NotBlank(message = "Subscription name is required")
    @Size(min = 2, max = 100, message = "Subscription name must be between 2 and 100 characters")
    private String name;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    @DecimalMax(value = "999999.99", message = "Price cannot exceed 999,999.99")
    @Digits(integer = 6, fraction = 2, message = "Price must have at most 6 digits before decimal and 2 after")
    private BigDecimal price;

    @NotNull(message = "Billing period is required")
    private BillingPeriod billingPeriod;

    @NotNull(message = "Next billing date is required")
    @FutureOrPresent(message = "Next billing date cannot be in the past")
    private LocalDate nextBillingDate;

    @Size(max = 50, message = "Category name cannot exceed 50 characters")
    private String categoryName;
}
