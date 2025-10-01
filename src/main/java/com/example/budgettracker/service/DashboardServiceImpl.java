package com.example.budgettracker.service;

import com.example.budgettracker.dto.CategoryBreakdownResponse;
import com.example.budgettracker.dto.CategoryBreakdownResponse.CategoryExpense;
import com.example.budgettracker.dto.DashboardOverviewResponse;
import com.example.budgettracker.dto.FinancialTimeSeriesResponse;
import com.example.budgettracker.dto.FinancialTimeSeriesResponse.DataPoint;
import com.example.budgettracker.model.AppUser;
import com.example.budgettracker.model.Bill;
import com.example.budgettracker.model.Income;
import com.example.budgettracker.model.Subscription;
import com.example.budgettracker.repository.BillRepository;
import com.example.budgettracker.repository.IncomeRepository;
import com.example.budgettracker.repository.SubscriptionRepository;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
    double billExpenses = calculateMonthlyBillExpenses(user, monthStart, monthEnd);
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
        activeBills);
  }

  private double calculateMonthlyIncome(AppUser user, LocalDate monthStart, LocalDate monthEnd) {
    // Get one-time incomes for this month
    List<Income> oneTimeIncomes =
        incomeRepository.findByAppUserAndIncomeDateBetweenOrderByIncomeDateDesc(
            user, monthStart, monthEnd);

    double oneTimeTotal =
        oneTimeIncomes.stream()
            .filter(income -> income.getPeriod() == com.example.budgettracker.model.Period.ONE_TIME)
            .mapToDouble(income -> income.getAmount().doubleValue())
            .sum();

    // Get all recurring incomes (not one-time)
    List<Income> allIncomes = incomeRepository.findByAppUser(user);
    double recurringTotal =
        allIncomes.stream()
            .filter(income -> income.getPeriod() != com.example.budgettracker.model.Period.ONE_TIME)
            .mapToDouble(this::convertIncomeToMonthlyAmount)
            .sum();

    return oneTimeTotal + recurringTotal;
  }

  private double convertIncomeToMonthlyAmount(Income income) {
    return convertPeriodToMonthly(income.getAmount().doubleValue(), income.getPeriod());
  }

  private double calculateMonthlySubscriptionExpenses(AppUser user) {
    List<Subscription> activeSubscriptions =
        subscriptionRepository.findByAppUserAndActive(user, true);

    return activeSubscriptions.stream().mapToDouble(this::convertToMonthlyAmount).sum();
  }

  private double calculateMonthlyBillExpenses(
      AppUser user, LocalDate monthStart, LocalDate monthEnd) {
    List<Bill> activeBills = billRepository.findByAppUserAndActive(user, true);

    // Get one-time bills for this month
    double oneTimeBills =
        activeBills.stream()
            .filter(
                bill ->
                    bill.getPeriod() == com.example.budgettracker.model.Period.ONE_TIME
                        && bill.getDueDate() != null
                        && !bill.getDueDate().isBefore(monthStart)
                        && !bill.getDueDate().isAfter(monthEnd))
            .mapToDouble(bill -> bill.getAmount().doubleValue())
            .sum();

    // Get recurring bills (converted to monthly)
    double recurringBills =
        activeBills.stream()
            .filter(bill -> bill.getPeriod() != com.example.budgettracker.model.Period.ONE_TIME)
            .mapToDouble(this::convertToMonthlyAmount)
            .sum();

    return oneTimeBills + recurringBills;
  }

  private int getActiveSubscriptionCount(AppUser user) {
    return subscriptionRepository.findByAppUserAndActive(user, true).size();
  }

  private int getActiveBillCount(AppUser user) {
    return billRepository.findByAppUserAndActive(user, true).size();
  }

  /** Converts subscription/bill amount to monthly equivalent based on period */
  private double convertToMonthlyAmount(Subscription subscription) {
    return convertPeriodToMonthly(subscription.getPrice().doubleValue(), subscription.getPeriod());
  }

  private double convertToMonthlyAmount(Bill bill) {
    return convertPeriodToMonthly(bill.getAmount().doubleValue(), bill.getPeriod());
  }

  private double convertPeriodToMonthly(
      double amount, com.example.budgettracker.model.Period period) {
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

  @Override
  public FinancialTimeSeriesResponse getFinancialTimeSeries(AppUser user, int months) {
    LocalDate endDate = LocalDate.now().with(TemporalAdjusters.lastDayOfMonth());
    LocalDate startDate = endDate.minusMonths(months - 1).with(TemporalAdjusters.firstDayOfMonth());

    List<DataPoint> dataPoints = new ArrayList<>();

    // Get all income (one-time within period, and all recurring)
    List<Income> oneTimeIncomes =
        incomeRepository.findByAppUserAndIncomeDateBetweenOrderByIncomeDateDesc(
            user, startDate, endDate);
    List<Income> allIncomes = incomeRepository.findByAppUser(user);

    // Get active subscriptions and bills
    List<Subscription> activeSubscriptions =
        subscriptionRepository.findByAppUserAndActive(user, true);
    List<Bill> activeBills = billRepository.findByAppUserAndActive(user, true);

    // Generate data points for each month
    LocalDate currentMonth = startDate;
    while (!currentMonth.isAfter(endDate)) {
      LocalDate monthStart = currentMonth.with(TemporalAdjusters.firstDayOfMonth());
      LocalDate monthEnd = currentMonth.with(TemporalAdjusters.lastDayOfMonth());

      // Calculate one-time income for this specific month
      double oneTimeMonthIncome =
          oneTimeIncomes.stream()
              .filter(
                  income ->
                      income.getPeriod() == com.example.budgettracker.model.Period.ONE_TIME
                          && !income.getIncomeDate().isBefore(monthStart)
                          && !income.getIncomeDate().isAfter(monthEnd))
              .mapToDouble(income -> income.getAmount().doubleValue())
              .sum();

      // Calculate recurring income only for items that started before or during this month
      double recurringIncome =
          allIncomes.stream()
              .filter(
                  income ->
                      income.getPeriod() != com.example.budgettracker.model.Period.ONE_TIME
                          && !income.getIncomeDate().isAfter(monthEnd))
              .mapToDouble(this::convertIncomeToMonthlyAmount)
              .sum();

      // Calculate recurring expenses only for items that started before or during this month
      double recurringExpenses = 0;

      for (Subscription sub : activeSubscriptions) {
        if (sub.getNextBillingDate() != null
            && !sub.getNextBillingDate().isAfter(monthEnd.plusMonths(1))) {
          recurringExpenses += convertToMonthlyAmount(sub);
        }
      }

      for (Bill bill : activeBills) {
        // Only include recurring bills that started before or during this month
        if (bill.getPeriod() != com.example.budgettracker.model.Period.ONE_TIME
            && bill.getDueDate() != null
            && !bill.getDueDate().isAfter(monthEnd.plusMonths(1))) {
          recurringExpenses += convertToMonthlyAmount(bill);
        }
      }

      // Calculate one-time bills for this specific month
      double oneTimeBills =
          activeBills.stream()
              .filter(
                  bill ->
                      bill.getPeriod() == com.example.budgettracker.model.Period.ONE_TIME
                          && bill.getDueDate() != null
                          && !bill.getDueDate().isBefore(monthStart)
                          && !bill.getDueDate().isAfter(monthEnd))
              .mapToDouble(bill -> bill.getAmount().doubleValue())
              .sum();

      // Total income and expenses for this month
      double monthIncome = recurringIncome + oneTimeMonthIncome;
      double monthExpenses = recurringExpenses + oneTimeBills;
      double net = monthIncome - monthExpenses;

      dataPoints.add(new DataPoint(monthStart, monthIncome, monthExpenses, net));

      currentMonth = currentMonth.plusMonths(1);
    }

    return new FinancialTimeSeriesResponse(dataPoints);
  }

  @Override
  public CategoryBreakdownResponse getCategoryBreakdown(AppUser user) {
    List<Subscription> activeSubscriptions =
        subscriptionRepository.findByAppUserAndActive(user, true);
    List<Bill> activeBills = billRepository.findByAppUserAndActive(user, true);

    // Group expenses by category
    Map<String, CategoryData> categoryMap = new HashMap<>();

    // Add subscriptions
    for (Subscription sub : activeSubscriptions) {
      String categoryName =
          sub.getCategory() != null ? sub.getCategory().getName() : "Uncategorized";
      double monthlyAmount = convertToMonthlyAmount(sub);

      categoryMap.computeIfAbsent(categoryName, k -> new CategoryData()).add(monthlyAmount);
    }

    // Add bills (only recurring ones for monthly view)
    for (Bill bill : activeBills) {
      if (bill.getPeriod() != com.example.budgettracker.model.Period.ONE_TIME) {
        String categoryName =
            bill.getCategory() != null ? bill.getCategory().getName() : "Uncategorized";
        double monthlyAmount = convertToMonthlyAmount(bill);

        categoryMap.computeIfAbsent(categoryName, k -> new CategoryData()).add(monthlyAmount);
      }
    }

    // Calculate total and create response
    double totalExpenses = categoryMap.values().stream().mapToDouble(data -> data.amount).sum();

    List<CategoryExpense> expenses = new ArrayList<>();
    for (Map.Entry<String, CategoryData> entry : categoryMap.entrySet()) {
      CategoryData data = entry.getValue();
      double percentage = totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0;
      expenses.add(new CategoryExpense(entry.getKey(), data.amount, percentage, data.count));
    }

    // Sort by amount descending
    expenses.sort((a, b) -> Double.compare(b.getAmount(), a.getAmount()));

    return new CategoryBreakdownResponse(expenses, totalExpenses);
  }

  // Helper class for aggregating category data
  private static class CategoryData {
    double amount = 0;
    int count = 0;

    void add(double amount) {
      this.amount += amount;
      this.count++;
    }
  }
}
