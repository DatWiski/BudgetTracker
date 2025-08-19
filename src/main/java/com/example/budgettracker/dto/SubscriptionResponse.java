package com.example.budgettracker.dto;

import com.example.budgettracker.model.Period;
import com.example.budgettracker.model.Subscription;
import com.example.budgettracker.service.PeriodCalculationService;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class SubscriptionResponse {

    private Long id;
    private String name;
    private BigDecimal price;
    private Period period;
    private LocalDate nextBillingDate;
    private LocalDate actualNextBillingDate;
    private boolean active;
    private Long categoryId;
    private String categoryName;

    public static SubscriptionResponse fromEntity(Subscription subscription, PeriodCalculationService periodCalculationService) {
        SubscriptionResponse dto = new SubscriptionResponse();
        dto.setId(subscription.getId());
        dto.setName(subscription.getName());
        dto.setPrice(subscription.getPrice());
        dto.setPeriod(subscription.getPeriod());
        dto.setNextBillingDate(subscription.getNextBillingDate());
        
        // Calculate the actual next billing date using period calculations
        dto.setActualNextBillingDate(periodCalculationService.getNextOccurrence(
            subscription.getNextBillingDate(), subscription.getPeriod()
        ));
        
        dto.setActive(subscription.isActive());
        if (subscription.getCategory() != null) {
            dto.setCategoryId(subscription.getCategory().getId());
            dto.setCategoryName(subscription.getCategory().getName());
        }
        return dto;
    }

    // Keep the old method for backward compatibility, but it won't have calculated billing dates
    @Deprecated
    public static SubscriptionResponse fromEntity(Subscription subscription) {
        SubscriptionResponse dto = new SubscriptionResponse();
        dto.setId(subscription.getId());
        dto.setName(subscription.getName());
        dto.setPrice(subscription.getPrice());
        dto.setPeriod(subscription.getPeriod());
        dto.setNextBillingDate(subscription.getNextBillingDate());
        dto.setActualNextBillingDate(subscription.getNextBillingDate()); // Fallback to original date
        dto.setActive(subscription.isActive());
        if (subscription.getCategory() != null) {
            dto.setCategoryId(subscription.getCategory().getId());
            dto.setCategoryName(subscription.getCategory().getName());
        }
        return dto;
    }
}
