package com.example.budgettracker.service;

import com.example.budgettracker.dto.CategoryResponse;
import com.example.budgettracker.model.AppUser;
import com.example.budgettracker.model.Category;
import com.example.budgettracker.model.CategoryType;
import com.example.budgettracker.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    
    @Override
    @Transactional
    public void ensureDefaultCategoriesExist(AppUser user) {
        log.debug("Ensuring default categories exist for user: {}", user.getId());
        
        List<Category> existingCategories = categoryRepository.findByAppUserOrderByNameAsc(user);
        Set<String> existingNames = existingCategories.stream()
            .map(Category::getName)
            .collect(Collectors.toSet());
        
        List<Category> categoriesToCreate = new ArrayList<>();
        
        getDefaultCategories().forEach(name -> {
            if (!existingNames.contains(name)) {
                categoriesToCreate.add(new Category(name, user));
            }
        });
        
        if (!categoriesToCreate.isEmpty()) {
            categoryRepository.saveAll(categoriesToCreate);
            log.info("Created {} default categories for user {}", categoriesToCreate.size(), user.getId());
        }
    }
    
    @Override
    @Transactional
    public Category findOrCreateCategory(String name, AppUser user) {
        return categoryRepository.findByNameIgnoreCaseAndAppUser(name, user)
            .orElseGet(() -> categoryRepository.save(new Category(name, user)));
    }
    
    @Override
    public List<Category> getCategoriesForUser(AppUser user) {
        return categoryRepository.findByAppUserOrderByNameAsc(user);
    }
    
    @Override
    public List<CategoryResponse> getCategoriesWithCountsForUser(AppUser user) {
        List<Category> categories = categoryRepository.findByAppUserOrderByNameAsc(user);
        // Build a map of categoryId -> active subscription count using a single grouped query
        List<Object[]> groupedCounts = categoryRepository.countActiveSubscriptionsByUserGrouped(user);
        java.util.Map<Long, Long> categoryIdToCount = groupedCounts.stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (Long) row[1]
                ));

        return categories.stream()
                .map(category -> CategoryResponse.fromEntity(
                        category,
                        categoryIdToCount.getOrDefault(category.getId(), 0L)
                ))
                .collect(Collectors.toList());
    }
    
    @Override
    public long getActiveSubscriptionCount(Category category) {
        return categoryRepository.countActiveSubscriptionsByCategory(category);
    }
    
    @Override
    public Category findByIdAndUser(Long categoryId, AppUser user) {
        return categoryRepository.findByIdAndUserId(categoryId, user.getId())
            .orElseThrow(() -> new com.example.budgettracker.exception.CategoryNotFoundException(categoryId));
    }
    
    private static final List<String> DEFAULT_CATEGORIES = List.of(
        "Entertainment",
        "Productivity", 
        "Utilities",
        "Education",
        "Fitness",
        "Food",
        "Transport",
        "Health",
        "Shopping"
    );
    
    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategoriesByTypeForUser(AppUser user, CategoryType categoryType) {
        List<Category> categories = categoryRepository.findByAppUserAndCategoryTypeOrderByNameAsc(user, categoryType);
        return categories.stream()
                .map(category -> {
                    CategoryResponse response = new CategoryResponse();
                    response.setId(category.getId());
                    response.setName(category.getName());
                    response.setLocked(category.isLocked());
                    response.setSubscriptionCount(0L); // No subscription count needed for income categories
                    return response;
                })
                .collect(Collectors.toList());
    }
    
    private List<String> getDefaultCategories() {
        return DEFAULT_CATEGORIES;
    }
} 