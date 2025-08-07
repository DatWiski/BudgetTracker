package com.example.budgettracker.exception;

public class UnauthorizedAccessException extends RuntimeException {
    
    public UnauthorizedAccessException(String message) {
        super(message);
    }
    
    public UnauthorizedAccessException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public UnauthorizedAccessException(String resource, Long userId) {
        super("User " + userId + " is not authorized to access " + resource);
    }
} 