import React from "react";
import { useEffect, useMemo, useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Input } from "./ui/input";
import { TrendingDown, TrendingUp, Plus, Calendar, Bell } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, Legend } from "recharts";
import { toast } from "sonner";
import { loadTransactions, getThisWeekRange, TransactionRecord } from "../services/dataContext";

interface Event {
  name: string;
  cost: number;
  dateISO: string;
  dateLabel: string;
}

export function NewDashboardScreen() {
  const [dateRange, setDateRange] = useState<"week" | "month">("week");
  const [eventName, setEventName] = useState("");
  const [eventCost, setEventCost] = useState("");
  const [events, setEvents] = useState<Event[]>([
    { name: "Campus Concert", cost: 0, dateISO: "2025-11-14", dateLabel: "Nov 14" },
    { name: "Movie Night", cost: 0, dateISO: "2025-11-10", dateLabel: "Nov 10" },
  ]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const TOTAL_BUDGET = 1000; // per request

  useEffect(() => {
    let mounted = true;
    loadTransactions().then((rows) => {
      if (mounted) setTransactions(rows);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Helpers to compute time windows based on today's actual date
  const parseLocalDate = (dateStr: string) => {
    // Safely parse YYYY-MM-DD into a local Date without timezone shifting
    const parts = String(dateStr).split("-");
    if (parts.length === 3) {
      const y = Number(parts[0]);
      const m = Number(parts[1]) - 1;
      const d = Number(parts[2]);
      const result = new Date(y, m, d);
      if (!isNaN(result.getTime())) return result;
    }
    const fallback = new Date(dateStr);
    return fallback;
  };

  const isInThisWeek = (dateStr: string) => {
    const d = parseLocalDate(dateStr);
    if (isNaN(d.getTime())) return false;
    const { start, end } = getThisWeekRange(); // Sun..Sat (exclusive end)
    return d >= start && d < end;
  };

  const isInThisMonth = (dateStr: string) => {
    const d = parseLocalDate(dateStr);
    if (isNaN(d.getTime())) return false;
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  };

  const periodRows = useMemo(() => {
    if (!transactions.length) return [];
    return transactions.filter((t) =>
      dateRange === "week" ? isInThisWeek(t.date) : isInThisMonth(t.date)
    );
  }, [transactions, dateRange]);

  const periodEvents = useMemo(() => {
    return events.filter((e) =>
      dateRange === "week" ? isInThisWeek(e.dateISO) : isInThisMonth(e.dateISO)
    );
  }, [events, dateRange]);

  const totalSpentAllTime = useMemo(
    () => transactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0),
    [transactions]
  );
  const totalSpentPeriod = useMemo(
    () =>
      periodRows.reduce((sum, t) => sum + (Number(t.amount) || 0), 0) +
      periodEvents.reduce((sum, e) => sum + (Number(e.cost) || 0), 0),
    [periodRows, periodEvents]
  );

  const percentUsed = Math.min(100, (totalSpentPeriod / TOTAL_BUDGET) * 100 || 0);

  const budgetData = {
    currentBalance: totalSpentAllTime, // per request: show actual sum of CSV amounts
    totalBudget: TOTAL_BUDGET,
    spent: totalSpentPeriod,
    percentUsed: Math.round(percentUsed),
  };

  // Spending breakdown by category
  const categoryTotals = useMemo(() => {
    const map: Record<string, number> = {};
    periodRows.forEach((t) => {
      const cat = t.category || "Other";
      map[cat] = (map[cat] || 0) + (Number(t.amount) || 0);
    });
    // Attribute paid events to Entertainment by default
    periodEvents.forEach((e) => {
      if ((Number(e.cost) || 0) <= 0) return;
      const cat = "Entertainment";
      map[cat] = (map[cat] || 0) + (Number(e.cost) || 0);
    });
    return map;
  }, [periodRows, periodEvents]);
  const categoryPalette: Record<string, { color: string; icon: string }> = {
    Dining: { color: "#FCD535", icon: "🍽️" },
    Books: { color: "#3B82F6", icon: "📚" },
    Transport: { color: "#10B981", icon: "🚌" },
    Grocery: { color: "#F59E0B", icon: "🛒" },
    Pharmacy: { color: "#8B5CF6", icon: "💊" },
    Merchandise: { color: "#06B6D4", icon: "🛍️" },
    Services: { color: "#A78BFA", icon: "🧾" },
    Entertainment: { color: "#EF4444", icon: "🎬" },
    "": { color: "#D1D5DB", icon: "❓" },
    Other: { color: "#D1D5DB", icon: "❓" },
  };
  const spendingData = Object.entries(categoryTotals)
    .map(([name, value]) => ({
      name,
      value,
      color: (categoryPalette[name]?.color) || "#D1D5DB",
      icon: (categoryPalette[name]?.icon) || "❓",
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Spending trend over time
  const trendData = useMemo(() => {
    if (dateRange === "week") {
      const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const amounts = new Array(7).fill(0);
      periodRows.forEach((t) => {
        const d = parseLocalDate(t.date);
        if (isNaN(d.getTime())) return;
        const idx = d.getDay();
        amounts[idx] += Number(t.amount) || 0;
      });
      periodEvents.forEach((e) => {
        const d = parseLocalDate(e.dateISO);
        if (isNaN(d.getTime())) return;
        const idx = d.getDay();
        amounts[idx] += Number(e.cost) || 0;
      });
      return labels.map((day, i) => ({ day, amount: Number(amounts[i].toFixed(2)) }));
    } else {
      // Group by week number within current month (1-5)
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const buckets: Record<string, number> = {};
      periodRows.forEach((t) => {
        const d = parseLocalDate(t.date);
        if (isNaN(d.getTime())) return;
        if (d.getFullYear() !== year || d.getMonth() !== month) return;
        const weekOfMonth = Math.ceil((d.getDate() - new Date(d.getFullYear(), d.getMonth(), 1).getDay()) / 7) || 1;
        const key = `Week ${weekOfMonth}`;
        buckets[key] = (buckets[key] || 0) + (Number(t.amount) || 0);
      });
      periodEvents.forEach((e) => {
        const d = parseLocalDate(e.dateISO);
        if (isNaN(d.getTime())) return;
        if (d.getFullYear() !== year || d.getMonth() !== month) return;
        const weekOfMonth = Math.ceil((d.getDate() - new Date(d.getFullYear(), d.getMonth(), 1).getDay()) / 7) || 1;
        const key = `Week ${weekOfMonth}`;
        buckets[key] = (buckets[key] || 0) + (Number(e.cost) || 0);
      });
      const keys = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"];
      return keys
        .filter((k) => k in buckets)
        .map((k) => ({ day: k, amount: Number(buckets[k].toFixed(2)) }));
    }
  }, [periodRows, periodEvents, dateRange]);

  const recentExpenses = [
    // Top 5 most recent in the selected period
    ...[...periodRows]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map((t) => ({
        name: t.merchant || t.category || "Expense",
        amount: Number(t.amount) || 0,
        date: (() => {
          // Format YYYY-MM-DD as local date without timezone shifting
          const parts = String(t.date).split("-");
          if (parts.length === 3) {
            const y = Number(parts[0]);
            const m = Number(parts[1]) - 1; // 0-based
            const d = Number(parts[2]);
            const local = new Date(y, m, d);
            return local.toLocaleDateString(undefined, { month: "short", day: "numeric" });
          }
          return String(t.date);
        })(),
        category: t.category || "Other",
        icon: "💳",
      })),
  ];

  const handleAddEvent = () => {
    if (eventName.trim() && eventCost.trim()) {
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      const iso = `${yyyy}-${mm}-${dd}`;
      const label = now.toLocaleDateString(undefined, { month: "short", day: "numeric" }) || "Today";
      const newEvent: Event = { name: eventName, cost: parseFloat(eventCost), dateISO: iso, dateLabel: label };
      setEvents([newEvent, ...events]);
      setEventName("");
      setEventCost("");
    }
  };

  const getProgressColor = (percent: number) => {
    if (percent < 50) return "bg-emerald-500";
    if (percent < 75) return "bg-[#FCD535]";
    return "bg-red-500";
  };

  const getProgressEmoji = (percent: number) => {
    if (percent < 50) return "🟩";
    if (percent < 75) return "🟨";
    return "🟥";
  };

  const handleCategoryClick = (category: string, value: number) => {
    setSelectedCategory(category);
    toast.success(`${category}: $${value.toFixed(2)} spent this ${dateRange}`, {
      description: `${((value / budgetData.spent) * 100).toFixed(1)}% of total spending`,
    });
  };

  const handleBudgetAlert = () => {
    toast.warning("Budget Alert!", {
      description: "You've used 73% of your budget. Consider reviewing your spending.",
      action: {
        label: "View Details",
        onClick: () => {},
      },
    });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      {/* Header / Summary Bar */}
      <div className="bg-[#FCD535] text-gray-900 p-6 pb-6 rounded-b-3xl shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-gray-700 text-sm mb-1">Current Balance</p>
            <h1 className="text-5xl mb-2">${budgetData.currentBalance.toFixed(2)}</h1>
            <p className="text-gray-700 text-sm">of ${budgetData.totalBudget.toFixed(2)} budget</p>
          </div>
          <button
            onClick={handleBudgetAlert}
            className="w-11 h-11 rounded-2xl bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-all"
          >
            <Bell className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Budget Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-700">Budget Used</p>
            <p className="text-sm font-medium">
              {getProgressEmoji(budgetData.percentUsed)} {budgetData.percentUsed}%
            </p>
          </div>
          <div className="w-full bg-white/50 rounded-full h-3 backdrop-blur-sm">
            <div
              className={`${getProgressColor(budgetData.percentUsed)} h-3 rounded-full transition-all shadow-sm`}
              style={{ width: `${budgetData.percentUsed}%` }}
            />
          </div>
          <p className="text-xs text-gray-700 mt-1">
            ${budgetData.spent.toFixed(2)} spent this {dateRange}
          </p>
        </div>

        {/* Date Range Selector */}
        <div className="flex gap-2">
          <Button
            onClick={() => setDateRange("week")}
            className={`flex-1 h-11 rounded-2xl transition-all ${
              dateRange === "week"
                ? "bg-white text-gray-900 shadow-md hover:bg-gray-50"
                : "bg-white/30 text-gray-700 border-0 hover:bg-white/40"
            }`}
          >
            This Week
          </Button>
          <Button
            onClick={() => setDateRange("month")}
            className={`flex-1 h-11 rounded-2xl transition-all ${
              dateRange === "month"
                ? "bg-white text-gray-900 shadow-md hover:bg-gray-50"
                : "bg-white/30 text-gray-700 border-0 hover:bg-white/40"
            }`}
          >
            This Month
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-5 bg-emerald-50 border-0 shadow-sm rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-sm">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm text-emerald-800">Saved</p>
            </div>
            <p className="text-3xl text-emerald-700">
              ${Math.max(0, TOTAL_BUDGET - totalSpentPeriod).toFixed(0)}
            </p>
            <p className="text-xs text-emerald-600">This {dateRange}</p>
          </Card>
          <Card className="p-5 bg-blue-50 border-0 shadow-sm rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-sm">
                <TrendingDown className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm text-blue-800">Spent</p>
            </div>
            <p className="text-3xl text-blue-700">${totalSpentPeriod.toFixed(0)}</p>
            <p className="text-xs text-blue-600">This {dateRange}</p>
          </Card>
        </div>

        {/* Spending Breakdown Pie Chart */}
        <Card className="p-5 bg-white border-0 shadow-sm rounded-2xl">
          <h3 className="text-gray-900 mb-3">Spending Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={spendingData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  onClick={(entry) => handleCategoryClick(entry.name, entry.value)}
                  cursor="pointer"
                >
                  {spendingData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      stroke="white"
                      strokeWidth={2}
                      style={{ 
                        filter: selectedCategory === entry.name ? 'brightness(1.1)' : 'none',
                        transition: 'all 0.3s'
                      }}
                    />
                  ))}
                </Pie>
                <RechartsTooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100">
                          <p className="text-gray-900 mb-1">{data.icon} {data.name}</p>
                          <p className="text-sm text-gray-600">${data.value.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">{((data.value / budgetData.spent) * 100).toFixed(1)}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {spendingData.map((item) => (
              <button
                key={item.name}
                onClick={() => handleCategoryClick(item.name, item.value)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-all"
              >
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-gray-600">{item.icon} {item.name}</span>
                <span className="text-xs text-gray-900 ml-auto">${item.value.toFixed(0)}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Spending Trend Line Chart */}
        <Card className="p-5 bg-white border-0 shadow-sm rounded-2xl">
          <h3 className="text-gray-900 mb-3">Spending Trend</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <XAxis 
                  dataKey="day" 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <RechartsTooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100">
                          <p className="text-gray-900 mb-1">{payload[0].payload.day}</p>
                          <p className="text-sm text-blue-600">${payload[0].value}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, fill: '#2563EB' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Log Event */}
        <Card className="p-5 bg-[#FEF3C7] border-0 shadow-sm rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <Calendar className="w-5 h-5 text-gray-900" />
            </div>
            <h3 className="text-gray-900">Log Event</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-800 mb-1 block">Event Name</label>
              <Input
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                placeholder="e.g., Campus Movie Night"
                className="w-full h-11 bg-white border-0 rounded-xl shadow-sm"
              />
            </div>
            <div>
              <label className="text-sm text-gray-800 mb-1 block">Cost Spent ($)</label>
              <Input
                type="number"
                value={eventCost}
                onChange={(e) => setEventCost(e.target.value)}
                placeholder="0.00"
                className="w-full h-11 bg-white border-0 rounded-xl shadow-sm"
              />
            </div>
            <Button
              onClick={handleAddEvent}
              className="w-full bg-white hover:bg-gray-50 text-gray-900 h-11 rounded-xl shadow-sm"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Event
            </Button>
          </div>
        </Card>

        {/* Logged Events */}
        {events.length > 0 && (
          <Card className="p-5 bg-white border-0 shadow-sm rounded-2xl">
            <h3 className="text-gray-900 mb-4">Events Attended</h3>
            <div className="space-y-2">
              {events.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center text-xl shadow-sm text-white">
                      🎉
                    </div>
                    <div>
                      <p className="text-gray-900">{event.name}</p>
                      <p className="text-xs text-gray-500">{event.dateLabel}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${event.cost === 0 ? "text-emerald-600" : "text-blue-600"}`}>
                      {event.cost === 0 ? "Free!" : `-$${Number(event.cost).toFixed(2)}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Recent Expenses */}
        <Card className="mb-20 p-5 bg-white border-0 shadow-sm rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-900">Recent Expenses</h3>
            <Button size="sm" variant="ghost" className="text-blue-600 h-8 hover:bg-blue-50 rounded-lg">
              See All
            </Button>
          </div>
          <div className="space-y-2">
            {recentExpenses.map((expense, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#FEF3C7] flex items-center justify-center text-xl shadow-sm">
                    {expense.icon}
                  </div>
                  <div>
                    <p className="text-gray-900">{expense.name}</p>
                    <p className="text-xs text-gray-500">
                      {expense.category} • {expense.date}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-blue-600 font-medium">-${expense.amount.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3">
            <Button
              size="sm"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10 rounded-xl"
              onClick={() => {
                window.dispatchEvent(new CustomEvent("open-card-transactions"));
              }}
            >
              See All
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}