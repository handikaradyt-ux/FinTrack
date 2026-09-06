import { create } from 'zustand'
import type { ReportSummary, ExpenseByCategoryItem, ReportTrendItem, DateRange } from '../types/models'

interface ReportState {
  dateRange: DateRange
  summary: ReportSummary | null
  expenseByCategory: ExpenseByCategoryItem[]
  trend: ReportTrendItem[]
  loading: boolean
  error: string | null

  setDateRange: (start: string, end: string) => void
  fetchReportData: () => Promise<void>
}

// Default to current month
function getDefaultDateRange(): DateRange {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  // Format as YYYY-MM-DD
  const format = (d: Date) => d.toISOString().split('T')[0]
  
  return {
    startDate: format(firstDay),
    endDate: format(lastDay)
  }
}

export const useReportStore = create<ReportState>((set, get) => ({
  dateRange: getDefaultDateRange(),
  summary: null,
  expenseByCategory: [],
  trend: [],
  loading: false,
  error: null,

  setDateRange: (startDate: string, endDate: string) => {
    set({ dateRange: { startDate, endDate } })
    get().fetchReportData()
  },

  fetchReportData: async () => {
    const { dateRange: { startDate, endDate } } = get()
    
    set({ loading: true, error: null })
    try {
      const [summaryRes, categoryRes, trendRes] = await Promise.all([
        window.api.report.getSummary(startDate, endDate),
        window.api.report.getExpenseByCategory(startDate, endDate),
        window.api.report.getTrend(startDate, endDate)
      ])

      if (summaryRes.success && categoryRes.success && trendRes.success) {
        set({
          summary: summaryRes.data,
          expenseByCategory: categoryRes.data,
          trend: trendRes.data,
          loading: false
        })
      } else {
        // Collect errors
        const errs = []
        if (!summaryRes.success) errs.push(summaryRes.error.message)
        if (!categoryRes.success) errs.push(categoryRes.error.message)
        if (!trendRes.success) errs.push(trendRes.error.message)
        
        set({ error: errs.join(', '), loading: false })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error fetching reports'
      console.error('[ReportStore] fetchReportData error:', err)
      set({ error: message, loading: false })
    }
  }
}))
