export interface ParsedBalance {
  accountName: string;
  balance: number;
  balanceType: 'meal_swipes' | 'dining_dollars' | 'ru_express' | 'other';
  lastUpdated: string;
}

export interface ParsedTransaction {
  date: string;
  location: string;
  amount: number;
  balanceAfter: number;
  accountName: string;
}

export function parseMealPlanBalances(html: string): ParsedBalance[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const balances: ParsedBalance[] = [];
  const tables = doc.querySelectorAll('table.jsa_transactions');
  tables.forEach((table) => {
    const heading = table.previousElementSibling;
    const accountName = heading?.textContent?.trim() || '';
    const balanceRow = Array.from(table.querySelectorAll('tr')).find((row) => {
      const descCell = row.querySelector('td.jsa_desc');
      return descCell?.textContent?.includes('Current Balance');
    });
    if (balanceRow) {
      const amountCell = balanceRow.querySelector('td.jsa_amount.pos');
      if (amountCell) {
        const balanceText = amountCell.textContent?.trim() || '';
        const balanceMatch = balanceText.match(/(\d+\.?\d*)/);
        const balance = balanceMatch ? parseFloat(balanceMatch[1]) : 0;
        let balanceType: ParsedBalance['balanceType'] = 'other';
        if (accountName.toLowerCase().includes('meal')) balanceType = 'meal_swipes';
        else if (accountName.toLowerCase().includes('dining')) balanceType = 'dining_dollars';
        else if (accountName.toLowerCase().includes('express')) balanceType = 'ru_express';
        balances.push({ accountName, balance, balanceType, lastUpdated: new Date().toISOString() });
      }
    }
  });
  return balances;
}

export function parseTransactions(html: string): ParsedTransaction[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const transactions: ParsedTransaction[] = [];
  const tables = doc.querySelectorAll('table.jsa_transactions');
  tables.forEach((table) => {
    const heading = table.previousElementSibling;
    const accountName = heading?.textContent?.trim() || '';
    const rows = Array.from(table.querySelectorAll('tr')).filter((row) => row.querySelector('td.jsa_amount.neg'));
    rows.forEach((row) => {
      const dateCell = row.querySelector('th.jsa_month');
      const descCell = row.querySelector('td.jsa_desc');
      const amountCell = row.querySelector('td.jsa_amount.neg');
      const balanceCell = amountCell?.querySelector('p.jsa_data-bal span');
      if (dateCell && descCell && amountCell) {
        const date = dateCell.textContent?.trim() || '';
        const location = descCell.textContent?.trim() || '';
        const amountText = amountCell.textContent?.trim() || '';
        const amountMatch = amountText.match(/-?(\d+\.?\d*)/);
        const amount = amountMatch ? -Math.abs(parseFloat(amountMatch[1])) : 0;
        const balanceText = balanceCell?.textContent?.trim() || '';
        const balanceMatch = balanceText.match(/(\d+\.?\d*)/);
        const balanceAfter = balanceMatch ? parseFloat(balanceMatch[1]) : 0;
        transactions.push({ date, location, amount, balanceAfter, accountName });
      }
    });
  });
  return transactions;
}

export function parseRutgersHTML(html: string) {
  const balances = parseMealPlanBalances(html);
  const transactions = parseTransactions(html);
  const mealSwipes = balances.find((b) => b.balanceType === 'meal_swipes')?.balance || 0;
  const diningDollars = balances.find((b) => b.balanceType === 'dining_dollars')?.balance || 0;
  const ruExpress = balances.find((b) => b.balanceType === 'ru_express')?.balance || 0;
  const lastUpdated = balances[0]?.lastUpdated || new Date().toISOString();
  return { mealSwipes, diningDollars, ruExpress, transactions: transactions.slice(0, 10), lastUpdated };
}


