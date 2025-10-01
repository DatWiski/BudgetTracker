import { useState } from "react";
import { formatCurrency } from "../utils/currency";
import Icon from "../components/Icon";
import HeaderFinancialBar from "../components/HeaderFinancialBar";
import FinancialChart from "../components/FinancialChart";
import CategoryBreakdownChart from "../components/CategoryBreakdownChart";
import { useFinancialTimeSeries, useCategoryBreakdown } from "../hooks/useDashboard";
import type { DashboardOverview } from "../types";

interface DashboardProps {
  dashboardData?: DashboardOverview;
  isDashboardLoading?: boolean;
}

const Dashboard = ({ dashboardData, isDashboardLoading }: DashboardProps) => {
  const data = dashboardData;
  const isLoading = isDashboardLoading;
  const error = null; // Error handling from parent level

  const [selectedMonths, setSelectedMonths] = useState(6);

  // Fetch time-series data for the chart
  const { data: timeSeriesData, isLoading: isTimeSeriesLoading } = useFinancialTimeSeries(
    selectedMonths,
    true
  );

  // Fetch category breakdown data
  const { data: categoryData, isLoading: isCategoryLoading } = useCategoryBreakdown(true);

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="mb-10">
          <h1 className="heading-1">Dashboard</h1>
          <p className="text-muted">Your financial overview</p>
        </div>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="mb-10">
          <h1 className="heading-1">Dashboard</h1>
          <p className="text-muted">Your financial overview</p>
        </div>
        <div className="glass-card text-center">
          <Icon name="error" size={24} color="var(--color-error)" />
          <p className="text-muted mt-2">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  const overview = data!;

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="heading-1">Dashboard</h1>
      </div>

      {/* Financial Overview Bar */}
      <div className="mb-6">
        <HeaderFinancialBar data={overview} />
      </div>

      {/* Charts Grid - 70/30 split */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 mb-6">
        {/* Financial Chart - Takes 7 columns (70%) */}
        <div className="lg:col-span-7">
          {!isTimeSeriesLoading && timeSeriesData && (
            <FinancialChart data={timeSeriesData} onMonthsChange={setSelectedMonths} />
          )}
        </div>

        {/* Category Breakdown - Takes 3 columns (30%) */}
        <div className="lg:col-span-3">
          {!isCategoryLoading && categoryData && <CategoryBreakdownChart data={categoryData} />}
        </div>
      </div>

      {/* Key Metrics - Simplified to 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Income */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted">Total Income</h3>
            <Icon name="income" size={20} color="var(--color-success)" />
          </div>
          <p className="text-3xl font-bold text-success mb-1">
            {formatCurrency(overview.totalIncome)}
          </p>
          <p className="text-xs text-muted">
            {overview.activeSubscriptions + overview.activeBills} income sources
          </p>
        </div>

        {/* Total Expenses */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted">Total Expenses</h3>
            <Icon name="expense" size={20} color="var(--color-error)" />
          </div>
          <p className="text-3xl font-bold text-error mb-1">
            {formatCurrency(overview.totalExpenses)}
          </p>
          <p className="text-xs text-muted">
            {overview.activeSubscriptions} subscriptions, {overview.activeBills} bills
          </p>
        </div>

        {/* Available / Savings */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-muted">Available / Savings</h3>
            <Icon name="savings" size={20} color="var(--color-success)" />
          </div>
          <p
            className={`text-3xl font-bold mb-1 ${overview.availableMoney >= 0 ? "text-success" : "text-error"}`}
          >
            {formatCurrency(overview.availableMoney)}
          </p>
          <p className="text-xs text-muted">
            <span
              className={`font-semibold ${overview.savingsRate >= 20 ? "text-success" : overview.savingsRate >= 10 ? "text-warning" : "text-error"}`}
            >
              {overview.savingsRate.toFixed(1)}%
            </span>{" "}
            savings rate
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
