import Database from 'better-sqlite3'
import type {
  ReportSummary,
  ExpenseByCategoryItem,
  ReportTrendItem,
} from '../../src/types/models.js'

// ============================================================
// Report Service — SQL-aggregated queries for Session 10
// ============================================================

export function getMonthlySummary(
  db: Database.Database,
  startDate: string,
  endDate: string
): ReportSummary {
  const row = db
    .prepare(
      `SELECT
         COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS totalIncome,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS totalExpense
       FROM transactions
       WHERE transaction_date >= ? AND transaction_date <= ?`
    )
    .get(startDate, endDate) as { totalIncome: number; totalExpense: number }

  const balance = row.totalIncome - row.totalExpense

  return {
    totalIncome: row.totalIncome,
    totalExpense: row.totalExpense,
    balance,
  }
}

export function getExpenseByCategory(
  db: Database.Database,
  startDate: string,
  endDate: string
): ExpenseByCategoryItem[] {
  const rows = db
    .prepare(
      `SELECT
         c.id AS categoryId,
         c.name AS categoryName,
         COALESCE(SUM(t.amount), 0) AS amount
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.type = 'expense'
         AND t.transaction_date >= ? AND t.transaction_date <= ?
       GROUP BY c.id, c.name
       ORDER BY amount DESC`
    )
    .all(startDate, endDate) as ExpenseByCategoryItem[]

  return rows
}

export function getIncomeVsExpenseTrend(
  db: Database.Database,
  startDate: string,
  endDate: string
): ReportTrendItem[] {
  const rows = db
    .prepare(
      `SELECT
         strftime('%Y-%m', transaction_date) AS period,
         COALESCE(SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END), 0) AS income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense
       FROM transactions
       WHERE transaction_date >= ? AND transaction_date <= ?
       GROUP BY period
       ORDER BY period ASC`
    )
    .all(startDate, endDate) as ReportTrendItem[]

  return rows
}
