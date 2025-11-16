import React from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { UtensilsCrossed } from "lucide-react";

interface MealPlanScreenProps {
  onClose?: () => void;
}

// Minimal placeholder so the Manage Meal Plan dialog works
// without requiring the full Rutgers integration files.
export function MealPlanScreen({ onClose }: MealPlanScreenProps) {
  return (
    <div className="p-5 space-y-4">
      <Card className="p-4 bg-white border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Meal Plan</h2>
            <p className="text-xs text-gray-500">
              Live Rutgers meal swipe data will show here when connected.
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-700 mt-2">
          For now, you can still ask the AI about budgeting, dining, and how to
          use your meal plan wisely. The detailed Rutgers integration can be
          re-enabled later without breaking the rest of the app.
        </p>
      </Card>
      {onClose && (
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11 rounded-xl"
          onClick={onClose}
        >
          Close
        </Button>
      )}
    </div>
  );
}


