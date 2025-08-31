package com.example.budgettracker.dto;

import com.example.budgettracker.model.Category;
import java.util.Set;
import lombok.Data;

@Data
public class CategoryResponse {

  private Long id;
  private String name;
  private boolean locked;
  private boolean reserved;
  private long subscriptionCount;

  // Reserved category names that cannot be modified
  private static final Set<String> RESERVED_NAMES = Set.of("Uncategorized", "Other");

  public static CategoryResponse fromEntity(Category category, long subscriptionCount) {
    CategoryResponse dto = new CategoryResponse();
    dto.setId(category.getId());
    dto.setName(category.getName());
    dto.setLocked(category.isLocked());
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
