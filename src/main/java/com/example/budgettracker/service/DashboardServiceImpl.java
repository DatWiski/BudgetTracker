package com.example.budgettracker.service;

import com.example.budgettracker.dto.DashboardOverviewResponse;
import com.example.budgettracker.model.AppUser;
import com.example.budgettracker.model.Bill;
import com.example.budgettracker.model.Income;
import com.example.budgettracker.model.Subscription;
import com.example.budgettracker.repository.BillRepository;
import com.example.budgettracker.repository.IncomeRepository;
import com.example.budgettracker.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {
    
    private final SubscriptionRepository subscriptionRepository;
    private final BillRepository billRepository;
    private final IncomeRepository incomeRepository;

    @Override
    public DashboardOverviewResponse getFinancialOverview(AppUser user) {
        // Get current month data
        LocalDate now = LocalDate.now();
        LocalDate monthStart = now.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate monthEnd = now.with(TemporalAdjusters.lastDayOfMonth());
        
        // Calculate total monthly income
        double totalIncome = calculateMonthlyIncome(user, monthStart, monthEnd);
        
        // Calculate monthly expenses from subscriptions and bills
        double subscriptionExpenses = calculateMonthlySubscriptionExpenses(user);
        double billExpenses = calculateMonthlyBillExpenses(user);
        double totalExpenses = subscriptionExpenses + billExpenses;
        
        // Calculate derived metrics
        double availableMoney = totalIncome - totalExpenses;
        double savingsRate = totalIncome > 0 ? (availableMoney / totalIncome) * 100 : 0;
        
        // Get counts
        int activeSubscriptions = getActiveSubscriptionCount(user);
        int activeBills = getActiveBillCount(user);
        
        return new DashboardOverviewResponse(
            totalIncome,
            totalExpenses,
            availableMoney,
            savingsRate,
            subscriptionExpenses,
            billExpenses,
            activeSubscriptions,
            activeBills
        );
    }
    
    private double calculateMonthlyIncome(AppUser user, LocalDate monthStart, LocalDate monthEnd) {
        List<Income> incomes = incomeRepository.findByAppUserAndIncomeDateBetweenOrderByIncomeDateDesc(
            user, monthStart, monthEnd);
        
        return incomes.stream()
            .mapToDouble(income -> income.getAmount().doubleValue())
            .sum();
    }
    
    private double calculateMonthlySubscriptionExpenses(AppUser user) {
        List<Subscription> activeSubscriptions = subscriptionRepository.findByAppUserAndActive(user, true);
        
        return activeSubscriptions.stream()
            .mapToDouble(this::convertToMonthlyAmount)
            .sum();
    }
    
    private double calculateMonthlyBillExpenses(AppUser user) {
        List<Bill> activeBills = billRepository.findByAppUserAndActive(user, true);
        
        return activeBills.stream()
            .mapToDouble(this::convertToMonthlyAmount)
            .sum();
    }
    
    private int getActiveSubscriptionCount(AppUser user) {
        return subscriptionRepository.findByAppUserAndActive(user, true).size();
    }
    
    private int getActiveBillCount(AppUser user) {
        return billRepository.findByAppUserAndActive(user, true).size();
    }
    
    /**
     * Converts subscription/bill amount to monthly equivalent based on period
     */
    private double convertToMonthlyAmount(Subscription subscription) {
        return convertPeriodToMonthly(subscription.getPrice().doubleValue(), subscription.getPeriod());
    }
    
    private double convertToMonthlyAmount(Bill bill) {
        return convertPeriodToMonthly(bill.getAmount().doubleValue(), bill.getPeriod());
    }
    
    private double convertPeriodToMonthly(double amount, com.example.budgettracker.model.Period period) {
        switch (period) {
            case DAILY:
                return amount * (365.0 / 12.0); // More precise than 30 days
            case WEEKLY:
                return amount * (52.0 / 12.0); // More precise than 4.33
            case MONTHLY:
                return amount;
            case QUARTERLY:
                return amount / 3.0;
            case YEARLY:
                return amount / 12.0;
            case ONE_TIME:
            default:
                return 0; // One-time payments don't contribute to monthly recurring
        }
    }
}