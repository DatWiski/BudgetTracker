package com.example.budgettracker.exception;

public class SubscriptionNotFoundException extends RuntimeException {
    
    public SubscriptionNotFoundException(String message) {
        super(message);
    }
    
    public SubscriptionNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public SubscriptionNotFoundException(Long subscriptionId) {
        super("Subscription not found with id: " + subscriptionId);
    }
} 