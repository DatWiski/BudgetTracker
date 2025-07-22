package com.example.subtrackerproject.service;

import com.example.subtrackerproject.model.AppUser;
import com.example.subtrackerproject.model.Category;
import com.example.subtrackerproject.repository.CategoryRepository;
import com.example.subtrackerproject.repository.SubscriptionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private SubscriptionRepository subscriptionRepository;

    @InjectMocks
    private CategoryServiceImpl categoryService;

    private AppUser user;
    private Category category;

    @BeforeEach
    void setUp() {
        user = new AppUser();
        user.setId(1L);
        user.setFullName("Test User");

        category = new Category();
        category.setId(1L);
        category.setName("Test Category");
        category.setAppUser(user);
        category.setColor("#FFFFFF");
    }

    @Test
    void testCreateCategory() {
        when(categoryRepository.findByNameIgnoreCaseAndAppUser(anyString(), any(AppUser.class))).thenReturn(Optional.empty());
        when(categoryRepository.save(any(Category.class))).thenReturn(category);

        Category result = categoryService.createCategory("Test Category", "#FFFFFF", user);

        assertNotNull(result);
        assertEquals("Test Category", result.getName());
        verify(categoryRepository, times(1)).save(any(Category.class));
    }

    @Test
    void testCreateCategory_alreadyExists() {
        when(categoryRepository.findByNameIgnoreCaseAndAppUser(anyString(), any(AppUser.class))).thenReturn(Optional.of(category));

        assertThrows(IllegalArgumentException.class, () -> {
            categoryService.createCategory("Test Category", "#FFFFFF", user);
        });
    }


    @Test
    void testGetCategoryByIdForUser() {
        when(categoryRepository.findByIdAndUserId(anyLong(), anyLong())).thenReturn(Optional.of(category));

        Optional<Category> result = categoryService.getCategoryByIdForUser(1L, user);

        assertTrue(result.isPresent());
        assertEquals("Test Category", result.get().getName());
    }

    @Test
    void testUpdateCategory() {
        Category updatedCategory = new Category("Updated", "#000000", user);
        when(categoryRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(category));
        when(categoryRepository.findByNameIgnoreCaseAndAppUser("Updated", user)).thenReturn(Optional.empty());
        when(categoryRepository.save(any(Category.class))).thenReturn(updatedCategory);

        Category result = categoryService.updateCategory(1L, "Updated", "#000000", user);

        assertNotNull(result);
        assertEquals("Updated", result.getName());
        assertEquals("#000000", result.getColor());
    }

    @Test
    void testDeleteCategory() {
        Category targetCategory = new Category();
        targetCategory.setId(2L);
        targetCategory.setName("Target Category");
        targetCategory.setAppUser(user);

        when(categoryRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(category));
        when(categoryRepository.findByIdAndUserId(2L, 1L)).thenReturn(Optional.of(targetCategory));
        when(subscriptionRepository.findByCategoryAndAppUser(category, user)).thenReturn(Collections.emptyList());

        categoryService.deleteCategory(1L, 2L, user);

        verify(categoryRepository, times(1)).delete(category);
    }
} 