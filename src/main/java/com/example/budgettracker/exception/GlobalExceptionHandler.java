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

@RestControllerAdvice
public class GlobalExceptionHandler {

  private static final Logger LOGGER = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  @ExceptionHandler(SubscriptionNotFoundException.class)
  public ResponseEntity<ErrorResponse> handleSubscriptionNotFound(
      SubscriptionNotFoundException ex) {
    LOGGER.warn("Subscription not found: {}", ex.getMessage());
    ErrorResponse error =
        new ErrorResponse(
            HttpStatus.NOT_FOUND.value(),
            "Subscription not found",
            ex.getMessage(),
            LocalDateTime.now());
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
  }

  @ExceptionHandler(BillNotFoundException.class)
  public ResponseEntity<ErrorResponse> handleBillNotFound(BillNotFoundException ex) {
    LOGGER.warn("Bill not found: {}", ex.getMessage());
    ErrorResponse error =
        new ErrorResponse(
            HttpStatus.NOT_FOUND.value(), "Bill not found", ex.getMessage(), LocalDateTime.now());
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
  }

  @ExceptionHandler(UnauthorizedAccessException.class)
  public ResponseEntity<ErrorResponse> handleUnauthorizedAccess(UnauthorizedAccessException ex) {
    LOGGER.warn("Unauthorized access attempt: {}", ex.getMessage());
    ErrorResponse error =
        new ErrorResponse(
            HttpStatus.FORBIDDEN.value(), "Access denied", ex.getMessage(), LocalDateTime.now());
    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
  }

  @ExceptionHandler(CategoryNotFoundException.class)
  public ResponseEntity<ErrorResponse> handleCategoryNotFound(CategoryNotFoundException ex) {
    LOGGER.warn("Category not found: {}", ex.getMessage());
    ErrorResponse error =
        new ErrorResponse(
            HttpStatus.NOT_FOUND.value(),
            "Category not found",
            ex.getMessage(),
            LocalDateTime.now());
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
  }

  @ExceptionHandler(CategoryLockedException.class)
  public ResponseEntity<ErrorResponse> handleCategoryLocked(CategoryLockedException ex) {
    LOGGER.warn("Category locked: {}", ex.getMessage());
    ErrorResponse error =
        new ErrorResponse(
            HttpStatus.BAD_REQUEST.value(),
            "Category locked",
            ex.getMessage(),
            LocalDateTime.now());
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
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

    ValidationErrorResponse errorResponse =
        new ValidationErrorResponse(
            HttpStatus.BAD_REQUEST.value(), "Validation failed", errors, LocalDateTime.now());
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
  }

  @ExceptionHandler(ResponseStatusException.class)
  public ResponseEntity<ErrorResponse> handleResponseStatusException(ResponseStatusException ex) {
    LOGGER.warn("Response status exception: {}", ex.getMessage());
    ErrorResponse error =
        new ErrorResponse(
            ex.getStatusCode().value(), ex.getReason(), ex.getMessage(), LocalDateTime.now());
    return ResponseEntity.status(ex.getStatusCode()).body(error);
  }

  @ExceptionHandler(AccessDeniedException.class)
  public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
    LOGGER.warn("Access denied: {}", ex.getMessage());
    ErrorResponse error =
        new ErrorResponse(
            HttpStatus.FORBIDDEN.value(),
            "Access denied",
            "You don't have permission to access this resource",
            LocalDateTime.now());
    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
    LOGGER.error("Unexpected error occurred", ex);
    ErrorResponse error =
        new ErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "Internal server error",
            "An unexpected error occurred. Please try again later.",
            LocalDateTime.now());
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
  }
}
