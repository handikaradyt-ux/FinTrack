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

export type IpcSuccess<T> = { success: true; data: T }
export type IpcError   = { success: false; error: { code: string; message: string } }
export type IpcResult<T> = IpcSuccess<T> | IpcError
