import { ZodError } from 'zod'
import type { IpcResult } from '../../src/types/models.js'

export function ok<T>(data: T): IpcResult<T> {
  return { success: true as const, data }
}

export function fail(error: unknown): IpcResult<never> {
  if (error instanceof ZodError) {
    return {
      success: false as const,
      error: { code: 'VALIDATION_ERROR', message: 'Data yang dimasukkan tidak valid.' }
    }
  }

  if (error instanceof Error) {
    const errObj = error as Error & { code?: string }
    
    // Check for SQLite errors explicitly via error code or message
    if (
      errObj.code?.startsWith('SQLITE_') ||
      errObj.message.includes('SQLITE_CONSTRAINT') ||
      errObj.message.includes('UNIQUE constraint failed') ||
      errObj.message.includes('SQLite')
    ) {
      console.error('[Database Error]', errObj.message)
      return {
        success: false as const,
        error: { code: 'DATABASE_ERROR', message: 'Terjadi kesalahan sistem basis data. Operasi tidak dapat dilanjutkan.' }
      }
    }

    // Preserve known business logic error
    if (errObj.code) {
      return {
        success: false as const,
        error: { code: errObj.code, message: errObj.message }
      }
    }

    // Standard fallback for other Errors
    return {
      success: false as const,
      error: { code: 'SYSTEM_ERROR', message: errObj.message }
    }
  }

  return {
    success: false as const,
    error: { code: 'UNKNOWN_ERROR', message: String(error) }
  }
}
