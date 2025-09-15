package com.example.budgettracker.controller;

import com.example.budgettracker.dto.CategoryResponse;
import com.example.budgettracker.model.AppUser;
import com.example.budgettracker.model.CategoryType;
import com.example.budgettracker.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Tag(name = "Categories", description = "Category management operations")
public class CategoryController {

  private final CategoryService categoryService;

  @GetMapping("/api/categories")
  @Operation(
      summary = "Get categories",
      description = "Retrieves categories for the authenticated user, optionally filtered by type")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Categories retrieved successfully"),
        @ApiResponse(responseCode = "401", description = "User not authenticated")
      })
  public ResponseEntity<List<CategoryResponse>> getCategories(
      @Parameter(hidden = true) AppUser appUser, @RequestParam(required = false) String type) {

    if ("income".equalsIgnoreCase(type)) {
      List<CategoryResponse> response =
          categoryService.getCategoriesByTypeForUser(appUser, CategoryType.INCOME);
      return ResponseEntity.ok(response);
    } else if ("subscription".equalsIgnoreCase(type)) {
      List<CategoryResponse> response =
          categoryService.getCategoriesByTypeForUser(appUser, CategoryType.SUBSCRIPTION);
      return ResponseEntity.ok(response);
    } else if ("bill".equalsIgnoreCase(type)) {
      List<CategoryResponse> response =
          categoryService.getCategoriesByTypeForUser(appUser, CategoryType.BILL);
      return ResponseEntity.ok(response);
    } else {
      // Default behavior - all categories with subscription counts
      List<CategoryResponse> response = categoryService.getCategoriesWithCountsForUser(appUser);
      return ResponseEntity.ok(response);
    }
  }
}
