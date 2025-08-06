package com.example.subtrackerproject.dto;

import com.example.subtrackerproject.model.BillingPeriod;
import com.example.subtrackerproject.model.Subscription;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class SubscriptionResponse {

    private Long id;
    private String name;
    private BigDecimal price;
    private BillingPeriod billingPeriod;
    private LocalDate nextBillingDate;
    private boolean isActive;
    private Long categoryId;
    private String categoryName;
    private String categoryColor;

    public static SubscriptionResponse fromEntity(Subscription subscription) {
        SubscriptionResponse dto = new SubscriptionResponse();
        dto.setId(subscription.getId());
        dto.setName(subscription.getName());
        dto.setPrice(subscription.getPrice());
        dto.setBillingPeriod(subscription.getBillingPeriod());
        dto.setNextBillingDate(subscription.getNextBillingDate());
        dto.setActive(subscription.isActive());
        if (subscription.getCategory() != null) {
            dto.setCategoryId(subscription.getCategory().getId());
            dto.setCategoryName(subscription.getCategory().getName());
            dto.setCategoryColor(subscription.getCategory().getColor());
        }
        return dto;
    }
}
