package com.example.subtrackerproject.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoryRequest {
    
    @NotBlank(message = "Category name is required")
    @Size(min = 1, max = 50, message = "Category name must be between 1 and 50 characters")
    private String name;
    
    @NotBlank(message = "Category color is required")
    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Color must be a valid hex color (e.g., #FF0000)")
    private String color;
} 