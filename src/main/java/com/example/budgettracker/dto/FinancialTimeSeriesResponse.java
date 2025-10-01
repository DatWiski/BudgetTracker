package com.example.budgettracker.dto;

import java.time.LocalDate;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FinancialTimeSeriesResponse {
  private List<DataPoint> dataPoints;

  @Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class DataPoint {
    private LocalDate date;
    private double income;
    private double expenses;
    private double net;
  }
}
