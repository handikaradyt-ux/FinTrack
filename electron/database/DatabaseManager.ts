import Database from 'better-sqlite3'
import path from 'node:path'
import { app } from 'electron'
import { initializeSchema } from './schema/schema.js'

export class DatabaseManager {
  private static instance: DatabaseManager
  private db: Database.Database | null = null

  private constructor() {}

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager()
    }
    return DatabaseManager.instance
  }

  public init(): void {
    if (this.db) {
      console.warn('Database is already initialized')
      return
    }

    try {
      const userDataPath = app.getPath('userData')
      const dbPath = path.join(userDataPath, 'fintrack.db')
      console.log(`Initializing database at: ${dbPath}`)

      // Open connection
      this.db = new Database(dbPath)

      // Enable foreign keys
      this.db.pragma('foreign_keys = ON')
      
      // Initialize Schema
      console.log('Initializing database schema...')
      initializeSchema(this.db)
      
      console.log('Database connected and schema initialized successfully')
    } catch (error) {
      console.error('Failed to initialize database:', error)
      // Do not throw to prevent hard crash, but log appropriately
    }
  }

  public getDatabase(): Database.Database {
    if (!this.db) {
      throw new Error('Database is not initialized. Call init() first.')
    }
    return this.db
  }

  public close(): void {
    if (this.db) {
      console.log('Closing database connection')
      this.db.close()
      this.db = null
    }
  }
}
