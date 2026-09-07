import Database from 'better-sqlite3'

export function initializeSchema(db: Database.Database): void {
  // Use a transaction for safe schema initialization
  const init = db.transaction(() => {
    // 1. Categories Table
    db.prepare(`
      CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run()

    // 2. Transactions Table
    db.prepare(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
        amount REAL NOT NULL CHECK(amount > 0),
        category_id INTEGER NOT NULL,
        description TEXT,
        transaction_date DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
      )
    `).run()

    // 3. Budgets Table
    db.prepare(`
      CREATE TABLE IF NOT EXISTS budgets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category_id INTEGER NOT NULL,
        amount REAL NOT NULL CHECK(amount > 0),
        month INTEGER NOT NULL CHECK(month BETWEEN 1 AND 12),
        year INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
        UNIQUE(category_id, month, year)
      )
    `).run()

    // 4. Settings Table (Session 14)
    db.prepare(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run()

    // 5. Default Settings (Session 14)
    const insertSetting = db.prepare(`INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`)
    insertSetting.run('currency', 'IDR')
    insertSetting.run('theme', 'light')
    insertSetting.run('language', 'id')

    // 6. Indexes
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date)`).run()
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id)`).run()
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_budgets_period ON budgets(category_id, month, year)`).run()
  })

  // Execute the transaction
  init()
}
