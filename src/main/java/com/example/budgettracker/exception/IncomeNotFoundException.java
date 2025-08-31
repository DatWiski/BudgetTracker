package com.example.budgettracker.exception;

public class IncomeNotFoundException extends RuntimeException {
  public IncomeNotFoundException(String message) {
    super(message);
  }
}
