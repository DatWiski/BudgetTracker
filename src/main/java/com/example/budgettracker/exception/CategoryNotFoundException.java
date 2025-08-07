package com.example.budgettracker.exception;

public class CategoryNotFoundException extends RuntimeException {
    
    public CategoryNotFoundException(Long categoryId) {
        super(String.format("Category with ID %d was not found", categoryId));
    }
    
    public CategoryNotFoundException(String categoryName, Long userId) {
        super(String.format("Category '%s' was not found for user %d", categoryName, userId));
    }
    
    public CategoryNotFoundException(String message) {
        super(message);
    }
    
    public CategoryNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}