package com.example.budgettracker.exception;

import com.example.budgettracker.api.ApiResponse;
import java.util.HashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalExceptionHandler {

  private static final Logger LOGGER = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  @ExceptionHandler(SubscriptionNotFoundException.class)
  public ResponseEntity<ApiResponse<Void>> handleSubscriptionNotFound(
      SubscriptionNotFoundException ex) {
    LOGGER.warn("Subscription not found: {}", ex.getMessage());
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(ApiResponse.fail("NOT_FOUND", ex.getMessage()));
  }

  @ExceptionHandler(BillNotFoundException.class)
  public ResponseEntity<ApiResponse<Void>> handleBillNotFound(BillNotFoundException ex) {
    LOGGER.warn("Bill not found: {}", ex.getMessage());
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(ApiResponse.fail("NOT_FOUND", ex.getMessage()));
  }

  @ExceptionHandler(UnauthorizedAccessException.class)
  public ResponseEntity<ApiResponse<Void>> handleUnauthorizedAccess(
      UnauthorizedAccessException ex) {
    LOGGER.warn("Unauthorized access attempt: {}", ex.getMessage());
    return ResponseEntity.status(HttpStatus.FORBIDDEN)
        .body(ApiResponse.fail("FORBIDDEN", ex.getMessage()));
  }

  @ExceptionHandler(CategoryNotFoundException.class)
  public ResponseEntity<ApiResponse<Void>> handleCategoryNotFound(CategoryNotFoundException ex) {
    LOGGER.warn("Category not found: {}", ex.getMessage());
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(ApiResponse.fail("NOT_FOUND", ex.getMessage()));
  }

  @ExceptionHandler(CategoryLockedException.class)
  public ResponseEntity<ApiResponse<Void>> handleCategoryLocked(CategoryLockedException ex) {
    LOGGER.warn("Category locked: {}", ex.getMessage());
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(ApiResponse.fail("BAD_REQUEST", ex.getMessage()));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationErrors(
      MethodArgumentNotValidException ex) {
    LOGGER.warn("Validation failed: {}", ex.getMessage());

    Map<String, String> errors = new HashMap<>();
    ex.getBindingResult()
        .getAllErrors()
        .forEach(
            (error) -> {
              String fieldName = ((FieldError) error).getField();
              String errorMessage = error.getDefaultMessage();
              errors.put(fieldName, errorMessage);
            });

    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(ApiResponse.fail("BAD_REQUEST", "Validation failed"));
  }

  @ExceptionHandler(ResponseStatusException.class)
  public ResponseEntity<ApiResponse<Void>> handleResponseStatusException(
      ResponseStatusException ex) {
    LOGGER.warn("Response status exception: {}", ex.getMessage());
    String code = ex.getStatusCode().toString().replace(" ", "_").toUpperCase();
    return ResponseEntity.status(ex.getStatusCode())
        .body(ApiResponse.fail(code, ex.getReason() != null ? ex.getReason() : ex.getMessage()));
  }

  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex) {
    LOGGER.warn("Access denied: {}", ex.getMessage());
    return ResponseEntity.status(HttpStatus.FORBIDDEN)
        .body(ApiResponse.fail("FORBIDDEN", "You don't have permission to access this resource"));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
    LOGGER.error("Unexpected error occurred", ex);
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(
            ApiResponse.fail(
                "INTERNAL_ERROR", "An unexpected error occurred. Please try again later."));
  }
}
