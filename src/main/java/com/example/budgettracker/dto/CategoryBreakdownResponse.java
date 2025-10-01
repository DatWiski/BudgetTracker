package com.example.budgettracker.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryBreakdownResponse {
  private List<CategoryExpense> expenses;
  private double totalExpenses;

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class CategoryExpense {
    private String categoryName;
    private double amount;
    private double percentage;
    private int itemCount;
  }
}
