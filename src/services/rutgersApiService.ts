export interface MealPlanBalance {
  mealSwipes: number;
  diningDollars: number;
  ruExpress: number;
  lastUpdated: string;
  planType?: string;
  semester?: string;
}

export async function fetchMealPlanBalance(): Promise<MealPlanBalance | null> {
  try {
    const skey = import.meta.env.VITE_RUTGERS_SKEY;
    if (!skey) return null;
    const proxyUrl = import.meta.env.VITE_RUTGERS_PROXY || 'http://localhost:3001';
    const endpoint = `${proxyUrl}/api/rutgers-balance?skey=${skey}`;
    const response = await fetch(endpoint, { headers: { Accept: 'text/html' } });
    if (!response.ok) return null;
    const html = await response.text();
    const { parseRutgersHTML } = await import('./rutgersHtmlParser');
    const parsed = parseRutgersHTML(html);
    return {
      mealSwipes: parsed.mealSwipes,
      diningDollars: parsed.diningDollars,
      ruExpress: parsed.ruExpress,
      lastUpdated: parsed.lastUpdated,
      planType: 'Meal Plan',
      semester: 'Fall 2025',
    };
  } catch {
    return null;
  }
}


