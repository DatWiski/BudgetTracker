package com.example.subtrackerproject.controller;

import com.example.subtrackerproject.dto.CategoryRequest;
import com.example.subtrackerproject.dto.CategoryResponse;
import com.example.subtrackerproject.model.Category;
import com.example.subtrackerproject.service.AppUserService;
import com.example.subtrackerproject.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {
    
    private final CategoryService categoryService;
    private final AppUserService appUserService;
    
    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories(@AuthenticationPrincipal Jwt jwt) {
        var appUser = appUserService.findByGoogleSub(jwt.getSubject())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        
        List<Category> categories = categoryService.getCategoriesForUser(appUser);
        List<CategoryResponse> response = categories.stream()
                .map(category -> CategoryResponse.fromEntity(
                    category, 
                    categoryService.getActiveSubscriptionCount(category)
                ))
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        var appUser = appUserService.findByGoogleSub(jwt.getSubject())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        
        Category category = categoryService.getCategoryByIdForUser(id, appUser)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
        
        CategoryResponse response = CategoryResponse.fromEntity(
            category,
            categoryService.getActiveSubscriptionCount(category)
        );
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(@Valid @RequestBody CategoryRequest request, @AuthenticationPrincipal Jwt jwt) {
        var appUser = appUserService.findByGoogleSub(jwt.getSubject())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        
        try {
            Category category = categoryService.createCategory(request.getName(), request.getColor(), appUser);
            CategoryResponse response = CategoryResponse.fromEntity(category);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<CategoryResponse> updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryRequest request, @AuthenticationPrincipal Jwt jwt) {
        var appUser = appUserService.findByGoogleSub(jwt.getSubject())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        categoryService.getCategoryByIdForUser(id, appUser)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
        
        try {
            Category category = categoryService.updateCategory(id, request.getName(), request.getColor(), appUser);
            CategoryResponse response = CategoryResponse.fromEntity(
                category,
                categoryService.getActiveSubscriptionCount(category)
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id, @RequestParam(required = false) Long newCategoryId, @AuthenticationPrincipal Jwt jwt) {
        var appUser = appUserService.findByGoogleSub(jwt.getSubject())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        
        try {
            categoryService.deleteCategory(id, newCategoryId, appUser);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
    
    @PostMapping("/{sourceId}/merge/{targetId}")
    public ResponseEntity<CategoryResponse> mergeCategories(@PathVariable Long sourceId, @PathVariable Long targetId, @AuthenticationPrincipal Jwt jwt) {
        var appUser = appUserService.findByGoogleSub(jwt.getSubject())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        
        try {
            Category mergedCategory = categoryService.mergeCategories(sourceId, targetId, appUser);
            CategoryResponse response = CategoryResponse.fromEntity(
                mergedCategory,
                categoryService.getActiveSubscriptionCount(mergedCategory)
            );
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }
    
    @GetMapping("/pie-chart-data")
    public ResponseEntity<Map<String, Object>> getPieChartData(@AuthenticationPrincipal Jwt jwt) {
        var appUser = appUserService.findByGoogleSub(jwt.getSubject())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        
        Map<String, Object> pieChartData = categoryService.getPieChartData(appUser);
        return ResponseEntity.ok(pieChartData);
    }
    
    @GetMapping("/spend-data")
    public ResponseEntity<Map<String, Object>> getSpendData(@AuthenticationPrincipal Jwt jwt) {
        var appUser = appUserService.findByGoogleSub(jwt.getSubject())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        
        Map<String, Object> spendData = Map.of(
            "categorySpends", categoryService.getCategorySpendData(appUser)
        );
        return ResponseEntity.ok(spendData);
    }
} 