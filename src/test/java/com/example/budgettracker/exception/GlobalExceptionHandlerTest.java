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
        ErrorResponse body = response.getBody();
        assertNotNull(body);
        assertEquals(404, body.getStatus());
        assertEquals("Subscription not found", body.getError());
        assertTrue(body.getMessage().contains("123"));
    }

    @Test
    void testHandleUnauthorizedAccess() {
        UnauthorizedAccessException exception = new UnauthorizedAccessException("Subscription 123", 456L);
        
        ResponseEntity<ErrorResponse> response = globalExceptionHandler.handleUnauthorizedAccess(exception);
        
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        ErrorResponse body = response.getBody();
        assertNotNull(body);
        assertEquals(403, body.getStatus());
        assertEquals("Access denied", body.getError());
        assertTrue(body.getMessage().contains("Subscription 123"));
        assertTrue(body.getMessage().contains("456"));
    }

    @Test
    void testHandleAccessDenied() {
        AccessDeniedException exception = new AccessDeniedException("Access denied");
        
        ResponseEntity<ErrorResponse> response = globalExceptionHandler.handleAccessDenied(exception);
        
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        ErrorResponse body = response.getBody();
        assertNotNull(body);
        assertEquals(403, body.getStatus());
        assertEquals("Access denied", body.getError());
        assertEquals("You don't have permission to access this resource", body.getMessage());
    }

    @Test
    void testHandleGenericException() {
        RuntimeException exception = new RuntimeException("Something went wrong");
        
        ResponseEntity<ErrorResponse> response = globalExceptionHandler.handleGenericException(exception);
        
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        ErrorResponse body = response.getBody();
        assertNotNull(body);
        assertEquals(500, body.getStatus());
        assertEquals("Internal server error", body.getError());
        assertEquals("An unexpected error occurred. Please try again later.", body.getMessage());
    }
}