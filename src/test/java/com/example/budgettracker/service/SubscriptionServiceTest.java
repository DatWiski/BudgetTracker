package com.example.budgettracker.service;

import com.example.budgettracker.TestDataBuilder;
import com.example.budgettracker.dto.SubscriptionRequest;
import com.example.budgettracker.exception.SubscriptionNotFoundException;
import com.example.budgettracker.exception.UnauthorizedAccessException;
import com.example.budgettracker.model.AppUser;
import com.example.budgettracker.model.Period;
import com.example.budgettracker.model.Category;
import com.example.budgettracker.model.Subscription;
import com.example.budgettracker.repository.SubscriptionRepository;
import com.example.budgettracker.util.SecurityUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SubscriptionServiceTest {

    @Mock
    private SubscriptionRepository subscriptionRepository;

    @Mock
    private CategoryService categoryService;

    @Mock
    private SecurityUtils securityUtils;

    @Mock
    private PeriodCalculationService periodCalculationService;

    @InjectMocks
    private SubscriptionServiceImpl subscriptionService;

    private AppUser testUser;
    private Category testCategory;
    private SubscriptionRequest validRequest;

    @BeforeEach
    void setUp() {
        testUser = TestDataBuilder.createTestUser();
        testCategory = TestDataBuilder.createTestCategory(1L, "Entertainment", testUser);
        validRequest = TestDataBuilder.createValidSubscriptionRequest();
    }

    @Test
    void saveSubscriptionForUser_WithExistingCategory_ShouldSaveSuccessfully() {
        // Arrange
        when(categoryService.findByIdAndUser(1L, testUser))
                .thenReturn(testCategory);
        
        Subscription savedSubscription = TestDataBuilder.createTestSubscription(1L, "Netflix", 
            new BigDecimal("15.99"), Period.MONTHLY, testUser, testCategory);
        
        when(subscriptionRepository.save(any(Subscription.class)))
                .thenReturn(savedSubscription);

        // Act
        Subscription result = subscriptionService.saveSubscriptionForUser(validRequest, testUser);

        // Assert
        assertNotNull(result);
        assertEquals("Netflix", result.getName());
        assertEquals(new BigDecimal("15.99"), result.getPrice());
        assertEquals(Period.MONTHLY, result.getPeriod());
        assertEquals(testUser, result.getAppUser());
        assertEquals(testCategory, result.getCategory());
        
        verify(categoryService).findByIdAndUser(1L, testUser);
        verify(subscriptionRepository).save(any(Subscription.class));
    }

    @Test
    void saveSubscriptionForUser_WithNewCategory_ShouldCreateCategoryAndSave() {
        // Arrange
        Category newCategory = new Category("Music", testUser);
        newCategory.setId(2L);
        
        when(categoryService.findByIdAndUser(2L, testUser))
                .thenReturn(newCategory);

        validRequest.setCategoryId(2L);
        
        Subscription savedSubscription = new Subscription();
        savedSubscription.setId(1L);
        savedSubscription.setName("Netflix");
        savedSubscription.setCategory(newCategory);
        
        when(subscriptionRepository.save(any(Subscription.class)))
                .thenReturn(savedSubscription);

        // Act
        Subscription result = subscriptionService.saveSubscriptionForUser(validRequest, testUser);

        // Assert
        assertNotNull(result);
        assertEquals(newCategory, result.getCategory());
        
        verify(categoryService).findByIdAndUser(2L, testUser);
        verify(subscriptionRepository).save(any(Subscription.class));
    }

    @Test
    void saveSubscriptionForUser_WithoutCategory_ShouldSaveWithDefaultCategory() {
        // Arrange
        validRequest.setCategoryId(null);
        
        Category defaultCategory = new Category("Subscriptions", testUser);
        defaultCategory.setId(1L);
        
        when(categoryService.findOrCreateCategory("Subscriptions", testUser))
                .thenReturn(defaultCategory);
        
        Subscription savedSubscription = new Subscription();
        savedSubscription.setId(1L);
        savedSubscription.setName("Netflix");
        savedSubscription.setCategory(defaultCategory);
        
        when(subscriptionRepository.save(any(Subscription.class)))
                .thenReturn(savedSubscription);

        // Act
        Subscription result = subscriptionService.saveSubscriptionForUser(validRequest, testUser);

        // Assert
        assertNotNull(result);
        assertNotNull(result.getCategory());
        assertEquals("Subscriptions", result.getCategory().getName());
        
        verify(categoryService).findOrCreateCategory("Subscriptions", testUser);
        verify(subscriptionRepository).save(any(Subscription.class));
    }

    @Test
    void updateSubscriptionForUser_WithValidData_ShouldUpdateSuccessfully() {
        // Arrange
        Subscription existingSubscription = new Subscription();
        existingSubscription.setId(1L);
        existingSubscription.setName("Old Name");
        existingSubscription.setAppUser(testUser);
        
        when(subscriptionRepository.findById(1L))
                .thenReturn(Optional.of(existingSubscription));
        
        when(categoryService.findByIdAndUser(1L, testUser))
                .thenReturn(testCategory);
        
        validRequest.setName("Updated Name");
        validRequest.setCategoryId(1L);
        
        when(subscriptionRepository.save(any(Subscription.class)))
                .thenReturn(existingSubscription);

        // Act
        Subscription result = subscriptionService.updateSubscriptionForUser(1L, validRequest, testUser);

        // Assert
        assertNotNull(result);
        assertEquals("Updated Name", existingSubscription.getName());
        assertEquals(new BigDecimal("15.99"), existingSubscription.getPrice());
        
        verify(subscriptionRepository).findById(1L);
        verify(subscriptionRepository).save(existingSubscription);
    }

    @Test
    void updateSubscriptionForUser_WithNonExistentSubscription_ShouldThrowException() {
        // Arrange
        when(subscriptionRepository.findById(999L))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(SubscriptionNotFoundException.class, () -> {
            subscriptionService.updateSubscriptionForUser(999L, validRequest, testUser);
        });
        
        verify(subscriptionRepository).findById(999L);
        verify(subscriptionRepository, never()).save(any(Subscription.class));
    }

    @Test
    void updateSubscriptionForUser_WithUnauthorizedUser_ShouldThrowException() {
        // Arrange
        AppUser otherUser = TestDataBuilder.createTestUser(2L, "other-sub", "Other User", "other@example.com");
        
        Subscription existingSubscription = new Subscription();
        existingSubscription.setId(1L);
        existingSubscription.setAppUser(otherUser);
        
        when(subscriptionRepository.findById(1L))
                .thenReturn(Optional.of(existingSubscription));
        
        doThrow(new UnauthorizedAccessException("subscription 1", testUser.getId()))
                .when(securityUtils).validateResourceOwnership(otherUser, testUser, "subscription", 1L);

        // Act & Assert
        assertThrows(UnauthorizedAccessException.class, () -> {
            subscriptionService.updateSubscriptionForUser(1L, validRequest, testUser);
        });
        
        verify(subscriptionRepository).findById(1L);
        verify(subscriptionRepository, never()).save(any(Subscription.class));
    }

    @Test
    void deleteSubscriptionForUser_WithValidData_ShouldDeleteSuccessfully() {
        // Arrange
        Subscription existingSubscription = new Subscription();
        existingSubscription.setId(1L);
        existingSubscription.setAppUser(testUser);
        
        testUser.getSubscriptions().add(existingSubscription);
        
        when(subscriptionRepository.findById(1L))
                .thenReturn(Optional.of(existingSubscription));

        // Act
        subscriptionService.deleteSubscriptionForUser(1L, testUser);

        // Assert
        verify(subscriptionRepository).findById(1L);
        verify(subscriptionRepository).delete(existingSubscription);
        assertFalse(testUser.getSubscriptions().contains(existingSubscription));
    }

    @Test
    void deleteSubscriptionForUser_WithNonExistentSubscription_ShouldThrowException() {
        // Arrange
        when(subscriptionRepository.findById(999L))
                .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(SubscriptionNotFoundException.class, () -> {
            subscriptionService.deleteSubscriptionForUser(999L, testUser);
        });
        
        verify(subscriptionRepository).findById(999L);
        verify(subscriptionRepository, never()).delete(any(Subscription.class));
    }

    @Test
    void deleteSubscriptionForUser_WithUnauthorizedUser_ShouldThrowException() {
        // Arrange
        AppUser otherUser = TestDataBuilder.createTestUser(2L, "other-sub", "Other User", "other@example.com");
        
        Subscription existingSubscription = new Subscription();
        existingSubscription.setId(1L);
        existingSubscription.setAppUser(otherUser);
        
        when(subscriptionRepository.findById(1L))
                .thenReturn(Optional.of(existingSubscription));
        
        doThrow(new UnauthorizedAccessException("subscription 1", testUser.getId()))
                .when(securityUtils).validateResourceOwnership(otherUser, testUser, "subscription", 1L);

        // Act & Assert
        assertThrows(UnauthorizedAccessException.class, () -> {
            subscriptionService.deleteSubscriptionForUser(1L, testUser);
        });
        
        verify(subscriptionRepository).findById(1L);
        verify(subscriptionRepository, never()).delete(any(Subscription.class));
    }
} 