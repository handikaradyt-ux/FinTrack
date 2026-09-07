// ============================================================
// FinTrack Domain Models
// Reflects the SQLite schema defined in Session 3.
// ============================================================

export type TransactionType = 'income' | 'expense'

// ---- Category -----------------------------------------------

export interface Category {
  id: number
  name: string
  type: TransactionType
  created_at: string
  updated_at: string
}

export type CreateCategoryPayload = {
  name: string
  type: TransactionType
}

export type UpdateCategoryPayload = {
  name?: string
  type?: TransactionType
}

// ---- Transaction --------------------------------------------

export interface Transaction {
  id: number
  type: TransactionType
  amount: number
  category_id: number
  description: string | null
  transaction_date: string   // ISO date string  "YYYY-MM-DD"
  created_at: string
  updated_at: string
}

export type CreateTransactionPayload = {
  type: TransactionType
  amount: number
  category_id: number
  description?: string | null
  transaction_date: string
}

export type UpdateTransactionPayload = {
  type?: TransactionType
  amount?: number
  category_id?: number
  description?: string | null
  transaction_date?: string
}

export interface TransactionFilters {
  keyword: string
  categoryId: number | null
  type: TransactionType | null
  startDate: string | null
  endDate: string | null
  sortBy: 'date' | 'amount'
  sortDirection: 'asc' | 'desc'
}

// ---- Settings -----------------------------------------------

export type ThemeSetting = 'light' | 'dark'
export type CurrencySetting = 'IDR' | 'USD'
export type LanguageSetting = 'id'

export interface AppSettings {
  theme?: ThemeSetting
  currency?: CurrencySetting
  language?: LanguageSetting
  [key: string]: string | undefined
}

// ---- Budget -------------------------------------------------

export interface Budget {
  id: number
  category_id: number
  amount: number
  month: number    // 1–12
  year: number
  created_at: string
  updated_at: string
}

export type CreateBudgetPayload = {
  category_id: number
  amount: number
  month: number
  year: number
}

export type UpdateBudgetPayload = {
  amount?: number
  month?: number
  year?: number
}

// ---- Generic IPC response wrapper ---------------------------

export interface IpcError {
  code: string
  message: string
}

export type IpcResult<T> =
  | {
      success: true
      data: T
      error?: never
    }
  | {
      success: false
      data?: never
      error: IpcError
    }

// ---- Dashboard types (Session 6) ----------------------------

export interface DashboardSummary {
  totalBalance: number
  monthlyIncome: number
  monthlyExpense: number
  totalBudget: number
  remainingBudget: number
}

export interface RecentTransaction {
  id: number
  type: TransactionType
  amount: number
  description: string | null
  transaction_date: string
  category_name: string | null
}

export interface ChartPoint {
  date: string   // "YYYY-MM-DD"
  income: number
  expense: number
}

export interface BudgetOverviewItem {
  budget_id: number
  category_id: number
  category_name: string
  budget_amount: number
  spent_amount: number
  remaining: number
  percentage: number   // 0–(>100 if over budget)
  is_over: boolean
}

// ---- Reports (Session 10) -----------------------------------

export interface ReportSummary {
  totalIncome: number
  totalExpense: number
  balance: number
}

export interface ExpenseByCategoryItem {
  categoryId: number
  categoryName: string
  amount: number
}

export interface ReportTrendItem {
  period: string
  income: number
  expense: number
}

export interface DateRange {
  startDate: string
  endDate: string
}
