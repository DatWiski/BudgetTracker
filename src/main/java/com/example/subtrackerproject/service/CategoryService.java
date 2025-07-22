package com.example.subtrackerproject.service;

import com.example.subtrackerproject.model.AppUser;
import com.example.subtrackerproject.model.Category;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface CategoryService {
    
    /**
     * Ensures default categories exist for the user
     */
    void ensureDefaultCategoriesExist(AppUser user);
    
    /**
     * Find or create a category for a user
     */
    Category findOrCreateCategory(String name, AppUser user);
    
    /**
     * Get all categories for a user
     */
    List<Category> getCategoriesForUser(AppUser user);
    
    /**
     * Get category by ID for a specific user
     */
    Optional<Category> getCategoryByIdForUser(Long categoryId, AppUser user);
    
    /**
     * Create a new category for a user
     */
    Category createCategory(String name, String color, AppUser user);
    
    /**
     * Update an existing category
     */
    Category updateCategory(Long categoryId, String name, String color, AppUser user);
    
    /**
     * Delete a category and reassign its subscriptions
     */
    void deleteCategory(Long categoryId, Long newCategoryId, AppUser user);
    
    /**
     * Merge two categories
     */
    Category mergeCategories(Long sourceCategoryId, Long targetCategoryId, AppUser user);
    
    /**
     * Get pie chart data for dashboard
     */
    Map<String, Object> getPieChartData(AppUser user);
    
    /**
     * Get category spend data for analytics
     */
    Map<String, BigDecimal> getCategorySpendData(AppUser user);
    
    /**
     * Check if category name is reserved
     */
    boolean isReservedCategoryName(String name);
    
    /**
     * Get count of active subscriptions for a category
     */
    long getActiveSubscriptionCount(Category category);
} 