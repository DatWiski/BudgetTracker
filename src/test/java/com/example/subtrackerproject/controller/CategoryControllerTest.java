package com.example.subtrackerproject.controller;

import com.example.subtrackerproject.dto.CategoryRequest;
import com.example.subtrackerproject.model.AppUser;
import com.example.subtrackerproject.model.Category;
import com.example.subtrackerproject.service.AppUserService;
import com.example.subtrackerproject.service.CategoryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CategoryController.class)
public class CategoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CategoryService categoryService;

    @MockBean
    private AppUserService appUserService;

    @Autowired
    private ObjectMapper objectMapper;

    private AppUser user;
    private Category category;

    @BeforeEach
    void setUp() {
        user = new AppUser("sub", "Test User", "test@example.com", "pic");
        category = new Category("Test Category", "#FFFFFF", user);
        category.setId(1L);
    }

    @Test
    @WithMockUser
    void getAllCategories() throws Exception {
        when(appUserService.findByGoogleSub(any())).thenReturn(Optional.of(user));
        when(categoryService.getCategoriesForUser(any(AppUser.class))).thenReturn(Collections.singletonList(category));

        mockMvc.perform(get("/api/categories")
                        .with(jwt()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void getCategoryById() throws Exception {
        when(appUserService.findByGoogleSub(any())).thenReturn(Optional.of(user));
        when(categoryService.getCategoryByIdForUser(anyLong(), any(AppUser.class))).thenReturn(Optional.of(category));

        mockMvc.perform(get("/api/categories/1")
                        .with(jwt()))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void createCategory() throws Exception {
        CategoryRequest request = new CategoryRequest();
        request.setName("New Category");
        request.setColor("#000000");

        when(appUserService.findByGoogleSub(anyString())).thenReturn(Optional.of(user));
        when(categoryService.createCategory(anyString(), anyString(), any(AppUser.class))).thenReturn(category);

        mockMvc.perform(post("/api/categories")
                        .with(jwt())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser
    void updateCategory() throws Exception {
        CategoryRequest request = new CategoryRequest();
        request.setName("Updated Category");
        request.setColor("#111111");

        when(appUserService.findByGoogleSub(anyString())).thenReturn(Optional.of(user));
        when(categoryService.getCategoryByIdForUser(anyLong(), any(AppUser.class))).thenReturn(Optional.of(category));
        when(categoryService.updateCategory(anyLong(), anyString(), anyString(), any(AppUser.class))).thenReturn(category);

        mockMvc.perform(put("/api/categories/1")
                        .with(jwt())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser
    void deleteCategory() throws Exception {
        when(appUserService.findByGoogleSub(anyString())).thenReturn(Optional.of(user));

        mockMvc.perform(delete("/api/categories/1")
                        .with(jwt()))
                .andExpect(status().isNoContent());
    }
} 