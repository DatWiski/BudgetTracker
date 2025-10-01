package com.example.budgettracker.service;

import com.example.budgettracker.dto.CategoryBreakdownResponse;
import com.example.budgettracker.dto.DashboardOverviewResponse;
import com.example.budgettracker.dto.FinancialTimeSeriesResponse;
import com.example.budgettracker.model.AppUser;

public interface DashboardService {
  DashboardOverviewResponse getFinancialOverview(AppUser user);

  FinancialTimeSeriesResponse getFinancialTimeSeries(AppUser user, int months);

  CategoryBreakdownResponse getCategoryBreakdown(AppUser user);
}
