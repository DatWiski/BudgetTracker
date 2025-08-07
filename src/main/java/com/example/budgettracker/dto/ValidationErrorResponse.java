package com.example.budgettracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@AllArgsConstructor
public class ValidationErrorResponse {
    private int status;
    private String error;
    private Map<String, String> fieldErrors;
    private LocalDateTime timestamp;
}