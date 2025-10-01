import { useState } from "react";
import {
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
} from "recharts";
import type { FinancialTimeSeries } from "../types";

interface FinancialChartProps {
  data: FinancialTimeSeries;
  currency?: string;
  onMonthsChange?: (months: number) => void;
}

const FinancialChart = ({ data, currency = "EUR", onMonthsChange }: FinancialChartProps) => {
  const [selectedPeriod, setSelectedPeriod] = useState(6);

  // Transform data for recharts
  const chartData = data.dataPoints.map((point) => ({
    date: new Date(point.date).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    Income: point.income,
    Expenses: point.expenses,
    Net: point.net,
  }));

  const handlePeriodChange = (months: number) => {
    setSelectedPeriod(months);
    if (onMonthsChange) {
      onMonthsChange(months);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
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
          <p style={{ fontWeight: "600", marginBottom: "8px" }}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color, margin: "4px 0" }}>
              <span style={{ fontWeight: "500" }}>{entry.name}:</span> {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Financial Overview</h2>
          <p className="text-muted text-sm">Income and expenses over time</p>
        </div>
        <div className="flex gap-3 items-center">
          <span className="text-muted text-sm mr-1">Period:</span>
          {[3, 6, 12].map((months) => (
            <button
              key={months}
              onClick={() => handlePeriodChange(months)}
              className={`px-4 py-2 rounded-lg text-base font-semibold transition-all ${
                selectedPeriod === months
                  ? "bg-accent text-white shadow-lg scale-105"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white"
              }`}
            >
              {months}M
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-error)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-error)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis dataKey="date" stroke="#ffffff" tick={{ fill: "#ffffff" }} />
          <YAxis stroke="#ffffff" tick={{ fill: "#ffffff" }} tickFormatter={formatCurrency} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: "var(--color-text)" }} iconType="line" />
          <ReferenceLine y={0} stroke="rgba(255, 255, 255, 0.3)" strokeDasharray="3 3" />
          <Area
            type="linear"
            dataKey="Income"
            stroke="var(--color-success)"
            strokeWidth={3}
            fill="url(#colorIncome)"
            dot={{ fill: "var(--color-success)", r: 4 }}
            activeDot={{ r: 6 }}
            animationDuration={1000}
          />
          <Area
            type="linear"
            dataKey="Expenses"
            stroke="var(--color-error)"
            strokeWidth={3}
            fill="url(#colorExpenses)"
            dot={{ fill: "var(--color-error)", r: 4 }}
            activeDot={{ r: 6 }}
            animationDuration={1000}
          />
          <Line
            type="linear"
            dataKey="Net"
            stroke="var(--color-accent)"
            strokeWidth={3}
            dot={{ fill: "var(--color-accent)", r: 5 }}
            activeDot={{ r: 7 }}
            animationDuration={1000}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default FinancialChart;
