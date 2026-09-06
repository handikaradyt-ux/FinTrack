import { create } from 'zustand'
import type {
  BudgetOverviewItem,
  Category,
  CreateBudgetPayload,
  UpdateBudgetPayload,
} from '../types/models'

interface BudgetState {
  budgetProgress: BudgetOverviewItem[]
  categories: Category[] // expense categories only
  selectedMonth: number
  selectedYear: number
  loading: boolean
  error: string | null

  fetchBudgetProgress: () => Promise<void>
  fetchExpenseCategories: () => Promise<void>
  createBudget: (payload: CreateBudgetPayload) => Promise<boolean>
  updateBudget: (id: number, payload: UpdateBudgetPayload) => Promise<boolean>
  deleteBudget: (id: number) => Promise<boolean>
  setMonth: (month: number, year: number) => void
  previousMonth: () => void
  nextMonth: () => void
}

export const useBudgetStore = create<BudgetState>((set, get) => ({
  budgetProgress: [],
  categories: [],
  selectedMonth: new Date().getMonth() + 1,
  selectedYear: new Date().getFullYear(),
  loading: false,
  error: null,

  fetchBudgetProgress: async () => {
    const { selectedMonth, selectedYear } = get()
    set({ loading: true, error: null })
    try {
      const res = await window.api.budget.getProgress(selectedMonth, selectedYear)
      if (res.success) {
        set({ budgetProgress: res.data, loading: false })
      } else {
        set({ error: res.error.message, loading: false })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error fetching budget progress'
      console.error('[BudgetStore] fetchBudgetProgress error:', err)
      set({ error: message, loading: false })
    }
  },

  fetchExpenseCategories: async () => {
    try {
      // Only fetch expense categories for budgeting
      const res = await window.api.category.getAll('expense')
      if (res.success) {
        set({ categories: res.data })
      } else {
        console.error('[BudgetStore] Failed to fetch expense categories:', res.error.message)
      }
    } catch (err) {
      console.error('[BudgetStore] fetchExpenseCategories error:', err)
    }
  },

  createBudget: async (payload: CreateBudgetPayload) => {
    set({ loading: true, error: null })
    try {
      const res = await window.api.budget.create(payload)
      if (res.success) {
        await get().fetchBudgetProgress()
        return true
      } else {
        set({ error: res.error.message, loading: false })
        return false
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error creating budget'
      console.error('[BudgetStore] createBudget error:', err)
      set({ error: message, loading: false })
      return false
    }
  },

  updateBudget: async (id: number, payload: UpdateBudgetPayload) => {
    set({ loading: true, error: null })
    try {
      const res = await window.api.budget.update(id, payload)
      if (res.success) {
        await get().fetchBudgetProgress()
        return true
      } else {
        set({ error: res.error.message, loading: false })
        return false
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error updating budget'
      console.error('[BudgetStore] updateBudget error:', err)
      set({ error: message, loading: false })
      return false
    }
  },

  deleteBudget: async (id: number) => {
    set({ loading: true, error: null })
    try {
      const res = await window.api.budget.delete(id)
      if (res.success) {
        await get().fetchBudgetProgress()
        return true
      } else {
        set({ error: res.error.message, loading: false })
        return false
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error deleting budget'
      console.error('[BudgetStore] deleteBudget error:', err)
      set({ error: message, loading: false })
      return false
    }
  },

  setMonth: (month: number, year: number) => {
    set({ selectedMonth: month, selectedYear: year })
    get().fetchBudgetProgress()
  },

  previousMonth: () => {
    const { selectedMonth, selectedYear, setMonth } = get()
    if (selectedMonth === 1) {
      setMonth(12, selectedYear - 1)
    } else {
      setMonth(selectedMonth - 1, selectedYear)
    }
  },

  nextMonth: () => {
    const { selectedMonth, selectedYear, setMonth } = get()
    if (selectedMonth === 12) {
      setMonth(1, selectedYear + 1)
    } else {
      setMonth(selectedMonth + 1, selectedYear)
    }
  },
}))
