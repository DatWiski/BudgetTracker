package com.example.budgettracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public final class BudgetTrackerApplication {

  private BudgetTrackerApplication() {
    // Private constructor to prevent instantiation
  }

  public static void main(String[] args) {
    SpringApplication.run(BudgetTrackerApplication.class, args);
  }
}
