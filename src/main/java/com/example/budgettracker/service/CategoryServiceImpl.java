package com.example.budgettracker.service;

import com.example.budgettracker.dto.CategoryResponse;
import com.example.budgettracker.model.AppUser;
import com.example.budgettracker.model.Category;
import com.example.budgettracker.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;
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
        
        getDefaultCategories().forEach((name, color) -> {
            if (!existingNames.contains(name)) {
                categoriesToCreate.add(new Category(name, color, user));
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
            .orElseGet(() -> {
                String color = getDefaultCategories().getOrDefault(name, generateRandomColor());
                return categoryRepository.save(new Category(name, color, user));
            });
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
    
    private static final Map<String, String> DEFAULT_CATEGORIES = Map.of(
        "Entertainment", "#FF6B6B",
        "Productivity", "#4ECDC4", 
        "Utilities", "#45B7D1",
        "Education", "#96CEB4",
        "Fitness", "#FFEAA7"
    );
    
    // Available colors for category generation
    private static final String[] AVAILABLE_COLORS = {
        "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", 
        "#DDA0DD", "#F39C12", "#E74C3C", "#9B59B6", "#3498DB"
    };
    
    private static final Random RANDOM = new Random();
    
    private Map<String, String> getDefaultCategories() {
        return DEFAULT_CATEGORIES;
    }
    
    private String generateRandomColor() {
        return AVAILABLE_COLORS[RANDOM.nextInt(AVAILABLE_COLORS.length)];
    }
} 