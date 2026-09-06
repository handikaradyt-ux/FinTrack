export const IPC_CHANNELS = {
  // App
  APP_GET_VERSION: 'app:getVersion',

  // Transactions
  TRANSACTIONS_CREATE:   'transactions:create',
  TRANSACTIONS_GET_ALL:  'transactions:getAll',
  TRANSACTIONS_GET_BY_ID: 'transactions:getById',
  TRANSACTIONS_UPDATE:   'transactions:update',
  TRANSACTIONS_DELETE:   'transactions:delete',

  // Categories
  CATEGORIES_CREATE:  'categories:create',
  CATEGORIES_GET_ALL: 'categories:getAll',
  CATEGORIES_UPDATE:  'categories:update',
  CATEGORIES_DELETE:  'categories:delete',

  // Budgets
  BUDGETS_CREATE: 'budgets:create',
  BUDGETS_GET:    'budgets:get',
  BUDGETS_GET_PROGRESS: 'budgets:getProgress',
  BUDGETS_UPDATE: 'budgets:update',
  BUDGETS_DELETE: 'budgets:delete',

  // Dashboard (Session 6)
  DASHBOARD_GET_SUMMARY:            'dashboard:getSummary',
  DASHBOARD_GET_RECENT_TRANSACTIONS:'dashboard:getRecentTransactions',
  DASHBOARD_GET_CHART:              'dashboard:getChart',
  DASHBOARD_GET_BUDGET_OVERVIEW:    'dashboard:getBudgetOverview',

  // Reports (Session 10)
  REPORTS_GET_SUMMARY:              'report:getSummary',
  REPORTS_GET_EXPENSE_BY_CATEGORY:  'report:getExpenseByCategory',
  REPORTS_GET_TREND:                'report:getTrend',
} as const