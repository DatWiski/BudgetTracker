package com.example.budgettracker.controller;

import com.example.budgettracker.dto.CategoryResponse;
import com.example.budgettracker.model.AppUser;
import com.example.budgettracker.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories(
            AppUser appUser,
            @PageableDefault(size = 50, sort = "name") Pageable pageable) {
        List<CategoryResponse> response = categoryService.getCategoriesWithCountsForUser(appUser);
        return ResponseEntity.ok(response);
    }


}
