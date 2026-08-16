import { create } from 'zustand'
import type {
  DashboardSummary,
  RecentTransaction,
  ChartPoint,
  BudgetOverviewItem,
} from '../types/models'

// ============================================================
// Dashboard Store — Session 6
// All data flows through window.api (IPC / preload).
// No direct database or Node.js access from this store.
// ============================================================

interface DashboardState {
  // ---- Data -------------------------------------------------
  summary: DashboardSummary
  recentTransactions: RecentTransaction[]
  chartData: ChartPoint[]
  budgetOverview: BudgetOverviewItem[]

  // ---- UI state ---------------------------------------------
  loading: boolean
  error: string | null

  // ---- Actions ----------------------------------------------
  fetchDashboardData: () => Promise<void>
}

const emptySummary: DashboardSummary = {
  totalBalance: 0,
  monthlyIncome: 0,
  monthlyExpense: 0,
  totalBudget: 0,
  remainingBudget: 0,
}

export const useDashboardStore = create<DashboardState>((set) => ({
  summary: emptySummary,
  recentTransactions: [],
  chartData: [],
  budgetOverview: [],
  loading: false,
  error: null,

  fetchDashboardData: async () => {
    set({ loading: true, error: null })

    try {
      // Fire all four requests concurrently
      const [summaryRes, recentRes, chartRes, budgetRes] = await Promise.all([
        window.api.dashboard.getSummary(),
        window.api.dashboard.getRecentTransactions(),
        window.api.dashboard.getChart(),
        window.api.dashboard.getBudgetOverview(),
      ])

      // Validate each response; accumulate errors but don't crash
      const errors: string[] = []

      const summary = summaryRes.success ? summaryRes.data : (errors.push(summaryRes.error.message), emptySummary)
      const recentTransactions = recentRes.success ? recentRes.data : (errors.push(recentRes.error.message), [])
      const chartData = chartRes.success ? chartRes.data : (errors.push(chartRes.error.message), [])
      const budgetOverview = budgetRes.success ? budgetRes.data : (errors.push(budgetRes.error.message), [])

      set({
        summary,
        recentTransactions,
        chartData,
        budgetOverview,
        loading: false,
        error: errors.length > 0 ? errors.join(' | ') : null,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error fetching dashboard data.'
      console.error('[DashboardStore] fetchDashboardData error:', err)
      set({
        loading: false,
        error: message,
        summary: emptySummary,
        recentTransactions: [],
        chartData: [],
        budgetOverview: [],
      })
    }
  },
}))
