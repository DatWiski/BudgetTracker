package com.example.subtrackerproject.service;

import com.example.subtrackerproject.model.AppUser;
import com.example.subtrackerproject.model.BillingPeriod;
import com.example.subtrackerproject.model.Category;
import com.example.subtrackerproject.model.Subscription;
import com.example.subtrackerproject.repository.CategoryRepository;
import com.example.subtrackerproject.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final SubscriptionRepository subscriptionRepository;
    
    // Default categories with their colors
    private static final Map<String, String> DEFAULT_CATEGORIES = Map.of(
        "Entertainment", "#FF6B6B",
        "Productivity", "#4ECDC4", 
        "Utilities", "#45B7D1",
        "Education", "#96CEB4",
        "Fitness", "#FFEAA7"
    );
    
    // Reserved category names that cannot be modified
    private static final Set<String> RESERVED_NAMES = Set.of("Uncategorized");
    
    @Override
    @Transactional
    public void ensureDefaultCategoriesExist(AppUser user) {
        log.debug("Ensuring default categories exist for user: {}", user.getId());
        
        List<Category> existingCategories = categoryRepository.findByAppUserOrderByNameAsc(user);
        Set<String> existingNames = existingCategories.stream()
            .map(Category::getName)
            .collect(Collectors.toSet());
        
        List<Category> categoriesToCreate = new ArrayList<>();
        
        DEFAULT_CATEGORIES.forEach((name, color) -> {
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
                String color = DEFAULT_CATEGORIES.getOrDefault(name, generateRandomColor());
                return categoryRepository.save(new Category(name, color, user));
            });
    }
    
    @Override
    public List<Category> getCategoriesForUser(AppUser user) {
        return categoryRepository.findByAppUserOrderByNameAsc(user);
    }
    
    @Override
    public Optional<Category> getCategoryByIdForUser(Long categoryId, AppUser user) {
        return categoryRepository.findByIdAndUserId(categoryId, user.getId());
    }
    
    @Override
    @Transactional
    public Category createCategory(String name, String color, AppUser user) {
        if (isReservedCategoryName(name)) {
            throw new IllegalArgumentException("Category name '" + name + "' is reserved");
        }
        
        // Check if category already exists
        Optional<Category> existing = categoryRepository.findByNameIgnoreCaseAndAppUser(name, user);
        if (existing.isPresent()) {
            throw new IllegalArgumentException("Category '" + name + "' already exists");
        }
        
        return categoryRepository.save(new Category(name, color, user));
    }
    
    @Override
    @Transactional
    public Category updateCategory(Long categoryId, String name, String color, AppUser user) {
        Category category = getCategoryByIdForUser(categoryId, user)
            .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        
        if (isReservedCategoryName(category.getName())) {
            throw new IllegalArgumentException("Cannot modify reserved category");
        }
        
        // Check if new name conflicts with existing category
        if (!category.getName().equalsIgnoreCase(name)) {
            Optional<Category> existing = categoryRepository.findByNameIgnoreCaseAndAppUser(name, user);
            if (existing.isPresent()) {
                throw new IllegalArgumentException("Category '" + name + "' already exists");
            }
        }
        
        category.setName(name);
        category.setColor(color);
        return categoryRepository.save(category);
    }
    
    @Override
    @Transactional
    public void deleteCategory(Long categoryId, Long newCategoryId, AppUser user) {
        Category categoryToDelete = getCategoryByIdForUser(categoryId, user)
            .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        
        if (isReservedCategoryName(categoryToDelete.getName())) {
            throw new IllegalArgumentException("Cannot delete reserved category");
        }
        
        // Get new category to reassign subscriptions to
        Category newCategory = null;
        if (newCategoryId != null) {
            newCategory = getCategoryByIdForUser(newCategoryId, user)
                .orElseThrow(() -> new IllegalArgumentException("Target category not found"));
        }
        
        // Reassign all subscriptions
        List<Subscription> subscriptions = subscriptionRepository.findByCategoryAndAppUser(categoryToDelete, user);
        for (Subscription subscription : subscriptions) {
            subscription.setCategory(newCategory);
        }
        subscriptionRepository.saveAll(subscriptions);
        
        categoryRepository.delete(categoryToDelete);
        log.info("Deleted category {} and reassigned {} subscriptions", categoryToDelete.getName(), subscriptions.size());
    }
    
    @Override
    @Transactional
    public Category mergeCategories(Long sourceCategoryId, Long targetCategoryId, AppUser user) {
        Category sourceCategory = getCategoryByIdForUser(sourceCategoryId, user)
            .orElseThrow(() -> new IllegalArgumentException("Source category not found"));
        
        Category targetCategory = getCategoryByIdForUser(targetCategoryId, user)
            .orElseThrow(() -> new IllegalArgumentException("Target category not found"));
        
        if (isReservedCategoryName(sourceCategory.getName()) || isReservedCategoryName(targetCategory.getName())) {
            throw new IllegalArgumentException("Cannot merge reserved categories");
        }
        
        // Move all subscriptions from source to target
        List<Subscription> subscriptions = subscriptionRepository.findByCategoryAndAppUser(sourceCategory, user);
        for (Subscription subscription : subscriptions) {
            subscription.setCategory(targetCategory);
        }
        subscriptionRepository.saveAll(subscriptions);
        
        // Delete source category
        categoryRepository.delete(sourceCategory);
        
        log.info("Merged category {} into {} with {} subscriptions", 
            sourceCategory.getName(), targetCategory.getName(), subscriptions.size());
        
        return targetCategory;
    }
    
    @Override
    public Map<String, Object> getPieChartData(AppUser user) {
        Map<String, BigDecimal> categorySpends = getCategorySpendData(user);
        
        // Sort by spend amount (descending)
        List<Map.Entry<String, BigDecimal>> sortedEntries = categorySpends.entrySet().stream()
            .sorted(Map.Entry.<String, BigDecimal>comparingByValue().reversed())
            .collect(Collectors.toList());
        
        Map<String, Object> pieData = new HashMap<>();
        List<String> labels = new ArrayList<>();
        List<BigDecimal> values = new ArrayList<>();
        List<String> colors = new ArrayList<>();
        
        // Take top 5 categories
        BigDecimal otherTotal = BigDecimal.ZERO;
        List<String> otherCategories = new ArrayList<>();
        
        for (int i = 0; i < sortedEntries.size(); i++) {
            Map.Entry<String, BigDecimal> entry = sortedEntries.get(i);
            
            if (i < 5) {
                labels.add(entry.getKey());
                values.add(entry.getValue());
                
                // Find category color
                String color = findCategoryColor(entry.getKey(), user);
                colors.add(color);
            } else {
                otherTotal = otherTotal.add(entry.getValue());
                otherCategories.add(entry.getKey());
            }
        }
        
        // Add "Other" slice if there are more than 5 categories
        if (otherTotal.compareTo(BigDecimal.ZERO) > 0) {
            labels.add("Other");
            values.add(otherTotal);
            colors.add("#DDA0DD"); // Purple for "Other"
        }
        
        pieData.put("labels", labels);
        pieData.put("values", values);
        pieData.put("colors", colors);
        pieData.put("otherCategories", otherCategories);
        
        return pieData;
    }
    
    @Override
    public Map<String, BigDecimal> getCategorySpendData(AppUser user) {
        List<Subscription> activeSubscriptions = subscriptionRepository.findByAppUserAndIsActive(user, true);
        
        Map<String, BigDecimal> categorySpends = new HashMap<>();
        
        for (Subscription subscription : activeSubscriptions) {
            String categoryName = subscription.getCategory() != null 
                ? subscription.getCategory().getName() 
                : "Uncategorized";
            
            BigDecimal monthlyPrice = convertToMonthlyPrice(subscription.getPrice(), subscription.getBillingPeriod());
            
            categorySpends.merge(categoryName, monthlyPrice, BigDecimal::add);
        }
        
        return categorySpends;
    }
    
    @Override
    public boolean isReservedCategoryName(String name) {
        return RESERVED_NAMES.contains(name);
    }
    
    @Override
    public long getActiveSubscriptionCount(Category category) {
        return categoryRepository.countActiveSubscriptionsByCategory(category);
    }
    
    private String findCategoryColor(String categoryName, AppUser user) {
        return categoryRepository.findByNameIgnoreCaseAndAppUser(categoryName, user)
            .map(Category::getColor)
            .orElse("#DDA0DD"); // Default purple
    }
    
    private BigDecimal convertToMonthlyPrice(BigDecimal price, BillingPeriod billingPeriod) {
        if (price == null || billingPeriod == null) {
            return BigDecimal.ZERO;
        }
        
        return switch (billingPeriod) {
            case DAILY -> price.multiply(BigDecimal.valueOf(30)).setScale(2, RoundingMode.HALF_UP);
            case WEEKLY -> price.multiply(BigDecimal.valueOf(4.33)).setScale(2, RoundingMode.HALF_UP);
            case MONTHLY -> price.setScale(2, RoundingMode.HALF_UP);
            case YEARLY -> price.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
        };
    }
    
    private String generateRandomColor() {
        String[] colors = {"#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#F39C12", "#E74C3C", "#9B59B6", "#3498DB"};
        return colors[new Random().nextInt(colors.length)];
    }
} 