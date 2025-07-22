package com.example.subtrackerproject.controller;

import com.example.subtrackerproject.dto.CategoryResponse;
import com.example.subtrackerproject.model.Category;
import com.example.subtrackerproject.service.AppUserService;
import com.example.subtrackerproject.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;
import java.util.stream.Collectors;

@Controller
@RequiredArgsConstructor
public class CategoryWebController {

    private final CategoryService categoryService;
    private final AppUserService appUserService;

    @GetMapping("/categories")
    public String categoryManager(@AuthenticationPrincipal OidcUser principal, Model model) {
        if (principal != null) {
            appUserService.findByOidcUser(principal)
                    .ifPresent(user -> {
                        List<Category> categories = categoryService.getCategoriesForUser(user);
                        List<CategoryResponse> categoryResponses = categories.stream()
                                .map(category -> CategoryResponse.fromEntity(
                                    category, 
                                    categoryService.getActiveSubscriptionCount(category)
                                ))
                                .collect(Collectors.toList());
                        
                        model.addAttribute("categories", categoryResponses);
                        model.addAttribute("user", user);
                    });
        }
        return "category-manager";
    }
} 