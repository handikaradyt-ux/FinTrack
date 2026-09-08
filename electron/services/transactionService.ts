import Database from 'better-sqlite3'
import type {
  Transaction,
  CreateTransactionPayload,
  UpdateTransactionPayload,
  TransactionFilters,
} from '../../src/types/models.js'
import { transactionSchema, updateTransactionSchema } from '../../src/schemas/transactionSchema.js'
import { getCategoryById } from './categoryService.js'

// ---- helpers ------------------------------------------------

function now(): string {
  return new Date().toISOString()
}

function isValidDate(dateStr: string): boolean {
  // Expect "YYYY-MM-DD"
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !isNaN(Date.parse(dateStr))
}

// ============================================================
// Transaction Service
// ============================================================

export function getAllTransactions(db: Database.Database, filters?: Partial<TransactionFilters>): Transaction[] {
  let query = 'SELECT * FROM transactions WHERE 1=1'
  const params: any[] = []

  if (filters) {
    if (filters.keyword?.trim()) {
      query += ` AND description LIKE '%' || ? || '%'`
      params.push(filters.keyword.trim())
    }
    if (filters.categoryId) {
      query += ` AND category_id = ?`
      params.push(filters.categoryId)
    }
    if (filters.type) {
      query += ` AND type = ?`
      params.push(filters.type)
    }
    if (filters.startDate) {
      query += ` AND transaction_date >= ?`
      params.push(filters.startDate)
    }
    if (filters.endDate) {
      query += ` AND transaction_date <= ?`
      params.push(filters.endDate)
    }
    
    const sortCol = filters.sortBy === 'amount' ? 'amount' : 'transaction_date'
    const sortDir = filters.sortDirection === 'asc' ? 'ASC' : 'DESC'
    
    query += ` ORDER BY ${sortCol} ${sortDir}, created_at DESC`
  } else {
    query += ` ORDER BY transaction_date DESC, created_at DESC`
  }

  return db.prepare(query).all(...params) as Transaction[]
}

export function getTransactionById(
  db: Database.Database,
  id: number,
): Transaction | undefined {
  return db
    .prepare('SELECT * FROM transactions WHERE id = ?')
    .get(id) as Transaction | undefined
}

export function createTransaction(
  db: Database.Database,
  payload: CreateTransactionPayload,
): Transaction {
  // Validate basic shape
  const validated = transactionSchema.parse(payload)
  const { type, amount, category_id, description, transaction_date } = validated

  // Validate category exists
  const category = getCategoryById(db, category_id)
  if (!category) {
    throw Object.assign(
      new Error(`Category with id ${category_id} not found.`),
      { code: 'NOT_FOUND' },
    )
  }
  // Validate category type matches transaction type
  if (category.type !== type) {
    throw Object.assign(
      new Error(
        `Transaction type "${type}" does not match category type "${category.type}".`,
      ),
      { code: 'TYPE_MISMATCH' },
    )
  }

  const ts = now()
  const result = db
    .prepare(
      `INSERT INTO transactions
         (type, amount, category_id, description, transaction_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(type, amount, category_id, description ?? null, transaction_date, ts, ts)

  return getTransactionById(db, result.lastInsertRowid as number)!
}

export function updateTransaction(
  db: Database.Database,
  id: number,
  payload: UpdateTransactionPayload,
): Transaction {
  const existing = getTransactionById(db, id)
  if (!existing) {
    throw Object.assign(
      new Error(`Transaction with id ${id} not found.`),
      { code: 'NOT_FOUND' },
    )
  }

  const validated = updateTransactionSchema.parse(payload)

  const newType             = validated.type             ?? existing.type
  const newAmount           = validated.amount           ?? existing.amount
  const newCategoryId       = validated.category_id      ?? existing.category_id
  const newDescription      = validated.description !== undefined
    ? validated.description
    : existing.description
  const newTransactionDate  = validated.transaction_date ?? existing.transaction_date

  const category = getCategoryById(db, newCategoryId)
  if (!category) {
    throw Object.assign(
      new Error(`Category with id ${newCategoryId} not found.`),
      { code: 'NOT_FOUND' },
    )
  }
  if (category.type !== newType) {
    throw Object.assign(
      new Error(
        `Transaction type "${newType}" does not match category type "${category.type}".`,
      ),
      { code: 'TYPE_MISMATCH' },
    )
  }

  db.prepare(
    `UPDATE transactions
     SET type = ?, amount = ?, category_id = ?, description = ?,
         transaction_date = ?, updated_at = ?
     WHERE id = ?`,
  ).run(newType, newAmount, newCategoryId, newDescription, newTransactionDate, now(), id)

  return getTransactionById(db, id)!
}

export function deleteTransaction(db: Database.Database, id: number): void {
  const existing = getTransactionById(db, id)
  if (!existing) {
    throw Object.assign(
      new Error(`Transaction with id ${id} not found.`),
      { code: 'NOT_FOUND' },
    )
  }
  db.prepare('DELETE FROM transactions WHERE id = ?').run(id)
}
