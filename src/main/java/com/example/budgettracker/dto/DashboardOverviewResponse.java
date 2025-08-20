package com.example.budgettracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardOverviewResponse {
    private double totalIncome;
    private double totalExpenses;
    private double availableMoney;
    private double savingsRate;
    
    // Breakdown of expenses
    private double subscriptionExpenses;
    private double billExpenses;
    
    // Count metrics
    private int activeSubscriptions;
    private int activeBills;
}