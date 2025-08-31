package com.example.budgettracker.exception;

import static org.junit.jupiter.api.Assertions.*;

import com.example.budgettracker.api.ApiResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;

class GlobalExceptionHandlerTest {

  private GlobalExceptionHandler globalExceptionHandler;

  @BeforeEach
  void setUp() {
    globalExceptionHandler = new GlobalExceptionHandler();
  }

  @Test
  void testHandleSubscriptionNotFound() {
    SubscriptionNotFoundException exception = new SubscriptionNotFoundException(123L);

    ResponseEntity<ApiResponse<Void>> response =
        globalExceptionHandler.handleSubscriptionNotFound(exception);

    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    ApiResponse<Void> body = response.getBody();
    assertNotNull(body);
    assertFalse(body.success());
    assertNull(body.data());
    assertNotNull(body.error());
    assertEquals("NOT_FOUND", body.error().code());
    assertTrue(body.error().message().contains("123"));
  }

  @Test
  void testHandleUnauthorizedAccess() {
    UnauthorizedAccessException exception =
        new UnauthorizedAccessException("Subscription 123", 456L);

    ResponseEntity<ApiResponse<Void>> response =
        globalExceptionHandler.handleUnauthorizedAccess(exception);

    assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    ApiResponse<Void> body = response.getBody();
    assertNotNull(body);
    assertFalse(body.success());
    assertNull(body.data());
    assertNotNull(body.error());
    assertEquals("FORBIDDEN", body.error().code());
    assertTrue(body.error().message().contains("Subscription 123"));
    assertTrue(body.error().message().contains("456"));
  }

  @Test
  void testHandleAccessDenied() {
    AccessDeniedException exception = new AccessDeniedException("Access denied");

    ResponseEntity<ApiResponse<Void>> response =
        globalExceptionHandler.handleAccessDenied(exception);

    assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    ApiResponse<Void> body = response.getBody();
    assertNotNull(body);
    assertFalse(body.success());
    assertNull(body.data());
    assertNotNull(body.error());
    assertEquals("FORBIDDEN", body.error().code());
    assertEquals("You don't have permission to access this resource", body.error().message());
  }

  @Test
  void testHandleGenericException() {
    RuntimeException exception = new RuntimeException("Something went wrong");

    ResponseEntity<ApiResponse<Void>> response =
        globalExceptionHandler.handleGenericException(exception);

    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    ApiResponse<Void> body = response.getBody();
    assertNotNull(body);
    assertFalse(body.success());
    assertNull(body.data());
    assertNotNull(body.error());
    assertEquals("INTERNAL_ERROR", body.error().code());
    assertEquals("An unexpected error occurred. Please try again later.", body.error().message());
  }
}
