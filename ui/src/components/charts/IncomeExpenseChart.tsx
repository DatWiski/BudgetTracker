import { formatCurrency } from "../../utils/currency";
import type { DashboardOverview } from "../../types";

interface IncomeExpenseChartProps {
  data: DashboardOverview;
}

const IncomeExpenseChart = ({ data }: IncomeExpenseChartProps) => {
  const maxValue = Math.max(data.totalIncome, data.totalExpenses);
  const incomeWidth = (data.totalIncome / maxValue) * 100;
  const expenseWidth = (data.totalExpenses / maxValue) * 100;

  return (
    <div className="glass-card">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Income vs Expenses</h3>
        {/* Legend */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "var(--color-success)" }}
            ></div>
            <span className="text-sm font-medium">INCOME</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: "var(--color-error)" }}
            ></div>
            <span className="text-sm font-medium">EXPENSES</span>
          </div>
        </div>
      </div>

      {/* Horizontal Bars */}
      <div className="space-y-2">
        {/* Income Bar */}
        <div className="relative">
          <div className="mb-1">
            <span className="text-xs text-muted">Income</span>
          </div>
          <div
            className="relative h-6 rounded overflow-hidden"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          >
            <div
              className="h-full rounded flex items-center justify-end pr-2 transition-all duration-500 ease-out"
              style={{
                width: `${incomeWidth}%`,
                backgroundColor: "var(--color-success)",
              }}
            >
              <span className="text-white font-bold text-xs">
                {formatCurrency(data.totalIncome)}
              </span>
            </div>
          </div>
        </div>

        {/* Expenses Bar */}
        <div className="relative">
          <div className="mb-1">
            <span className="text-xs text-muted">Expenses</span>
          </div>
          <div
            className="relative h-6 rounded overflow-hidden"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          >
            <div
              className="h-full rounded flex items-center justify-end pr-2 transition-all duration-500 ease-out"
              style={{
                width: `${expenseWidth}%`,
                backgroundColor: "var(--color-error)",
              }}
            >
              <span className="text-white font-bold text-xs">
                {formatCurrency(data.totalExpenses)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Available Money */}
      <div className="mt-3 pt-2 border-t" style={{ borderColor: "var(--border-color)" }}>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted">Available</span>
          <span
            className={`font-bold text-sm ${data.availableMoney >= 0 ? "text-success" : "text-error"}`}
          >
            {formatCurrency(data.availableMoney)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default IncomeExpenseChart;
