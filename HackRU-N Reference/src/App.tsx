import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { AIInsights } from './pages/AIInsights';
import { MealPlan } from './pages/MealPlan';
import { Transactions } from './pages/Transactions';
import { Analytics } from './pages/Analytics';
import { Toaster } from 'sonner';

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/insights" element={<AIInsights />} />
          <Route path="/mealplan" element={<MealPlan />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </Layout>
    </>
  );
}

export default App;

