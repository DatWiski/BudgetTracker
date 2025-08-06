package com.example.subtrackerproject.service;

import com.example.subtrackerproject.dto.SubscriptionRequest;
import com.example.subtrackerproject.exception.SubscriptionNotFoundException;
import com.example.subtrackerproject.exception.UnauthorizedAccessException;
import com.example.subtrackerproject.model.AppUser;
import com.example.subtrackerproject.model.BillingPeriod;
import com.example.subtrackerproject.model.Category;
import com.example.subtrackerproject.model.Subscription;
import com.example.subtrackerproject.repository.SubscriptionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SubscriptionServiceTest {

    @Mock
    private SubscriptionRepository subscriptionRepository;

    @Mock
    private CategoryService categoryService;

    @InjectMocks
    private SubscriptionServiceImpl subscriptionService;

    private AppUser testUser;
    private Category testCategory;
    private SubscriptionRequest validRequest;

    @BeforeEach
    void setUp() {
        testUser = new AppUser("test-sub", "Test User", "test@example.com", "pic.jpg");
        testUser.setId(1L);

        testCategory = new Category("Entertainment", "#FF6B6B", testUser);
        testCategory.setId(1L);

        validRequest = new SubscriptionRequest();
        validRequest.setName("Netflix");
        validRequest.setPrice(new BigDecimal("15.99"));
        validRequest.setBillingPeriod(BillingPeriod.MONTHLY);
        validRequest.setNextBillingDate(LocalDate.now().plusMonths(1));
        validRequest.setCategoryName("Entertainment");
    }

    @Test
    void saveSubscriptionForUser_WithExistingCategory_ShouldSaveSuccessfully() {
        // Arrange
        when(categoryService.findOrCreateCategory("Entertainment", testUser))
                .thenReturn(testCategory);
        
        Subscription savedSubscription = new Subscription();
        savedSubscription.setId(1L);
        savedSubscription.setName("Netflix");
        savedSubscription.setPrice(new BigDecimal("15.99"));
        savedSubscription.setBillingPeriod(BillingPeriod.MONTHLY);
        savedSubscription.setAppUser(testUser);
        savedSubscription.setCategory(testCategory);
        
        when(subscriptionRepository.save(any(Subscription.class)))
                .thenReturn(savedSubscription);

        // Act
        Subscription result = subscriptionService.saveSubscriptionForUser(validRequest, testUser);

        // Assert
        assertNotNull(result);
        assertEquals("Netflix", result.getName());
        assertEquals(new BigDecimal("15.99"), result.getPrice());
        assertEquals(BillingPeriod.MONTHLY, result.getBillingPeriod());
        assertEquals(testUser, result.getAppUser());
        assertEquals(testCategory, result.getCategory());
        
        verify(categoryService).findOrCreateCategory("Entertainment", testUser);
        verify(subscriptionRepository).save(any(Subscription.class));
    }

    @Test
    void saveSubscriptionForUser_WithNewCategory_ShouldCreateCategoryAndSave() {
        // Arrange
        Category newCategory = new Category("Music", "#4ECDC4", testUser);
        newCategory.setId(2L);
        
        when(categoryService.findOrCreateCategory("Music", testUser))
                .thenReturn(newCategory);

        validRequest.setCategoryName("Music");
        
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
        
        verify(categoryService).findOrCreateCategory("Music", testUser);
        verify(subscriptionRepository).save(any(Subscription.class));
    }

    @Test
    void saveSubscriptionForUser_WithoutCategory_ShouldSaveWithDefaultCategory() {
        // Arrange
        validRequest.setCategoryName(null);
        
        Category defaultCategory = new Category("Subscriptions", "#808080", testUser);
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
        
        when(categoryService.findOrCreateCategory("Productivity", testUser))
                .thenReturn(testCategory);
        
        validRequest.setName("Updated Name");
        validRequest.setCategoryName("Productivity");
        
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
        AppUser otherUser = new AppUser("other-sub", "Other User", "other@example.com", "pic.jpg");
        otherUser.setId(2L);
        
        Subscription existingSubscription = new Subscription();
        existingSubscription.setId(1L);
        existingSubscription.setAppUser(otherUser);
        
        when(subscriptionRepository.findById(1L))
                .thenReturn(Optional.of(existingSubscription));

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
        AppUser otherUser = new AppUser("other-sub", "Other User", "other@example.com", "pic.jpg");
        otherUser.setId(2L);
        
        Subscription existingSubscription = new Subscription();
        existingSubscription.setId(1L);
        existingSubscription.setAppUser(otherUser);
        
        when(subscriptionRepository.findById(1L))
                .thenReturn(Optional.of(existingSubscription));

        // Act & Assert
        assertThrows(UnauthorizedAccessException.class, () -> {
            subscriptionService.deleteSubscriptionForUser(1L, testUser);
        });
        
        verify(subscriptionRepository).findById(1L);
        verify(subscriptionRepository, never()).delete(any(Subscription.class));
    }
} 