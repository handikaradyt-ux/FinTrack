import { app, BrowserWindow, ipcMain, session } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { IPC_CHANNELS } from './ipcChannels.cjs'
import { DatabaseManager } from './database/DatabaseManager.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

ipcMain.handle(IPC_CHANNELS.APP_GET_VERSION, () => {
  return app.getVersion()
})

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,

    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  mainWindow.loadURL('http://localhost:5173')
}

app.whenReady().then(() => {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    // Basic strict CSP
    let csp = "default-src 'none'; " +
              "script-src 'self'; " +
              "style-src 'self' 'unsafe-inline'; " +
              "img-src 'self' data:; " +
              "font-src 'self' data:; " +
              "base-uri 'none'; " +
              "form-action 'none'; " +
              "frame-ancestors 'none';";

    // In development, we need to allow localhost for Vite
    if (!app.isPackaged) {
      csp = "default-src 'none'; " +
            // 'unsafe-inline' is required in dev for Vite React plugin's preamble script
            "script-src 'self' 'unsafe-inline' http://localhost:5173; " +
            "style-src 'self' 'unsafe-inline' http://localhost:5173; " +
            "connect-src 'self' http://localhost:5173 ws://localhost:5173; " +
            "img-src 'self' data: http://localhost:5173; " +
            "font-src 'self' data: http://localhost:5173; " +
            "base-uri 'none'; " +
            "form-action 'none'; " +
            "frame-ancestors 'none';";
    }

    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [csp]
      }
    })
  })

  // Initialize Database Manager
  const dbManager = DatabaseManager.getInstance()
  dbManager.init()

  // Development Database Verification
  try {
    const db = dbManager.getDatabase()
    const result = db.prepare('SELECT 1 AS result;').get() as { result: number }
    console.log(`[Database Test] SELECT 1 AS result =>`, result.result)
    
    const fkResult = db.pragma('foreign_keys', { simple: true })
    console.log(`[Database Test] PRAGMA foreign_keys =>`, fkResult)

    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all()
    console.log(`[Database Test] Tables in database =>`, tables)
  } catch (error) {
    console.error('[Database Test] Failed:', error)
  }

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('will-quit', () => {
  DatabaseManager.getInstance().close()
})