package com.example.budgettracker;

import com.example.budgettracker.dto.SubscriptionRequest;
import com.example.budgettracker.model.AppUser;
import com.example.budgettracker.model.Period;
import com.example.budgettracker.model.Category;
import com.example.budgettracker.model.Subscription;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Test data builder utility class for creating test objects
 */
public final class TestDataBuilder {
    
    private TestDataBuilder() {
        // Private constructor to prevent instantiation
    }
    
    public static AppUser createTestUser() {
        return createTestUser(1L, "test-sub", "Test User", "test@example.com");
    }
    
    public static AppUser createTestUser(Long id, String subject, String name, String email) {
        AppUser user = new AppUser(subject, name, email, "pic.jpg");
        user.setId(id);
        return user;
    }
    
    public static Category createTestCategory() {
        return createTestCategory(1L, "Entertainment", createTestUser());
    }
    
    public static Category createTestCategory(Long id, String name, AppUser user) {
        Category category = new Category(name, user);
        category.setId(id);
        return category;
    }
    
    public static SubscriptionRequest createValidSubscriptionRequest() {
        return createSubscriptionRequest("Netflix", new BigDecimal("15.99"), 
            Period.MONTHLY, LocalDate.now().plusMonths(1), 1L);
    }
    
    public static SubscriptionRequest createSubscriptionRequest(String name, BigDecimal price, 
            Period period, LocalDate nextBillingDate, Long categoryId) {
        SubscriptionRequest request = new SubscriptionRequest();
        request.setName(name);
        request.setPrice(price);
        request.setPeriod(period);
        request.setNextBillingDate(nextBillingDate);
        request.setCategoryId(categoryId);
        return request;
    }
    
    public static Subscription createTestSubscription() {
        return createTestSubscription(1L, "Netflix", new BigDecimal("15.99"), 
            Period.MONTHLY, createTestUser(), createTestCategory());
    }
    
    public static Subscription createTestSubscription(Long id, String name, BigDecimal price,
            Period period, AppUser user, Category category) {
        Subscription subscription = new Subscription();
        subscription.setId(id);
        subscription.setName(name);
        subscription.setPrice(price);
        subscription.setPeriod(period);
        subscription.setNextBillingDate(LocalDate.now().plusMonths(1));
        subscription.setActive(true);
        subscription.setAppUser(user);
        subscription.setCategory(category);
        return subscription;
    }
}