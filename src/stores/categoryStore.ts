import { create } from 'zustand'
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '../types/models'

interface CategoryState {
  categories: Category[]
  loading: boolean
  error: string | null

  fetchCategories: () => Promise<void>
  createCategory: (payload: CreateCategoryPayload) => Promise<boolean>
  updateCategory: (id: number, payload: UpdateCategoryPayload) => Promise<boolean>
  deleteCategory: (id: number) => Promise<boolean>
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async () => {
    set({ loading: true, error: null })
    try {
      const res = await window.api.category.getAll()
      if (res.success) {
        set({ categories: res.data, loading: false })
      } else {
        set({ error: res.error.message, loading: false })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error fetching categories'
      console.error('[CategoryStore] fetchCategories error:', err)
      set({ error: message, loading: false })
    }
  },

  createCategory: async (payload: CreateCategoryPayload) => {
    try {
      const res = await window.api.category.create(payload)
      if (res.success) {
        await get().fetchCategories()
        return true
      } else {
        set({ error: res.error.message })
        return false
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error creating category'
      set({ error: message })
      return false
    }
  },

  updateCategory: async (id: number, payload: UpdateCategoryPayload) => {
    try {
      const res = await window.api.category.update(id, payload)
      if (res.success) {
        await get().fetchCategories()
        return true
      } else {
        set({ error: res.error.message })
        return false
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error updating category'
      set({ error: message })
      return false
    }
  },

  deleteCategory: async (id: number) => {
    try {
      const res = await window.api.category.delete(id)
      if (res.success) {
        await get().fetchCategories()
        return true
      } else {
        set({ error: res.error.message })
        return false
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error deleting category'
      set({ error: message })
      return false
    }
  },
}))
