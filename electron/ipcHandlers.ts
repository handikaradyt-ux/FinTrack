import { ipcMain } from 'electron'
import { IPC_CHANNELS } from './ipcChannels.cjs'
import { DatabaseManager } from './database/DatabaseManager.js'
import * as categoryService   from './services/categoryService.js'
import * as transactionService from './services/transactionService.js'
import * as budgetService     from './services/budgetService.js'
import * as dashboardService  from './services/dashboardService.js'
import * as reportService     from './services/reportService.js'
import type {
  CreateCategoryPayload,
  UpdateCategoryPayload,
  CreateTransactionPayload,
  UpdateTransactionPayload,
  CreateBudgetPayload,
  UpdateBudgetPayload,
} from '../src/types/models.js'

// ---- helper -------------------------------------------------

function ok<T>(data: T) {
  return { success: true as const, data }
}

function fail(error: unknown) {
  if (error instanceof Error) {
    const code = (error as Error & { code?: string }).code ?? 'UNKNOWN_ERROR'
    return { success: false as const, error: { code, message: error.message } }
  }
  return { success: false as const, error: { code: 'UNKNOWN_ERROR', message: String(error) } }
}

// ============================================================
// Register all ipcMain handlers (called once from main.ts)
// ============================================================

export function registerIpcHandlers(): void {
  const db = DatabaseManager.getInstance().getDatabase()

  // ---- Categories -------------------------------------------

  ipcMain.handle(IPC_CHANNELS.CATEGORIES_GET_ALL, (_event, type?: 'income' | 'expense') => {
    try { return ok(categoryService.getAllCategories(db, type)) }
    catch (e) { return fail(e) }
  })

  ipcMain.handle(IPC_CHANNELS.CATEGORIES_CREATE, (_event, payload: CreateCategoryPayload) => {
    try { return ok(categoryService.createCategory(db, payload)) }
    catch (e) { return fail(e) }
  })

  ipcMain.handle(IPC_CHANNELS.CATEGORIES_UPDATE, (_event, id: number, payload: UpdateCategoryPayload) => {
    try { return ok(categoryService.updateCategory(db, id, payload)) }
    catch (e) { return fail(e) }
  })

  ipcMain.handle(IPC_CHANNELS.CATEGORIES_DELETE, (_event, id: number) => {
    try { categoryService.deleteCategory(db, id); return ok(null) }
    catch (e) { return fail(e) }
  })

  // ---- Transactions -----------------------------------------

  ipcMain.handle(IPC_CHANNELS.TRANSACTIONS_GET_ALL, () => {
    try { return ok(transactionService.getAllTransactions(db)) }
    catch (e) { return fail(e) }
  })

  ipcMain.handle(IPC_CHANNELS.TRANSACTIONS_GET_BY_ID, (_event, id: number) => {
    try {
      const t = transactionService.getTransactionById(db, id)
      if (!t) return fail(Object.assign(new Error(`Transaction ${id} not found.`), { code: 'NOT_FOUND' }))
      return ok(t)
    }
    catch (e) { return fail(e) }
  })

  ipcMain.handle(IPC_CHANNELS.TRANSACTIONS_CREATE, (_event, payload: CreateTransactionPayload) => {
    try { return ok(transactionService.createTransaction(db, payload)) }
    catch (e) { return fail(e) }
  })

  ipcMain.handle(IPC_CHANNELS.TRANSACTIONS_UPDATE, (_event, id: number, payload: UpdateTransactionPayload) => {
    try { return ok(transactionService.updateTransaction(db, id, payload)) }
    catch (e) { return fail(e) }
  })

  ipcMain.handle(IPC_CHANNELS.TRANSACTIONS_DELETE, (_event, id: number) => {
    try { transactionService.deleteTransaction(db, id); return ok(null) }
    catch (e) { return fail(e) }
  })

  // ---- Budgets ----------------------------------------------

  ipcMain.handle(IPC_CHANNELS.BUDGETS_GET, (_event, month?: number, year?: number) => {
    try { return ok(budgetService.getBudgets(db, month, year)) }
    catch (e) { return fail(e) }
  })

  ipcMain.handle(IPC_CHANNELS.BUDGETS_GET_PROGRESS, (_event, month: number, year: number) => {
    try { return ok(budgetService.getBudgetProgress(db, month, year)) }
    catch (e) { return fail(e) }
  })

  ipcMain.handle(IPC_CHANNELS.BUDGETS_CREATE, (_event, payload: CreateBudgetPayload) => {
    try { return ok(budgetService.createBudget(db, payload)) }
    catch (e) { return fail(e) }
  })

  ipcMain.handle(IPC_CHANNELS.BUDGETS_UPDATE, (_event, id: number, payload: UpdateBudgetPayload) => {
    try { return ok(budgetService.updateBudget(db, id, payload)) }
    catch (e) { return fail(e) }
  })

  ipcMain.handle(IPC_CHANNELS.BUDGETS_DELETE, (_event, id: number) => {
    try { budgetService.deleteBudget(db, id); return ok(null) }
    catch (e) { return fail(e) }
  })

  // ---- Dashboard (Session 6) --------------------------------

  ipcMain.handle(IPC_CHANNELS.DASHBOARD_GET_SUMMARY, () => {
    try { return ok(dashboardService.getSummary(db)) }
    catch (e) { return fail(e) }
  })

  ipcMain.handle(IPC_CHANNELS.DASHBOARD_GET_RECENT_TRANSACTIONS, () => {
    try { return ok(dashboardService.getRecentTransactions(db)) }
    catch (e) { return fail(e) }
  })

  ipcMain.handle(IPC_CHANNELS.DASHBOARD_GET_CHART, () => {
    try { return ok(dashboardService.getChartData(db)) }
    catch (e) { return fail(e) }
  })

  ipcMain.handle(IPC_CHANNELS.DASHBOARD_GET_BUDGET_OVERVIEW, () => {
    try { return ok(dashboardService.getBudgetOverview(db)) }
    catch (e) { return fail(e) }
  })

  // ---- Reports (Session 10) ---------------------------------

  ipcMain.handle(IPC_CHANNELS.REPORTS_GET_SUMMARY, (_event, startDate: string, endDate: string) => {
    try { return ok(reportService.getMonthlySummary(db, startDate, endDate)) }
    catch (e) { return fail(e) }
  })

  ipcMain.handle(IPC_CHANNELS.REPORTS_GET_EXPENSE_BY_CATEGORY, (_event, startDate: string, endDate: string) => {
    try { return ok(reportService.getExpenseByCategory(db, startDate, endDate)) }
    catch (e) { return fail(e) }
  })

  ipcMain.handle(IPC_CHANNELS.REPORTS_GET_TREND, (_event, startDate: string, endDate: string) => {
    try { return ok(reportService.getIncomeVsExpenseTrend(db, startDate, endDate)) }
    catch (e) { return fail(e) }
  })
}
