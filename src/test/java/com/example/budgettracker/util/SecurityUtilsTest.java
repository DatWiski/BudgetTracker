package com.example.budgettracker.util;

import com.example.budgettracker.exception.UnauthorizedAccessException;
import com.example.budgettracker.model.AppUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class SecurityUtilsTest {

    private SecurityUtils securityUtils;
    private AppUser user1;
    private AppUser user2;

    @BeforeEach
    void setUp() {
        securityUtils = new SecurityUtils();
        
        user1 = new AppUser();
        user1.setId(1L);
        user1.setEmail("user1@example.com");
        
        user2 = new AppUser();
        user2.setId(2L);
        user2.setEmail("user2@example.com");
    }

    @Test
    void testValidateResourceOwnership_SameUser_NoException() {
        assertDoesNotThrow(() -> 
            securityUtils.validateResourceOwnership(user1, user1, "Subscription", 123L)
        );
    }

    @Test
    void testValidateResourceOwnership_DifferentUser_ThrowsException() {
        UnauthorizedAccessException exception = assertThrows(
            UnauthorizedAccessException.class,
            () -> securityUtils.validateResourceOwnership(user1, user2, "Subscription", 123L)
        );
        
        assertTrue(exception.getMessage().contains("Subscription 123"));
        assertTrue(exception.getMessage().contains("User 2"));
    }

    @Test
    void testValidateResourceOwnership_ByOwnerId_SameUser_NoException() {
        assertDoesNotThrow(() -> 
            securityUtils.validateResourceOwnership(1L, user1, "Category", 456L)
        );
    }

    @Test
    void testValidateResourceOwnership_ByOwnerId_DifferentUser_ThrowsException() {
        UnauthorizedAccessException exception = assertThrows(
            UnauthorizedAccessException.class,
            () -> securityUtils.validateResourceOwnership(1L, user2, "Category", 456L)
        );
        
        assertTrue(exception.getMessage().contains("Category 456"));
        assertTrue(exception.getMessage().contains("User 2"));
    }

    @Test
    void testIsResourceOwner_SameUser_ReturnsTrue() {
        assertTrue(securityUtils.isResourceOwner(user1, user1));
    }

    @Test
    void testIsResourceOwner_DifferentUser_ReturnsFalse() {
        assertFalse(securityUtils.isResourceOwner(user1, user2));
    }

    @Test
    void testIsResourceOwner_ByOwnerId_SameUser_ReturnsTrue() {
        assertTrue(securityUtils.isResourceOwner(1L, user1));
    }

    @Test
    void testIsResourceOwner_ByOwnerId_DifferentUser_ReturnsFalse() {
        assertFalse(securityUtils.isResourceOwner(1L, user2));
    }
}