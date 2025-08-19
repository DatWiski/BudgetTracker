package com.example.budgettracker.dto;

import com.example.budgettracker.model.Period;
import com.example.budgettracker.model.Subscription;
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
    private boolean active;
    private Long categoryId;
    private String categoryName;

    public static SubscriptionResponse fromEntity(Subscription subscription) {
        SubscriptionResponse dto = new SubscriptionResponse();
        dto.setId(subscription.getId());
        dto.setName(subscription.getName());
        dto.setPrice(subscription.getPrice());
        dto.setPeriod(subscription.getPeriod());
        dto.setNextBillingDate(subscription.getNextBillingDate());
        dto.setActive(subscription.isActive());
        if (subscription.getCategory() != null) {
            dto.setCategoryId(subscription.getCategory().getId());
            dto.setCategoryName(subscription.getCategory().getName());
        }
        return dto;
    }
}
