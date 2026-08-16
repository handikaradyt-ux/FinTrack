import type {
  Category,
  Transaction,
  Budget,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  CreateTransactionPayload,
  UpdateTransactionPayload,
  CreateBudgetPayload,
  UpdateBudgetPayload,
  IpcResult,
} from './models'

export {}

declare global {
  interface Window {
    api: {
      // Legacy
      getVersion: () => Promise<string>

      // Category
      category: {
        getAll: (type?: 'income' | 'expense') => Promise<IpcResult<Category[]>>
        create: (payload: CreateCategoryPayload) => Promise<IpcResult<Category>>
        update: (id: number, payload: UpdateCategoryPayload) => Promise<IpcResult<Category>>
        delete: (id: number) => Promise<IpcResult<null>>
      }

      // Transaction
      transaction: {
        getAll: () => Promise<IpcResult<Transaction[]>>
        getById: (id: number) => Promise<IpcResult<Transaction>>
        create: (payload: CreateTransactionPayload) => Promise<IpcResult<Transaction>>
        update: (id: number, payload: UpdateTransactionPayload) => Promise<IpcResult<Transaction>>
        delete: (id: number) => Promise<IpcResult<null>>
      }

      // Budget
      budget: {
        get: (month?: number, year?: number) => Promise<IpcResult<Budget[]>>
        create: (payload: CreateBudgetPayload) => Promise<IpcResult<Budget>>
        update: (id: number, payload: UpdateBudgetPayload) => Promise<IpcResult<Budget>>
        delete: (id: number) => Promise<IpcResult<null>>
      }
    }
  }
}