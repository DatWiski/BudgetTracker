package com.example.subtrackerproject.dto;

import com.example.subtrackerproject.model.Category;
import lombok.Data;

import java.util.Set;

@Data
public class CategoryResponse {
    
    private Long id;
    private String name;
    private String color;
    private boolean reserved;
    private long subscriptionCount;
    
    // Reserved category names that cannot be modified
    private static final Set<String> RESERVED_NAMES = Set.of("Uncategorized", "Other");
    
    public static CategoryResponse fromEntity(Category category, long subscriptionCount) {
        CategoryResponse dto = new CategoryResponse();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setColor(category.getColor());
        dto.setReserved(isReservedCategory(category.getName()));
        dto.setSubscriptionCount(subscriptionCount);
        return dto;
    }
    
    public static CategoryResponse fromEntity(Category category) {
        return fromEntity(category, 0);
    }
    
    private static boolean isReservedCategory(String name) {
        return RESERVED_NAMES.contains(name);
    }
} 