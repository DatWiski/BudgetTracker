package com.example.budgettracker.exception;

import com.example.budgettracker.dto.ErrorResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler globalExceptionHandler;

    @BeforeEach
    void setUp() {
        globalExceptionHandler = new GlobalExceptionHandler();
    }

    @Test
    void testHandleSubscriptionNotFound() {
        SubscriptionNotFoundException exception = new SubscriptionNotFoundException(123L);
        
        ResponseEntity<ErrorResponse> response = globalExceptionHandler.handleSubscriptionNotFound(exception);
        
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(404, response.getBody().getStatus());
        assertEquals("Subscription not found", response.getBody().getError());
        assertTrue(response.getBody().getMessage().contains("123"));
    }

    @Test
    void testHandleUnauthorizedAccess() {
        UnauthorizedAccessException exception = new UnauthorizedAccessException("Subscription 123", 456L);
        
        ResponseEntity<ErrorResponse> response = globalExceptionHandler.handleUnauthorizedAccess(exception);
        
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(403, response.getBody().getStatus());
        assertEquals("Access denied", response.getBody().getError());
        assertTrue(response.getBody().getMessage().contains("Subscription 123"));
        assertTrue(response.getBody().getMessage().contains("456"));
    }

    @Test
    void testHandleAccessDenied() {
        AccessDeniedException exception = new AccessDeniedException("Access denied");
        
        ResponseEntity<ErrorResponse> response = globalExceptionHandler.handleAccessDenied(exception);
        
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(403, response.getBody().getStatus());
        assertEquals("Access denied", response.getBody().getError());
        assertEquals("You don't have permission to access this resource", response.getBody().getMessage());
    }

    @Test
    void testHandleGenericException() {
        RuntimeException exception = new RuntimeException("Something went wrong");
        
        ResponseEntity<ErrorResponse> response = globalExceptionHandler.handleGenericException(exception);
        
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(500, response.getBody().getStatus());
        assertEquals("Internal server error", response.getBody().getError());
        assertEquals("An unexpected error occurred. Please try again later.", response.getBody().getMessage());
    }
}