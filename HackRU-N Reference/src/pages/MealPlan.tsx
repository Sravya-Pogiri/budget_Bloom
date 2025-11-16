import { MealPlanTracker } from '../components/MealPlanTracker';

export function MealPlan() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Meal Plan</h2>
        <p className="text-sm text-gray-600">Track your meal swipes and dining dollars</p>
      </div>
      <MealPlanTracker />
    </div>
  );
}

