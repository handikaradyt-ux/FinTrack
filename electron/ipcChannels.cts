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
  BUDGETS_UPDATE: 'budgets:update',
  BUDGETS_DELETE: 'budgets:delete',
} as const