/**
 * Rutgers HTML Parser
 * 
 * Parses the RU Express HTML page to extract meal swipe and balance data.
 * 
 * The data is embedded in HTML tables with this structure:
 * - Table heading: "New Brunswick - 150 Meal Plan" (or similar)
 * - Balance row: <td class="jsa_amount pos">47</td>
 * - Transaction rows: <td class="jsa_amount neg">-1</td>
 */

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

/**
 * Parse HTML to extract meal plan balances
 */
export function parseMealPlanBalances(html: string): ParsedBalance[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const balances: ParsedBalance[] = [];

  // Method 1: Try Account Summary section (statement detail page)
  const accountSummary = doc.querySelector('.jsa_summary');
  if (accountSummary) {
    // Find account name
    const accountNameLi = Array.from(accountSummary.querySelectorAll('li')).find(li => 
      li.textContent?.includes('Account Name')
    );
    const accountName = accountNameLi?.textContent?.replace(/Account Name[:\s]+/i, '').trim() || '';
    
    // Find current balance
    const balanceLi = Array.from(accountSummary.querySelectorAll('li')).find(li => 
      li.textContent?.includes('Current Balance')
    );
    
    if (balanceLi && accountName.toLowerCase().includes('meal plan')) {
      const balanceMatch = balanceLi.textContent?.match(/Current Balance[:\s]+(\d+\.?\d*)/i);
      if (balanceMatch) {
        const balance = parseFloat(balanceMatch[1]);
        balances.push({
          accountName: accountName || 'Meal Plan',
          balance,
          balanceType: 'meal_swipes',
          lastUpdated: new Date().toISOString(),
        });
      }
    }
  }

  // Method 2: Find all tables with class "jsa_transactions" (main balance page)
  const tables = doc.querySelectorAll('table.jsa_transactions');

  tables.forEach((table) => {
    // Get the account name from the preceding h3
    const tableId = table.getAttribute('id') || '';
    const heading = table.previousElementSibling;
    const accountName = heading?.textContent?.trim() || tableId;

    // Find the "Current Balance" row
    const balanceRow = Array.from(table.querySelectorAll('tr')).find((row) => {
      const descCell = row.querySelector('td.jsa_desc');
      return descCell?.textContent?.includes('Current Balance') || 
             descCell?.textContent?.includes('Current balance');
    });

    if (balanceRow) {
      const amountCell = balanceRow.querySelector('td.jsa_amount.pos');
      if (amountCell) {
        const balanceText = amountCell.textContent?.trim() || '';
        
        // Extract number (remove $ and other characters)
        const balanceMatch = balanceText.match(/(\d+\.?\d*)/);
        const balance = balanceMatch ? parseFloat(balanceMatch[1]) : 0;

        // Determine balance type based on account name
        let balanceType: ParsedBalance['balanceType'] = 'other';
        if (accountName.toLowerCase().includes('meal plan') || 
            accountName.toLowerCase().includes('meal')) {
          balanceType = 'meal_swipes';
        } else if (accountName.toLowerCase().includes('dining')) {
          balanceType = 'dining_dollars';
        } else if (accountName.toLowerCase().includes('ru express') ||
                   accountName.toLowerCase().includes('express')) {
          balanceType = 'ru_express';
        }

            // Get last updated date from the date cell - convert to ISO format
            const dateCell = balanceRow.querySelector('th.jsa_month');
            const dateText = dateCell?.textContent?.trim() || '';
            // Convert date string to ISO format (handle formats like "11/15/2025 11:09AM")
            let lastUpdated = new Date().toISOString();
            if (dateText) {
              try {
                // Try parsing the date string
                const parsedDate = new Date(dateText);
                if (!isNaN(parsedDate.getTime())) {
                  lastUpdated = parsedDate.toISOString();
                }
              } catch {
                // If parsing fails, use current time
                lastUpdated = new Date().toISOString();
              }
            }

        balances.push({
          accountName,
          balance,
          balanceType,
          lastUpdated,
        });
      }
    }
  });

  return balances;
}

/**
 * Parse HTML to extract transaction history
 * Handles both main balance page and statement detail page
 */
export function parseTransactions(html: string): ParsedTransaction[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const transactions: ParsedTransaction[] = [];

  // Method 1: Statement detail page (has full transaction table)
  const statementTable = doc.querySelector('table.jsa_transactions');
  if (statementTable) {
    // Get account name from summary
    const accountSummary = doc.querySelector('.jsa_summary');
    const accountNameEl = accountSummary?.querySelector('li:has(span:contains("Account Name"))');
    const accountName = accountNameEl?.textContent?.replace(/Account Name[:\s]+/i, '').trim() || 
                       'New Brunswick - 150 Meal Plan';

    // Find all transaction rows
    const transactionRows = Array.from(statementTable.querySelectorAll('tr')).filter((row) => {
      const amountCell = row.querySelector('td.jsa_amount.neg, td.jsa_amount.pos');
      const descCell = row.querySelector('td.jsa_desc');
      // Skip header row and balance rows
      return amountCell !== null && 
             descCell && 
             !descCell.textContent?.includes('Current Balance') &&
             !row.querySelector('th.jsa_table-headers');
    });

    transactionRows.forEach((row) => {
      const dateCell = row.querySelector('th.jsa_month');
      const descCell = row.querySelector('td.jsa_desc');
      const amountCell = row.querySelector('td.jsa_amount.neg, td.jsa_amount.pos');
      const balanceCell = amountCell?.querySelector('p.jsa_data-bal span') || 
                         row.querySelector('td.jsa_balance.bal');

      if (dateCell && descCell && amountCell) {
        const date = dateCell.textContent?.trim() || '';
        const location = descCell.textContent?.trim() || '';
        
        // Extract amount (negative for swipes, positive for deposits)
        const amountText = amountCell.textContent?.trim() || '';
        const isNegative = amountCell.classList.contains('neg');
        const amountMatch = amountText.match(/(\d+\.?\d*)/);
        const amount = amountMatch 
          ? (isNegative ? -parseFloat(amountMatch[1]) : parseFloat(amountMatch[1]))
          : 0;

        // Extract balance after transaction
        const balanceText = balanceCell?.textContent?.trim() || '';
        const balanceMatch = balanceText.match(/(\d+\.?\d*)/);
        const balanceAfter = balanceMatch ? parseFloat(balanceMatch[1]) : 0;

        // Only include meal swipe transactions (negative amounts)
        if (amount < 0 || location.toLowerCase().includes('deposit')) {
          transactions.push({
            date,
            location,
            amount,
            balanceAfter,
            accountName,
          });
        }
      }
    });
  }

  // Method 2: Main balance page (fewer transactions)
  if (transactions.length === 0) {
    const tables = doc.querySelectorAll('table.jsa_transactions');

    tables.forEach((table) => {
      const tableId = table.getAttribute('id') || '';
      const heading = table.previousElementSibling;
      const accountName = heading?.textContent?.trim() || tableId;

      // Find all transaction rows (rows with negative amounts)
      const transactionRows = Array.from(table.querySelectorAll('tr')).filter((row) => {
        const amountCell = row.querySelector('td.jsa_amount.neg');
        return amountCell !== null;
      });

      transactionRows.forEach((row) => {
        const dateCell = row.querySelector('th.jsa_month');
        const descCell = row.querySelector('td.jsa_desc');
        const amountCell = row.querySelector('td.jsa_amount.neg');
        const balanceCell = amountCell?.querySelector('p.jsa_data-bal span');

        if (dateCell && descCell && amountCell) {
          const date = dateCell.textContent?.trim() || '';
          const location = descCell.textContent?.trim() || '';
          
          // Extract amount (should be negative)
          const amountText = amountCell.textContent?.trim() || '';
          const amountMatch = amountText.match(/-?(\d+\.?\d*)/);
          const amount = amountMatch ? -Math.abs(parseFloat(amountMatch[1])) : 0;

          // Extract balance after transaction
          const balanceText = balanceCell?.textContent?.trim() || '';
          const balanceMatch = balanceText.match(/(\d+\.?\d*)/);
          const balanceAfter = balanceMatch ? parseFloat(balanceMatch[1]) : 0;

          transactions.push({
            date,
            location,
            amount,
            balanceAfter,
            accountName,
          });
        }
      });
    });
  }

  return transactions;
}

/**
 * Extract meal swipe balance specifically
 */
export function extractMealSwipes(html: string): number | null {
  const balances = parseMealPlanBalances(html);
  const mealPlan = balances.find(b => b.balanceType === 'meal_swipes');
  return mealPlan ? mealPlan.balance : null;
}

/**
 * Extract dining dollars balance
 */
export function extractDiningDollars(html: string): number | null {
  const balances = parseMealPlanBalances(html);
  const dining = balances.find(b => b.balanceType === 'dining_dollars');
  return dining ? dining.balance : null;
}

/**
 * Extract RU Express balance
 */
export function extractRUExpress(html: string): number | null {
  const balances = parseMealPlanBalances(html);
  const express = balances.find(b => b.balanceType === 'ru_express');
  return express ? express.balance : null;
}

/**
 * Main function to parse all data from HTML
 */
export function parseRutgersHTML(html: string): {
  mealSwipes: number;
  diningDollars: number;
  ruExpress: number;
  transactions: ParsedTransaction[];
  lastUpdated: string;
} {
  const balances = parseMealPlanBalances(html);
  const transactions = parseTransactions(html);

  const mealSwipes = balances.find(b => b.balanceType === 'meal_swipes')?.balance || 0;
  const diningDollars = balances.find(b => b.balanceType === 'dining_dollars')?.balance || 0;
  const ruExpress = balances.find(b => b.balanceType === 'ru_express')?.balance || 0;

  // Get most recent update time
  const lastUpdated = balances.length > 0 
    ? balances[0].lastUpdated 
    : new Date().toISOString();

  return {
    mealSwipes,
    diningDollars,
    ruExpress,
    transactions: transactions.slice(0, 10), // Last 10 transactions
    lastUpdated,
  };
}

