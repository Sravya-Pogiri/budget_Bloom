/**
 * Rutgers RU Express API Service
 * 
 * This service fetches meal swipe and dining dollar balances from Rutgers' systems.
 * 
 * HOW TO FIND THE API ENDPOINT:
 * 1. Go to https://services.jsatech.com/index.php?cid=52 (RU Express Online)
 * 2. Log in with your Rutgers credentials
 * 3. Open DevTools (F12) → Network tab
 * 4. Navigate to the page showing your meal plan balance
 * 5. Look for requests with "balance", "meal", "swipe", or "dining" in the name
 * 6. Click on the request → Check the Response tab for JSON data
 * 7. Copy the Request URL and headers
 * 
 * COMMON ENDPOINTS (may vary):
 * - /api/getBalance
 * - /student/wallet/balance
 * - /campuscard/balance
 * - /mealplan/status
 */

export interface MealPlanBalance {
  mealSwipes: number;
  diningDollars: number;
  ruExpress: number;
  lastUpdated: string;
  planType?: string;
  semester?: string;
}

export interface MealSwipeTransaction {
  id: string;
  date: string;
  location: string;
  type: 'meal_swipe' | 'dining_dollars' | 'ru_express';
  amount?: number;
  description: string;
}

/**
 * Fetch meal plan balance from Rutgers HTML page
 * 
 * Since there's no API, we fetch the HTML page and parse it.
 * 
 * NOTE: This uses credentials: 'include' to send cookies from the current session.
 * For the hackathon demo, you'll need to:
 * 1. Be logged into RU Express in the same browser
 * 2. Get your session key (skey) from the URL
 * 3. Or use a proxy server to handle authentication
 */
export async function fetchMealPlanBalance(): Promise<MealPlanBalance | null> {
  try {
    // Get session key from URL or environment variable
    // The session key is in the URL: index.php?skey=XXXXX&cid=52
    const skey = import.meta.env.VITE_RUTGERS_SKEY || getSessionKeyFromURL();
    
    console.log('🔍 Fetching meal plan balance...');
    console.log('Session key:', skey ? `${skey.substring(0, 10)}...` : 'NOT FOUND');
    
    if (!skey) {
      console.warn('❌ No session key found. Please log into RU Express and copy the skey from the URL.');
      console.warn('Using mock data. Check your .env file has VITE_RUTGERS_SKEY set.');
      return getMockMealPlanBalance();
    }

    // ALWAYS use proxy to bypass CORS (proxy runs on localhost:3001)
    const proxyUrl = import.meta.env.VITE_RUTGERS_PROXY || 'http://localhost:3001';
    const endpoint = `${proxyUrl}/api/rutgers-balance?skey=${skey}`;

    console.log(`📡 Fetching from proxy: ${endpoint.substring(0, 60)}...`);

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'text/html',
      },
    });

    if (!response.ok) {
      console.warn('Rutgers page not accessible, using mock data');
      return getMockMealPlanBalance();
    }

    const html = await response.text();
    console.log('✅ HTML received:', html.length, 'characters');
    
    // Parse HTML to extract balance data
    try {
      const { parseRutgersHTML } = await import('./rutgersHtmlParser');
      const parsed = parseRutgersHTML(html);
      
      console.log('📊 Parsed data:', {
        mealSwipes: parsed.mealSwipes,
        diningDollars: parsed.diningDollars,
        ruExpress: parsed.ruExpress,
      });
      
      if (parsed.mealSwipes > 0) {
        console.log('🎉 SUCCESS! Found', parsed.mealSwipes, 'meal swipes!');
      }
      
      return {
        mealSwipes: parsed.mealSwipes,
        diningDollars: parsed.diningDollars,
        ruExpress: parsed.ruExpress,
        lastUpdated: parsed.lastUpdated,
        planType: '150 Meal Plan', // Could be extracted from account name
        semester: 'Fall 2025', // Could be extracted or set manually
      };
    } catch (parseError) {
      console.error('❌ Error parsing HTML:', parseError);
      // Fallback: try to extract just the balance number
      const balanceMatch = html.match(/Current Balance[:\s]+(\d+)/i);
      if (balanceMatch) {
        const mealSwipes = parseInt(balanceMatch[1]);
        console.log('✅ Extracted balance via regex:', mealSwipes);
        return {
          mealSwipes,
          diningDollars: 0,
          ruExpress: 0,
          lastUpdated: new Date().toISOString(),
          planType: '150 Meal Plan',
          semester: 'Fall 2025',
        };
      }
      throw parseError; // Re-throw if we can't parse at all
    }
  } catch (error) {
    console.error('❌ Error fetching meal plan balance:', error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('💡 This might be a CORS error. Try using the proxy server (see CORS_SOLUTION.md)');
    }
    // Fallback to mock data for demo
    return getMockMealPlanBalance();
  }
}

/**
 * Try to get session key from current page URL (if running in same domain)
 */
function getSessionKeyFromURL(): string | null {
  if (typeof window === 'undefined') return null;
  
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('skey');
}

/**
 * Fetch meal swipe transaction history from HTML
 * Can use either the main page or statement detail page
 */
export async function fetchMealSwipeHistory(): Promise<MealSwipeTransaction[]> {
  try {
    const skey = import.meta.env.VITE_RUTGERS_SKEY || getSessionKeyFromURL();
    
    if (!skey) {
      console.warn('No session key for transaction history');
      return getMockTransactions();
    }

    // Try statement detail page first (has more transactions)
    // Account 15 is typically the meal plan
    const statementUrl = `https://services.jsatech.com/statementdetail.php?skey=${skey}&cid=52&acct=15&startdate=2025-05-01&enddate=2025-12-31`;
    const mainUrl = `https://services.jsatech.com/index.php?skey=${skey}&cid=52`;

    let html = '';
    let response;

    // Try statement page first
    try {
      const useProxy = import.meta.env.VITE_RUTGERS_PROXY;
      const endpoint = useProxy 
        ? `${useProxy}/api/rutgers-balance?skey=${skey}&url=${encodeURIComponent(statementUrl)}`
        : statementUrl;

      response = await fetch(endpoint, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'text/html',
        },
      });

      if (response.ok) {
        html = await response.text();
      }
    } catch (e) {
      console.log('Statement page failed, trying main page');
    }

    // Fallback to main page
    if (!html || !response?.ok) {
      const useProxy = import.meta.env.VITE_RUTGERS_PROXY;
      const endpoint = useProxy 
        ? `${useProxy}/api/rutgers-balance?skey=${skey}`
        : mainUrl;

      response = await fetch(endpoint, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'text/html',
        },
      });

      if (!response.ok) {
        return getMockTransactions();
      }

      html = await response.text();
    }
    
    // Parse HTML to extract transactions
    const { parseTransactions } = await import('./rutgersHtmlParser');
    const parsed = parseTransactions(html);
    
    // Filter for meal swipe transactions and convert format
    const transactions = parsed
      .filter(t => t.accountName.toLowerCase().includes('meal') || 
                   t.accountName.toLowerCase().includes('150'))
      .map(t => ({
        id: `t-${t.date}-${t.location}`.replace(/\s+/g, '-'),
        date: parseDate(t.date),
        location: t.location,
        type: 'meal_swipe' as const,
        amount: Math.abs(t.amount), // Already negative in source
        description: `${t.location} - ${t.date}`,
      }));

    console.log(`📝 Found ${transactions.length} meal swipe transactions`);
    return transactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return getMockTransactions();
  }
}

/**
 * Parse date string from RU Express format to ISO
 */
function parseDate(dateStr: string): string {
  // Format: "11/14/2025 02:52PM"
  try {
    const [datePart, timePart] = dateStr.split(' ');
    const [month, day, year] = datePart.split('/');
    const time = timePart.replace(/(AM|PM)/, ' $1');
    const date = new Date(`${month}/${day}/${year} ${time}`);
    return date.toISOString();
  } catch {
    return new Date().toISOString();
  }
}


/**
 * Mock data for demo when API is not accessible
 */
function getMockMealPlanBalance(): MealPlanBalance {
  // Simulate realistic meal plan data
  const baseSwipes = 45; // Typical meal plan
  const usedSwipes = Math.floor(Math.random() * 20) + 5;
  
  return {
    mealSwipes: Math.max(0, baseSwipes - usedSwipes),
    diningDollars: Math.max(0, 200 - (Math.random() * 50)),
    ruExpress: Math.max(0, 100 - (Math.random() * 30)),
    lastUpdated: new Date().toISOString(),
    planType: 'Unlimited',
    semester: 'Fall 2025',
  };
}

function getMockTransactions(): MealSwipeTransaction[] {
  const locations = [
    'Brower Commons',
    'Busch Dining Hall',
    'Livingston Dining Commons',
    'Neilson Dining Hall',
    'Cafe West',
    'Starbucks (Student Center)',
  ];

  const transactions: MealSwipeTransaction[] = [];
  const now = new Date();

  for (let i = 0; i < 10; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    date.setHours(12 + Math.floor(Math.random() * 6), Math.floor(Math.random() * 60));

    transactions.push({
      id: `t-${i}`,
      date: date.toISOString(),
      location: locations[Math.floor(Math.random() * locations.length)],
      type: Math.random() > 0.7 ? 'dining_dollars' : 'meal_swipe',
      amount: Math.random() > 0.7 ? Math.random() * 15 + 5 : undefined,
      description: `Meal swipe used at ${locations[Math.floor(Math.random() * locations.length)]}`,
    });
  }

  return transactions.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * Auto-refresh meal plan balance
 * Call this periodically to keep data up to date
 */
export class MealPlanTracker {
  private intervalId: NodeJS.Timeout | null = null;
  private onUpdate: (balance: MealPlanBalance) => void;

  constructor(onUpdate: (balance: MealPlanBalance) => void) {
    this.onUpdate = onUpdate;
  }

  start(intervalMs: number = 60000) { // Default: 1 minute
    this.stop(); // Clear any existing interval
    
    // Fetch immediately
    fetchMealPlanBalance().then(balance => {
      if (balance) this.onUpdate(balance);
    });

    // Then fetch periodically
    this.intervalId = setInterval(async () => {
      const balance = await fetchMealPlanBalance();
      if (balance) this.onUpdate(balance);
    }, intervalMs);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

