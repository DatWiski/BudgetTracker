package com.example.budgettracker.service;

import com.example.budgettracker.dto.CategoryResponse;
import com.example.budgettracker.model.AppUser;
import com.example.budgettracker.model.Category;
import com.example.budgettracker.model.CategoryType;
import java.util.List;

public interface CategoryService {

  /** Ensures default categories exist for the user */
  void ensureDefaultCategoriesExist(AppUser user);

  /** Find or create a category for a user */
  Category findOrCreateCategory(String name, AppUser user);

  /** Get all categories for a user */
  List<Category> getCategoriesForUser(AppUser user);

  /** Get all categories with subscription counts for a user */
  List<CategoryResponse> getCategoriesWithCountsForUser(AppUser user);

  List<CategoryResponse> getCategoriesByTypeForUser(AppUser user, CategoryType categoryType);

  /** Get count of active subscriptions for a category */
  long getActiveSubscriptionCount(Category category);

  /** Find a category by ID for a specific user */
  Category findByIdAndUser(Long categoryId, AppUser user);
}
