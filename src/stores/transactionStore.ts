import { create } from 'zustand'
import type {
  Transaction,
  CreateTransactionPayload,
  UpdateTransactionPayload,
  Category,
} from '../types/models'

interface TransactionState {
  transactions: Transaction[]
  categories: Category[]
  loading: boolean
  error: string | null

  fetchTransactions: () => Promise<void>
  fetchCategories: () => Promise<void>
  createTransaction: (payload: CreateTransactionPayload) => Promise<boolean>
  updateTransaction: (id: number, payload: UpdateTransactionPayload) => Promise<boolean>
  deleteTransaction: (id: number) => Promise<boolean>
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  categories: [],
  loading: false,
  error: null,

  fetchTransactions: async () => {
    set({ loading: true, error: null })
    try {
      const res = await window.api.transaction.getAll()
      if (res.success) {
        set({ transactions: res.data, loading: false })
      } else {
        set({ error: res.error.message, loading: false })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error fetching transactions'
      console.error('[TransactionStore] fetchTransactions error:', err)
      set({ error: message, loading: false })
    }
  },

  fetchCategories: async () => {
    try {
      const res = await window.api.category.getAll()
      if (res.success) {
        set({ categories: res.data })
      } else {
        console.error('[TransactionStore] fetchCategories error:', res.error.message)
      }
    } catch (err) {
      console.error('[TransactionStore] fetchCategories error:', err)
    }
  },

  createTransaction: async (payload: CreateTransactionPayload) => {
    try {
      const res = await window.api.transaction.create(payload)
      if (res.success) {
        await get().fetchTransactions()
        return true
      } else {
        set({ error: res.error.message })
        return false
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error creating transaction'
      set({ error: message })
      return false
    }
  },

  updateTransaction: async (id: number, payload: UpdateTransactionPayload) => {
    try {
      const res = await window.api.transaction.update(id, payload)
      if (res.success) {
        await get().fetchTransactions()
        return true
      } else {
        set({ error: res.error.message })
        return false
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error updating transaction'
      set({ error: message })
      return false
    }
  },

  deleteTransaction: async (id: number) => {
    try {
      const res = await window.api.transaction.delete(id)
      if (res.success) {
        await get().fetchTransactions()
        return true
      } else {
        set({ error: res.error.message })
        return false
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error deleting transaction'
      set({ error: message })
      return false
    }
  },
}))
