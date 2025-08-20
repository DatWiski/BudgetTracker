package com.example.budgettracker.exception;

public class BillNotFoundException extends RuntimeException {
    
    public BillNotFoundException(String message) {
        super(message);
    }
    
    public BillNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public BillNotFoundException(Long billId) {
        super("Bill not found with id: " + billId);
    }
}