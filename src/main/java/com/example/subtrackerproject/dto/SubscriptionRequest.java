package com.example.subtrackerproject.dto;

import com.example.subtrackerproject.model.BillingPeriod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class SubscriptionRequest {

    @NotBlank(message = "Subscription name cannot be blank")
    private String name;

    @NotNull(message = "Price cannot be null")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal price;

    @NotNull(message = "Billing period cannot be null")
    private BillingPeriod billingPeriod;

    @NotNull(message = "Next billing date cannot be null")
    private LocalDate nextBillingDate;

    private String categoryName;
}
