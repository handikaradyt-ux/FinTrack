import { contextBridge, ipcRenderer } from 'electron'

// ============================================================
// Preload — exposes controlled window.api to Renderer
// ============================================================

const api = {
  // Legacy — keep working
  getVersion: (): Promise<string> => ipcRenderer.invoke('app:getVersion'),

  // ---- Category API -----------------------------------------
  category: {
    getAll: (type?: 'income' | 'expense') =>
      ipcRenderer.invoke('categories:getAll', type),
    create: (payload: { name: string; type: 'income' | 'expense' }) =>
      ipcRenderer.invoke('categories:create', payload),
    update: (id: number, payload: { name?: string; type?: 'income' | 'expense' }) =>
      ipcRenderer.invoke('categories:update', id, payload),
    delete: (id: number) =>
      ipcRenderer.invoke('categories:delete', id),
  },

  // ---- Transaction API --------------------------------------
  transaction: {
    getAll: (filters?: any) =>
      ipcRenderer.invoke('transactions:getAll', filters),
    getById: (id: number) =>
      ipcRenderer.invoke('transactions:getById', id),
    create: (payload: {
      type: 'income' | 'expense'
      amount: number
      category_id: number
      description?: string | null
      transaction_date: string
    }) => ipcRenderer.invoke('transactions:create', payload),
    update: (id: number, payload: {
      type?: 'income' | 'expense'
      amount?: number
      category_id?: number
      description?: string | null
      transaction_date?: string
    }) => ipcRenderer.invoke('transactions:update', id, payload),
    delete: (id: number) =>
      ipcRenderer.invoke('transactions:delete', id),
  },

  // ---- Budget API -------------------------------------------
  budget: {
    get: (month?: number, year?: number) =>
      ipcRenderer.invoke('budgets:get', month, year),
    getProgress: (month: number, year: number) =>
      ipcRenderer.invoke('budgets:getProgress', month, year),
    create: (payload: {
      category_id: number
      amount: number
      month: number
      year: number
    }) => ipcRenderer.invoke('budgets:create', payload),
    update: (id: number, payload: {
      amount?: number
      month?: number
      year?: number
    }) => ipcRenderer.invoke('budgets:update', id, payload),
    delete: (id: number) =>
      ipcRenderer.invoke('budgets:delete', id),
  },

  // ---- Dashboard API (Session 6) ----------------------------
  dashboard: {
    getSummary: () =>
      ipcRenderer.invoke('dashboard:getSummary'),
    getRecentTransactions: () =>
      ipcRenderer.invoke('dashboard:getRecentTransactions'),
    getChart: () =>
      ipcRenderer.invoke('dashboard:getChart'),
    getBudgetOverview: () =>
      ipcRenderer.invoke('dashboard:getBudgetOverview'),
  },

  // ---- Report API -------------------------------------------
  report: {
    getSummary: (startDate: string, endDate: string) =>
      ipcRenderer.invoke('report:getSummary', startDate, endDate),
    getExpenseByCategory: (startDate: string, endDate: string) =>
      ipcRenderer.invoke('report:getExpenseByCategory', startDate, endDate),
    getTrend: (startDate: string, endDate: string) =>
      ipcRenderer.invoke('report:getTrend', startDate, endDate),
  },

  // ---- Export API -------------------------------------------
  export: {
    csv: (filters?: any) => ipcRenderer.invoke('export:csv', filters),
    pdf: (filters?: any) => ipcRenderer.invoke('export:pdf', filters),
  },

  // ---- Backup API -------------------------------------------
  backup: {
    create: () => ipcRenderer.invoke('backup:create'),
    restore: () => ipcRenderer.invoke('backup:restore'),
  }
}

contextBridge.exposeInMainWorld('api', api)