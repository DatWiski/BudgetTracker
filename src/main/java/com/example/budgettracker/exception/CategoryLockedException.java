package com.example.budgettracker.exception;

public class CategoryLockedException extends RuntimeException {
    
    public CategoryLockedException(String categoryName) {
        super(String.format("Category '%s' is locked and cannot be modified", categoryName));
    }
    
    public CategoryLockedException(Long categoryId) {
        super(String.format("Category with ID %d is locked and cannot be modified", categoryId));
    }
    
    public CategoryLockedException(String message, Throwable cause) {
        super(message, cause);
    }
}