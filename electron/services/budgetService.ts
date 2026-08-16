import Database from 'better-sqlite3'
import type {
  Budget,
  CreateBudgetPayload,
  UpdateBudgetPayload,
} from '../../src/types/models.js'
import { getCategoryById } from './categoryService.js'

// ---- helpers ------------------------------------------------

function now(): string {
  return new Date().toISOString()
}

function isValidYear(year: number): boolean {
  return Number.isInteger(year) && year >= 2000 && year <= 2100
}

// ============================================================
// Budget Service
// ============================================================

export function getBudgets(
  db: Database.Database,
  month?: number,
  year?: number,
): Budget[] {
  if (month !== undefined && year !== undefined) {
    return db
      .prepare('SELECT * FROM budgets WHERE month = ? AND year = ? ORDER BY id ASC')
      .all(month, year) as Budget[]
  }
  if (year !== undefined) {
    return db
      .prepare('SELECT * FROM budgets WHERE year = ? ORDER BY month ASC')
      .all(year) as Budget[]
  }
  return db.prepare('SELECT * FROM budgets ORDER BY year DESC, month DESC').all() as Budget[]
}

export function getBudgetById(
  db: Database.Database,
  id: number,
): Budget | undefined {
  return db
    .prepare('SELECT * FROM budgets WHERE id = ?')
    .get(id) as Budget | undefined
}

export function createBudget(
  db: Database.Database,
  payload: CreateBudgetPayload,
): Budget {
  const { category_id, amount, month, year } = payload

  // Validate category exists
  const category = getCategoryById(db, category_id)
  if (!category) {
    throw Object.assign(
      new Error(`Category with id ${category_id} not found.`),
      { code: 'NOT_FOUND' },
    )
  }
  // Validate amount
  if (typeof amount !== 'number' || amount <= 0) {
    throw Object.assign(
      new Error('Budget amount must be a positive number.'),
      { code: 'VALIDATION_ERROR' },
    )
  }
  // Validate month
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw Object.assign(
      new Error('Budget month must be an integer between 1 and 12.'),
      { code: 'VALIDATION_ERROR' },
    )
  }
  // Validate year
  if (!isValidYear(year)) {
    throw Object.assign(
      new Error('Budget year must be an integer between 2000 and 2100.'),
      { code: 'VALIDATION_ERROR' },
    )
  }

  // Unique constraint: category_id + month + year
  const duplicate = db
    .prepare('SELECT id FROM budgets WHERE category_id = ? AND month = ? AND year = ?')
    .get(category_id, month, year)
  if (duplicate) {
    throw Object.assign(
      new Error(
        `A budget for category ${category_id} in ${month}/${year} already exists.`,
      ),
      { code: 'DUPLICATE_ERROR' },
    )
  }

  const ts = now()
  const result = db
    .prepare(
      'INSERT INTO budgets (category_id, amount, month, year, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    )
    .run(category_id, amount, month, year, ts, ts)

  return getBudgetById(db, result.lastInsertRowid as number)!
}

export function updateBudget(
  db: Database.Database,
  id: number,
  payload: UpdateBudgetPayload,
): Budget {
  const existing = getBudgetById(db, id)
  if (!existing) {
    throw Object.assign(new Error(`Budget with id ${id} not found.`), { code: 'NOT_FOUND' })
  }

  const newAmount = payload.amount ?? existing.amount
  const newMonth  = payload.month  ?? existing.month
  const newYear   = payload.year   ?? existing.year

  if (typeof newAmount !== 'number' || newAmount <= 0) {
    throw Object.assign(
      new Error('Budget amount must be a positive number.'),
      { code: 'VALIDATION_ERROR' },
    )
  }
  if (!Number.isInteger(newMonth) || newMonth < 1 || newMonth > 12) {
    throw Object.assign(
      new Error('Budget month must be between 1 and 12.'),
      { code: 'VALIDATION_ERROR' },
    )
  }
  if (!isValidYear(newYear)) {
    throw Object.assign(
      new Error('Budget year must be between 2000 and 2100.'),
      { code: 'VALIDATION_ERROR' },
    )
  }

  // Duplicate check (exclude self)
  const duplicate = db
    .prepare(
      'SELECT id FROM budgets WHERE category_id = ? AND month = ? AND year = ? AND id != ?',
    )
    .get(existing.category_id, newMonth, newYear, id)
  if (duplicate) {
    throw Object.assign(
      new Error(
        `A budget for category ${existing.category_id} in ${newMonth}/${newYear} already exists.`,
      ),
      { code: 'DUPLICATE_ERROR' },
    )
  }

  db.prepare(
    'UPDATE budgets SET amount = ?, month = ?, year = ?, updated_at = ? WHERE id = ?',
  ).run(newAmount, newMonth, newYear, now(), id)

  return getBudgetById(db, id)!
}

export function deleteBudget(db: Database.Database, id: number): void {
  const existing = getBudgetById(db, id)
  if (!existing) {
    throw Object.assign(new Error(`Budget with id ${id} not found.`), { code: 'NOT_FOUND' })
  }
  db.prepare('DELETE FROM budgets WHERE id = ?').run(id)
}
