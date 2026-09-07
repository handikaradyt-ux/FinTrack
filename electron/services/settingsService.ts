import Database from 'better-sqlite3'

export interface AppSettings {
  [key: string]: string
}

export function getAllSettings(db: Database.Database): AppSettings {
  const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string, value: string }[]
  const settings: AppSettings = {}
  for (const row of rows) {
    settings[row.key] = row.value
  }
  return settings
}

export function getSetting(db: Database.Database, key: string): string | undefined {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined
  return row?.value
}

export function updateSetting(db: Database.Database, key: string, value: string): void {
  db.prepare(`
    INSERT INTO settings (key, value, updated_at) 
    VALUES (?, ?, CURRENT_TIMESTAMP) 
    ON CONFLICT(key) DO UPDATE SET 
      value = excluded.value, 
      updated_at = CURRENT_TIMESTAMP
  `).run(key, value)
}
