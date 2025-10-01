import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import type { CategoryBreakdown } from "../types";

interface CategoryBreakdownChartProps {
  data: CategoryBreakdown;
  currency?: string;
}

const COLORS = [
  "#10b981", // green
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f97316", // orange
];

const CategoryBreakdownChart = ({ data, currency = "EUR" }: CategoryBreakdownChartProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const chartData = data.expenses.map((expense) => ({
    name: expense.categoryName,
    value: expense.amount,
    percentage: expense.percentage,
    count: expense.itemCount,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          style={{
            backgroundColor: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "8px",
            padding: "12px",
            color: "var(--color-text)",
          }}
        >
          <p style={{ fontWeight: "600", marginBottom: "8px" }}>{data.name}</p>
          <p style={{ margin: "4px 0" }}>
            <span style={{ fontWeight: "500" }}>Amount:</span> {formatCurrency(data.value)}
          </p>
          <p style={{ margin: "4px 0" }}>
            <span style={{ fontWeight: "500" }}>Percentage:</span> {data.percentage.toFixed(1)}%
          </p>
          <p style={{ margin: "4px 0" }}>
            <span style={{ fontWeight: "500" }}>Items:</span> {data.count}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Expenses by Category</h2>
        <p className="text-muted text-sm">Monthly spending breakdown</p>
      </div>

      {data.expenses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted">No expense data available</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ percentage }) => `${percentage.toFixed(0)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              animationDuration={1000}
            >
              {chartData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ color: "var(--color-text)" }} iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      )}

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {data.expenses.slice(0, 4).map((expense, index) => (
          <div key={expense.categoryName} className="flex items-center justify-between p-2">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm">{expense.categoryName}</span>
            </div>
            <span className="text-sm font-semibold">{formatCurrency(expense.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryBreakdownChart;
