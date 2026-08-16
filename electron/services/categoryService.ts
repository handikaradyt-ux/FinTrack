import Database from 'better-sqlite3'
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '../../src/types/models.js'

// ---- helpers ------------------------------------------------

function now(): string {
  return new Date().toISOString()
}

// ============================================================
// Category Service
// ============================================================

export function getAllCategories(
  db: Database.Database,
  type?: 'income' | 'expense',
): Category[] {
  if (type) {
    return db
      .prepare('SELECT * FROM categories WHERE type = ? ORDER BY name ASC')
      .all(type) as Category[]
  }
  return db
    .prepare('SELECT * FROM categories ORDER BY name ASC')
    .all() as Category[]
}

export function getCategoryById(
  db: Database.Database,
  id: number,
): Category | undefined {
  return db
    .prepare('SELECT * FROM categories WHERE id = ?')
    .get(id) as Category | undefined
}

export function createCategory(
  db: Database.Database,
  payload: CreateCategoryPayload,
): Category {
  const { name, type } = payload

  // Validate
  if (!name || name.trim() === '') {
    throw Object.assign(new Error('Category name is required.'), { code: 'VALIDATION_ERROR' })
  }
  if (type !== 'income' && type !== 'expense') {
    throw Object.assign(new Error('Category type must be income or expense.'), { code: 'VALIDATION_ERROR' })
  }

  // Duplicate check (same name + same type)
  const existing = db
    .prepare('SELECT id FROM categories WHERE name = ? AND type = ?')
    .get(name.trim(), type)
  if (existing) {
    throw Object.assign(
      new Error(`A "${type}" category named "${name}" already exists.`),
      { code: 'DUPLICATE_ERROR' },
    )
  }

  const ts = now()
  const result = db
    .prepare(
      'INSERT INTO categories (name, type, created_at, updated_at) VALUES (?, ?, ?, ?)',
    )
    .run(name.trim(), type, ts, ts)

  return getCategoryById(db, result.lastInsertRowid as number)!
}

export function updateCategory(
  db: Database.Database,
  id: number,
  payload: UpdateCategoryPayload,
): Category {
  const existing = getCategoryById(db, id)
  if (!existing) {
    throw Object.assign(new Error(`Category with id ${id} not found.`), { code: 'NOT_FOUND' })
  }

  const newName = payload.name !== undefined ? payload.name.trim() : existing.name
  const newType = payload.type !== undefined ? payload.type : existing.type

  if (!newName) {
    throw Object.assign(new Error('Category name cannot be empty.'), { code: 'VALIDATION_ERROR' })
  }
  if (newType !== 'income' && newType !== 'expense') {
    throw Object.assign(new Error('Category type must be income or expense.'), { code: 'VALIDATION_ERROR' })
  }

  // Duplicate check (exclude self)
  const duplicate = db
    .prepare('SELECT id FROM categories WHERE name = ? AND type = ? AND id != ?')
    .get(newName, newType, id)
  if (duplicate) {
    throw Object.assign(
      new Error(`A "${newType}" category named "${newName}" already exists.`),
      { code: 'DUPLICATE_ERROR' },
    )
  }

  db.prepare(
    'UPDATE categories SET name = ?, type = ?, updated_at = ? WHERE id = ?',
  ).run(newName, newType, now(), id)

  return getCategoryById(db, id)!
}

export function deleteCategory(db: Database.Database, id: number): void {
  const existing = getCategoryById(db, id)
  if (!existing) {
    throw Object.assign(new Error(`Category with id ${id} not found.`), { code: 'NOT_FOUND' })
  }

  // Cannot delete if used by transactions
  const inUse = db
    .prepare('SELECT id FROM transactions WHERE category_id = ? LIMIT 1')
    .get(id)
  if (inUse) {
    throw Object.assign(
      new Error('Cannot delete a category that is used by existing transactions.'),
      { code: 'CONSTRAINT_ERROR' },
    )
  }

  db.prepare('DELETE FROM categories WHERE id = ?').run(id)
}
