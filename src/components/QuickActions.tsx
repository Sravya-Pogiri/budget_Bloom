import React from "react";
import { Button } from "./ui/button";

interface QuickActionsProps {
  onActionClick: (action: string) => void;
}

export function QuickActions({ onActionClick }: QuickActionsProps) {
  const actions = [
    { label: "Stay under budget", action: "stay-under-budget" },
    { label: "Avoid impulse buys", action: "avoid-impulse-buys" },
    { label: "Attended free events", action: "attended-free-events" },
    { label: "Tracked spendings", action: "tracked-spendings" },
    { label: "Healthy choices", action: "healthy-choices" },
    { label: "Daily Insights", action: "daily-insights" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <Button
          key={action.action}
          onClick={() => onActionClick(action.action)}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm px-4 py-2 h-auto"
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}
