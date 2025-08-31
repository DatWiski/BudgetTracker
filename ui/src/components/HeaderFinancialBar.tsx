import { formatCurrency } from "../utils/currency";
import type { DashboardOverview } from "../types";

interface HeaderFinancialBarProps {
  data: DashboardOverview;
}

const HeaderFinancialBar = ({ data }: HeaderFinancialBarProps) => {
  const maxValue = Math.max(data.totalIncome, data.totalExpenses);
  const incomeWidth = (data.totalIncome / maxValue) * 100;
  const expenseWidth = (data.totalExpenses / maxValue) * 100;

  return (
    <div className="glass-card mb-6">
      <div className="flex items-center justify-between">
        {/* Left: Chart */}
        <div className="flex-1 mr-8">
          <div className="flex items-center gap-4 mb-2">
            <h3 className="text-base font-semibold">Financial Overview</h3>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: "var(--color-success)" }}
                ></div>
                <span>Income</span>
              </div>
              <div className="flex items-center gap-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: "var(--color-error)" }}
                ></div>
                <span>Expenses</span>
              </div>
            </div>
          </div>

          {/* Horizontal Bars */}
          <div className="space-y-1">
            {/* Income Bar */}
            <div
              className="relative h-4 rounded overflow-hidden"
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

            {/* Expenses Bar */}
            <div
              className="relative h-4 rounded overflow-hidden"
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

        {/* Right: Available Money */}
        <div className="text-right">
          <div className="text-xs text-muted mb-1">Available</div>
          <div
            className={`text-lg font-bold ${data.availableMoney >= 0 ? "text-success" : "text-error"}`}
          >
            {formatCurrency(data.availableMoney)}
          </div>
          <div className="text-xs text-muted">{data.savingsRate.toFixed(1)}% saved</div>
        </div>
      </div>
    </div>
  );
};

export default HeaderFinancialBar;
