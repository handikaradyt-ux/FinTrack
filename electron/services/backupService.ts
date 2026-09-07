import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'
import { app } from 'electron'
import { DatabaseManager } from '../database/DatabaseManager.js'

export async function backupDatabase(db: Database.Database, destinationPath: string): Promise<void> {
  const journalMode = db.pragma('journal_mode', { simple: true })
  if (journalMode === 'wal') {
    db.pragma('wal_checkpoint(FULL)')
  }

  const userDataPath = app.getPath('userData')
  const dbPath = path.join(userDataPath, 'fintrack.db')

  await fs.promises.copyFile(dbPath, destinationPath)
}

export async function restoreDatabase(candidatePath: string): Promise<void> {
  // 1. Candidate Validation
  if (!fs.existsSync(candidatePath)) {
    throw new Error('File backup tidak ditemukan.')
  }

  let candidateDb: Database.Database | null = null
  try {
    candidateDb = new Database(candidatePath, { readonly: true })
    const integrity = candidateDb.pragma('integrity_check', { simple: true })
    if (integrity !== 'ok') {
      throw new Error('Integritas file backup gagal (corrupted).')
    }

    // specific schema check
    const tables = candidateDb.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as {name: string}[]
    const tableNames = tables.map(t => t.name)
    if (!tableNames.includes('categories') || !tableNames.includes('transactions') || !tableNames.includes('budgets')) {
      throw new Error('File tidak memiliki struktur tabel FinTrack yang valid.')
    }

    // check specific columns
    const categoryColumns = (candidateDb.pragma('table_info(categories)') as any[]).map(c => c.name)
    if (!categoryColumns.includes('name') || !categoryColumns.includes('type')) {
      throw new Error('Tabel categories tidak valid.')
    }

    const transactionColumns = (candidateDb.pragma('table_info(transactions)') as any[]).map(c => c.name)
    if (!transactionColumns.includes('amount') || !transactionColumns.includes('transaction_date')) {
      throw new Error('Tabel transactions tidak valid.')
    }

    const budgetColumns = (candidateDb.pragma('table_info(budgets)') as any[]).map(c => c.name)
    if (!budgetColumns.includes('month') || !budgetColumns.includes('year')) {
      throw new Error('Tabel budgets tidak valid.')
    }
  } catch (error: any) {
    throw new Error('Gagal memvalidasi file backup: ' + error.message)
  } finally {
    if (candidateDb) candidateDb.close()
  }

  // 2. Prepare Paths and Rollback Variables
  const userDataPath = app.getPath('userData')
  const activeDbPath = path.join(userDataPath, 'fintrack.db')
  const timestamp = Date.now()
  const safetyBackupPath = path.join(userDataPath, `fintrack.db.bak.${timestamp}`)
  
  const activeDbWal = activeDbPath + '-wal'
  const activeDbShm = activeDbPath + '-shm'
  const safetyWalPath = safetyBackupPath + '-wal'
  const safetyShmPath = safetyBackupPath + '-shm'

  // We need to WAL checkpoint the current db if WAL active
  const dbManager = DatabaseManager.getInstance()
  const db = dbManager.getDatabase()
  const journalMode = db.pragma('journal_mode', { simple: true })
  
  if (journalMode === 'wal') {
    db.pragma('wal_checkpoint(FULL)')
  }

  // Close active connection
  dbManager.close()

  try {
    // 3. Pre-restore Safety Copy
    await fs.promises.copyFile(activeDbPath, safetyBackupPath)
    if (fs.existsSync(activeDbWal)) {
      await fs.promises.copyFile(activeDbWal, safetyWalPath)
    }
    if (fs.existsSync(activeDbShm)) {
      await fs.promises.copyFile(activeDbShm, safetyShmPath)
    }

    // 4. WAL Safe cleanup on active DB
    if (fs.existsSync(activeDbWal)) await fs.promises.unlink(activeDbWal)
    if (fs.existsSync(activeDbShm)) await fs.promises.unlink(activeDbShm)

    // 5. Overwrite Active Database
    await fs.promises.copyFile(candidatePath, activeDbPath)

    // 6. Re-init DatabaseManager
    dbManager.init()
    
    // Quick verify the re-opened DB
    const newDb = dbManager.getDatabase()
    newDb.prepare('SELECT COUNT(*) FROM transactions').get()

    // 7. Cleanup safety copy
    if (fs.existsSync(safetyBackupPath)) await fs.promises.unlink(safetyBackupPath)
    if (fs.existsSync(safetyWalPath)) await fs.promises.unlink(safetyWalPath)
    if (fs.existsSync(safetyShmPath)) await fs.promises.unlink(safetyShmPath)

  } catch (err: any) {
    // ROLLBACK
    console.error('Restore failed, initiating rollback...', err)
    
    // Close the possibly opened candidate connection inside dbManager
    try { dbManager.close() } catch (e) {}
    
    // Clear potentially corrupted files
    if (fs.existsSync(activeDbPath)) await fs.promises.unlink(activeDbPath)
    if (fs.existsSync(activeDbWal)) await fs.promises.unlink(activeDbWal)
    if (fs.existsSync(activeDbShm)) await fs.promises.unlink(activeDbShm)

    // Restore safety copy
    if (fs.existsSync(safetyBackupPath)) await fs.promises.copyFile(safetyBackupPath, activeDbPath)
    if (fs.existsSync(safetyWalPath)) await fs.promises.copyFile(safetyWalPath, activeDbWal)
    if (fs.existsSync(safetyShmPath)) await fs.promises.copyFile(safetyShmPath, activeDbShm)
    
    // Re-init old DatabaseManager
    dbManager.init()

    // Cleanup safety copy since we restored from it
    if (fs.existsSync(safetyBackupPath)) await fs.promises.unlink(safetyBackupPath)
    if (fs.existsSync(safetyWalPath)) await fs.promises.unlink(safetyWalPath)
    if (fs.existsSync(safetyShmPath)) await fs.promises.unlink(safetyShmPath)

    throw new Error('Restore gagal, rollback telah dilakukan: ' + err.message)
  }
}
