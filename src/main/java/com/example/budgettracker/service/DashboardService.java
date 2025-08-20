package com.example.budgettracker.service;

import com.example.budgettracker.dto.DashboardOverviewResponse;
import com.example.budgettracker.model.AppUser;

public interface DashboardService {
    DashboardOverviewResponse getFinancialOverview(AppUser user);
}