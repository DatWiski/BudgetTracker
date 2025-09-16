package com.example.budgettracker.exception;

import com.example.budgettracker.dto.ErrorResponse;
import com.example.budgettracker.dto.ValidationErrorResponse;
import java.time.LocalDateTime;
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

@RestControllerAdvice(basePackages = "com.example.budgettracker.controller")
public class GlobalExceptionHandler {

  private static final Logger LOGGER = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  @ExceptionHandler(SubscriptionNotFoundException.class)
  public ResponseEntity<ErrorResponse> handleSubscriptionNotFound(
      SubscriptionNotFoundException ex) {
    LOGGER.warn("Subscription not found: {}", ex.getMessage());
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(new ErrorResponse(404, "Not Found", ex.getMessage(), LocalDateTime.now()));
  }

  @ExceptionHandler(BillNotFoundException.class)
  public ResponseEntity<ErrorResponse> handleBillNotFound(BillNotFoundException ex) {
    LOGGER.warn("Bill not found: {}", ex.getMessage());
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(new ErrorResponse(404, "Not Found", ex.getMessage(), LocalDateTime.now()));
  }

  @ExceptionHandler(UnauthorizedAccessException.class)
  public ResponseEntity<ErrorResponse> handleUnauthorizedAccess(UnauthorizedAccessException ex) {
    LOGGER.warn("Unauthorized access attempt: {}", ex.getMessage());
    return ResponseEntity.status(HttpStatus.FORBIDDEN)
        .body(new ErrorResponse(403, "Forbidden", ex.getMessage(), LocalDateTime.now()));
  }

  @ExceptionHandler(CategoryNotFoundException.class)
  public ResponseEntity<ErrorResponse> handleCategoryNotFound(CategoryNotFoundException ex) {
    LOGGER.warn("Category not found: {}", ex.getMessage());
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(new ErrorResponse(404, "Not Found", ex.getMessage(), LocalDateTime.now()));
  }

  @ExceptionHandler(CategoryLockedException.class)
  public ResponseEntity<ErrorResponse> handleCategoryLocked(CategoryLockedException ex) {
    LOGGER.warn("Category locked: {}", ex.getMessage());
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(new ErrorResponse(400, "Bad Request", ex.getMessage(), LocalDateTime.now()));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ValidationErrorResponse> handleValidationErrors(
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
        .body(new ValidationErrorResponse(400, "Validation failed", errors, LocalDateTime.now()));
  }

  @ExceptionHandler(ResponseStatusException.class)
  public ResponseEntity<ErrorResponse> handleResponseStatusException(ResponseStatusException ex) {
    LOGGER.warn("Response status exception: {}", ex.getMessage());
    String error = ex.getStatusCode().toString();
    return ResponseEntity.status(ex.getStatusCode())
        .body(
            new ErrorResponse(
                ex.getStatusCode().value(),
                error,
                ex.getReason() != null ? ex.getReason() : ex.getMessage(),
                LocalDateTime.now()));
  }

  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
    LOGGER.warn("Access denied: {}", ex.getMessage());
    return ResponseEntity.status(HttpStatus.FORBIDDEN)
        .body(
            new ErrorResponse(
                403,
                "Forbidden",
                "You don't have permission to access this resource",
                LocalDateTime.now()));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
    LOGGER.error("Unexpected error occurred", ex);
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(
            new ErrorResponse(
                500,
                "Internal Server Error",
                "An unexpected error occurred. Please try again later.",
                LocalDateTime.now()));
  }
}
