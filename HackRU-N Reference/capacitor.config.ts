import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.budgetbloom.app',
  appName: 'BudgetBloom',
  webDir: 'dist',
  // Point to dev server for live .env variables
  server: {
    url: 'http://localhost:5173',
    cleartext: true
  }
};

export default config;
