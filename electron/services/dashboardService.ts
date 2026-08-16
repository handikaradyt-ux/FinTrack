import Database from 'better-sqlite3'
import type {
  DashboardSummary,
  RecentTransaction,
  ChartPoint,
  BudgetOverviewItem,
} from '../../src/types/models.js'

// ============================================================
// Dashboard Service — SQL-aggregated queries for Session 6
// ============================================================

/** Returns the current month/year as { month, year } (1-indexed month). */
function currentPeriod(): { month: number; year: number } {
  const now = new Date()
  return { month: now.getMonth() + 1, year: now.getFullYear() }
}

// ---- Summary ------------------------------------------------

export function getSummary(db: Database.Database): DashboardSummary {
  const { month, year } = currentPeriod()

  // Total income and expense across ALL time (for balance)
  const allTime = db
    .prepare(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS totalIncome,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS totalExpense
       FROM transactions`,
    )
    .get() as { totalIncome: number; totalExpense: number }

  // Monthly income and expense
  const monthly = db
    .prepare(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS monthlyIncome,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS monthlyExpense
       FROM transactions
       WHERE strftime('%m', transaction_date) = printf('%02d', ?)
         AND strftime('%Y', transaction_date) = ?`,
    )
    .get(month, String(year)) as { monthlyIncome: number; monthlyExpense: number }

  // Total budget for current month
  const budgetRow = db
    .prepare(
      `SELECT COALESCE(SUM(amount), 0) AS totalBudget
       FROM budgets
       WHERE month = ? AND year = ?`,
    )
    .get(month, year) as { totalBudget: number }

  const totalBalance = allTime.totalIncome - allTime.totalExpense
  const totalBudget = budgetRow.totalBudget
  const remainingBudget = totalBudget - monthly.monthlyExpense

  return {
    totalBalance,
    monthlyIncome: monthly.monthlyIncome,
    monthlyExpense: monthly.monthlyExpense,
    totalBudget,
    remainingBudget,
  }
}

// ---- Recent Transactions ------------------------------------

export function getRecentTransactions(
  db: Database.Database,
  limit = 5,
): RecentTransaction[] {
  return db
    .prepare(
      `SELECT
         t.id,
         t.type,
         t.amount,
         t.description,
         t.transaction_date,
         c.name AS category_name
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       ORDER BY t.transaction_date DESC, t.created_at DESC
       LIMIT ?`,
    )
    .all(limit) as RecentTransaction[]
}

// ---- Chart (daily aggregation for current month) ------------

export function getChartData(db: Database.Database): ChartPoint[] {
  const { month, year } = currentPeriod()

  const rows = db
    .prepare(
      `SELECT
         transaction_date AS date,
         COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense
       FROM transactions
       WHERE strftime('%m', transaction_date) = printf('%02d', ?)
         AND strftime('%Y', transaction_date) = ?
       GROUP BY transaction_date
       ORDER BY transaction_date ASC`,
    )
    .all(month, String(year)) as ChartPoint[]

  return rows
}

// ---- Budget Overview ----------------------------------------

export function getBudgetOverview(db: Database.Database): BudgetOverviewItem[] {
  const { month, year } = currentPeriod()

  // Get all budgets for current month with category name
  const budgets = db
    .prepare(
      `SELECT
         b.id AS budget_id,
         b.category_id,
         c.name AS category_name,
         b.amount AS budget_amount
       FROM budgets b
       JOIN categories c ON b.category_id = c.id
       WHERE b.month = ? AND b.year = ?
       ORDER BY b.id ASC`,
    )
    .all(month, year) as Array<{
      budget_id: number
      category_id: number
      category_name: string
      budget_amount: number
    }>

  // For each budget, sum the spent amount from transactions in same month
  return budgets.map((row) => {
    const spentRow = db
      .prepare(
        `SELECT COALESCE(SUM(amount), 0) AS spent
         FROM transactions
         WHERE category_id = ?
           AND type = 'expense'
           AND strftime('%m', transaction_date) = printf('%02d', ?)
           AND strftime('%Y', transaction_date) = ?`,
      )
      .get(row.category_id, month, String(year)) as { spent: number }

    const spent = spentRow.spent
    const remaining = row.budget_amount - spent
    const percentage = row.budget_amount > 0
      ? Math.round((spent / row.budget_amount) * 100)
      : 0

    return {
      budget_id: row.budget_id,
      category_id: row.category_id,
      category_name: row.category_name,
      budget_amount: row.budget_amount,
      spent_amount: spent,
      remaining,
      percentage,
      is_over: spent > row.budget_amount,
    }
  })
}
