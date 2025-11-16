import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Input } from "./ui/input";
import { TrendingDown, TrendingUp, Plus, Calendar, Bell } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, Legend } from "recharts";
import { toast } from "sonner@2.0.3";

interface Event {
  name: string;
  cost: number;
  date: string;
}

export function NewDashboardScreen() {
  const [dateRange, setDateRange] = useState<"week" | "month">("week");
  const [eventName, setEventName] = useState("");
  const [eventCost, setEventCost] = useState("");
  const [events, setEvents] = useState<Event[]>([
    { name: "Campus Concert", cost: 0, date: "Nov 14" },
    { name: "Movie Night", cost: 0, date: "Nov 10" },
  ]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const budgetData = {
    currentBalance: 245.60,
    totalBudget: 350.00,
    spent: 104.40,
    percentUsed: 73,
  };

  // Spending breakdown by category
  const spendingData = [
    { name: "Dining", value: 32.75, color: "#FCD535", icon: "🍽️" },
    { name: "Education", value: 45.00, color: "#3B82F6", icon: "📚" },
    { name: "Transport", value: 15.00, color: "#10B981", icon: "🚌" },
    { name: "Food", value: 8.50, color: "#F59E0B", icon: "🍿" },
    { name: "Other", value: 3.15, color: "#8B5CF6", icon: "🛍️" },
  ];

  // Spending trend over time
  const trendData = dateRange === "week" 
    ? [
        { day: "Mon", amount: 15 },
        { day: "Tue", amount: 8 },
        { day: "Wed", amount: 25 },
        { day: "Thu", amount: 12 },
        { day: "Fri", amount: 32 },
        { day: "Sat", amount: 7 },
        { day: "Sun", amount: 5 },
      ]
    : [
        { day: "Week 1", amount: 45 },
        { day: "Week 2", amount: 78 },
        { day: "Week 3", amount: 52 },
        { day: "Week 4", amount: 104 },
      ];

  const recentExpenses = [
    { name: "Coffee", amount: 5.75, date: "Today", category: "Dining", icon: "☕" },
    { name: "Textbook", amount: 45.00, date: "Yesterday", category: "Education", icon: "📚" },
    { name: "Lunch", amount: 12.50, date: "Nov 13", category: "Dining", icon: "🍽️" },
    { name: "Bus Pass", amount: 15.00, date: "Nov 12", category: "Transport", icon: "🚌" },
    { name: "Snacks", amount: 8.50, date: "Nov 11", category: "Food", icon: "🍿" },
  ];

  const handleAddEvent = () => {
    if (eventName.trim() && eventCost.trim()) {
      const newEvent: Event = {
        name: eventName,
        cost: parseFloat(eventCost),
        date: "Today",
      };
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
            <p className="text-3xl text-emerald-700">$245</p>
            <p className="text-xs text-emerald-600">This {dateRange}</p>
          </Card>
          <Card className="p-5 bg-blue-50 border-0 shadow-sm rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-sm">
                <TrendingDown className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm text-blue-800">Spent</p>
            </div>
            <p className="text-3xl text-blue-700">$104</p>
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
                      <p className="text-xs text-gray-500">{event.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${event.cost === 0 ? "text-emerald-600" : "text-blue-600"}`}>
                      {event.cost === 0 ? "Free!" : `-$${event.cost.toFixed(2)}`}
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
        </Card>
      </div>
    </div>
  );
}