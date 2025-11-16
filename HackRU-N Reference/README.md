# BudgetBloom - Smart Campus Wallet

**BudgetBloom** is an innovative mobile-first financial wellness app designed specifically for college students at Rutgers University. It combines real-time meal plan tracking, AI-powered spending analysis, and gamification to help students make smarter financial decisions while celebrating their progress.

## 🌟 Project Overview

BudgetBloom transforms financial management from a source of stress into an engaging, supportive experience. Unlike traditional budgeting apps that simply track spending, BudgetBloom:

- **Prevents overspending** with predictive AI alerts
- **Rewards good habits** with a visual growth tree
- **Integrates real campus data** (meal swipes, dining dollars, RU Express)
- **Provides personalized insights** based on actual spending patterns
- **Suggests campus-specific alternatives** to save money

## 🎯 Core Intentions

### 1. **Real-Time Meal Plan Integration**
Unlike competitors using simulated data, BudgetBloom connects directly to Rutgers' RU Express system to track:
- **Meal Swipes** remaining
- **Dining Dollars** balance
- **RU Express** balance
- **Transaction history** with timestamps

This real-time integration helps students:
- Avoid running out of meal swipes unexpectedly
- Make informed decisions about using meal swipes vs. dining dollars
- Track spending patterns across campus dining locations

### 2. **Predictive AI Financial Coaching**
Powered by Google Gemini AI (`gemini-2.0-flash`), BudgetBloom provides:

**Personalized Predictive Spending Alerts**
- "You usually spend on Starbucks on Thursdays at 3 PM. If you stick to your budget, skip one visit this week. Campus Café alternative saves $4.72."

**Smart Substitutions**
- "You buy DoorDash 3× a week. Campus dining hall has $6 meal special today. Save $24 this week by substituting 1 order."

**Mental-Health-Finance Link**
- Detects stress spending patterns (e.g., before exams)
- Offers campus-specific alternatives (free events, gym hours, study spaces)

**Future-You Simulation**
- Predicts semester totals
- Forecasts meal points exhaustion date
- Identifies risk areas (overdraft, late fees)
- Estimates potential savings

**Campus Recommendations Engine**
- Suggests cheap/free Rutgers events based on spending patterns and interests
- "Because you're into art & cultural events, here are free Rutgers events this week that fit your budget."

**AI Habit Storyteller**
- Narrative insights: "In the last 30 days, your strongest habit was cutting down weekday spending. Your weekends are your weak spot—avg $29 over target. You saved $45 this month. Your top risk next month is DoorDash spikes during exams."

### 3. **Gamified Financial Growth**
The **BudgetBloom Tree** visualizes financial health:

- **Grows** with good financial decisions
- **Branches** represent different spending categories
- **Flowers** appear for consistency
- **Leaves fall** when overspending occurs
- **Fruits** reward milestones (savings, using meal swipes, staying under budget)
- **Bloom Score** tracks overall financial wellness
- **Environmental changes** reflect events (holidays, finals, semester start)

### 4. **Understanding & Supportive Tone**
BudgetBloom takes a **positive, non-judgmental approach**:

- ✅ **Rewards necessary expenses** (books, supplies, rent) - celebrates them!
- ✅ **Suggests alternatives** for discretionary spending (Starbucks, DoorDash)
- ✅ **Never shames** users for necessary purchases
- ✅ **Focuses on opportunities**, not problems
- ✅ **Celebrates progress** with encouraging messages

Example: Instead of "You're spending too much on books," BudgetBloom says: "You spent $42 on books - totally necessary! 📚 Next semester, check the Rutgers bookstore's used section to save $15-20 per book."

## 📱 App Structure

### Pages

1. **Home** (`/`)
   - Dashboard with current balance and budget progress
   - Spending breakdown pie chart
   - Spending trend line chart
   - Quick stats (Saved/Spent)
   - Event logging
   - Recent expenses list

2. **AI Insights** (`/insights`)
   - Personalized spending analysis
   - Predictive alerts and recommendations
   - Habit storytelling
   - Future simulation
   - Campus recommendations
   - Session-cached for performance (30-minute cache)

3. **Meal Plan** (`/mealplan`)
   - Real-time meal swipe tracking
   - Dining dollars and RU Express balances
   - Transaction history
   - Auto-refresh every 5 minutes
   - Connection status indicator

4. **Transactions** (`/transactions`)
   - Complete transaction history
   - Parsed from CSV data
   - Filterable by category, date, merchant

5. **Analytics** (`/analytics`)
   - Spending analytics and charts
   - Category breakdowns
   - Time-based patterns

### Navigation
Bottom navigation bar with 5 tabs:
- 🏠 Home
- 💡 AI Insights
- 🍽️ Meal Plan
- 💳 Transactions
- 📊 Analytics

## 🛠️ Technical Architecture

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router** for client-side routing
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Lucide React** for icons
- **Zustand** for state management
- **Sonner** for toast notifications

### Backend Services

1. **Rutgers API Service** (`rutgersApiService.ts`)
   - Fetches real-time meal plan data via proxy server
   - Handles CORS issues with Node.js Express proxy
   - Auto-refreshes data every 5 minutes
   - Falls back to mock data if connection fails

2. **Rutgers HTML Parser** (`rutgersHtmlParser.ts`)
   - Parses HTML from RU Express website
   - Extracts balances and transaction history
   - Converts dates to ISO format
   - Handles edge cases and malformed data

3. **Gemini AI Service** (`geminiAIService.ts`)
   - Integrates with Google Gemini AI (`gemini-2.0-flash`)
   - Analyzes spending patterns from CSV data
   - Generates personalized insights
   - Provides predictive analysis
   - Falls back to mock responses if API unavailable

4. **CSV Parser** (`csvParser.ts`)
   - Parses transaction data from `wallet_transactions_sample.csv`
   - Analyzes spending patterns
   - Calculates category breakdowns
   - Identifies day-of-week patterns
   - Tracks top merchants and habits

### State Management
- **Zustand store** (`useStore.ts`) manages:
  - Transactions
  - Budgets
  - Tree state (health, fruits, leaves)
  - Meal plan balance
  - Meal swipe history
  - AI insights

### Mobile App
- **Capacitor** for native iOS/Android wrapping
- **PWA** support for installable web app
- **Xcode** integration for iOS development
- Points to dev server for live environment variables

## 🔧 Setup & Configuration

### Environment Variables (`.env`)
```
VITE_RUTGERS_SKEY=your_session_key          # Rutgers session key from RU Express
VITE_RUTGERS_PROXY=http://localhost:3001   # Proxy server URL
VITE_GEMINI_API_KEY=your_gemini_api_key     # Google Gemini API key
```

### Running the App

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start proxy server (for meal swipe data)
npm run proxy

# Build for production
npm run build

# Sync to iOS (after building)
npx cap sync
```

### iOS Development
```bash
# Open in Xcode
open ios/App/App.xcworkspace
```

## 📊 Data Sources

1. **Real-Time Meal Plan Data**
   - Fetched from Rutgers RU Express website
   - Requires valid session key (`skey`)
   - Parsed from HTML (no official API available)

2. **Transaction CSV Data**
   - `wallet_transactions_sample.csv` in `/public`
   - Contains sample transaction history
   - Used for AI analysis and spending insights
   - Can be updated with new data

3. **User Spending Patterns**
   - Analyzed from transaction history
   - Day-of-week patterns
   - Merchant frequency
   - Category breakdowns
   - Time-series trends

## 🎨 Design Philosophy

### User Experience
- **Mobile-first**: Designed for iOS/Android native feel
- **Fast loading**: Session caching for AI insights
- **Visual feedback**: Charts, progress bars, color-coded alerts
- **Accessibility**: Clear labels, readable fonts, intuitive navigation

### Visual Design
- **Yellow accent color** (`#FCD535`) for primary actions
- **Green** for positive metrics (savings, good habits)
- **Blue** for informational content
- **Orange/Red** for alerts (only when necessary)
- **Rounded corners** (`rounded-2xl`) for modern feel
- **Shadow effects** for depth

## 🚀 Key Differentiators

1. **Real-Time Integration**: Only app with live meal swipe tracking from Rutgers
2. **Predictive AI**: Goes beyond basic chatbots - provides actionable, time-specific recommendations
3. **Campus-Specific**: Recommendations tied to actual Rutgers events and locations
4. **Positive Psychology**: Rewards good behavior, doesn't shame necessary expenses
5. **Gamification**: Visual tree growth makes financial wellness engaging
6. **Preventive Finance**: Stops bad spending before it happens, not just tracks it

## 📈 Future Enhancements

- Integration with Rutgers event calendar
- Push notifications for budget alerts
- Social features (compare with friends, challenges)
- More detailed spending categories
- Export transaction history
- Budget goal setting and tracking

## 🏆 Hackathon Focus

Built for **HackRU 25** with emphasis on:
- **Innovation**: Real-time meal swipe integration (unique in hackathon)
- **AI Integration**: Advanced Gemini AI for predictive analysis (beyond basic chatbots)
- **User Experience**: Beautiful, mobile-first design
- **Practical Value**: Solves real student financial problems
- **Technical Excellence**: Clean code, proper architecture, error handling

---

**BudgetBloom**: Your Financial Growth Twin 🌳

*Smart Campus Wallet that learns your habits, predicts your weak zones, and coaches you in real time with campus-specific alternatives.*
