import { DatabaseManager } from '../electron/database/DatabaseManager.js'
import * as transactionService from '../electron/services/transactionService.js'
import * as categoryService from '../electron/services/categoryService.js'
import * as budgetService from '../electron/services/budgetService.js'

async function runTests() {
  const dbManager = DatabaseManager.getInstance()
  dbManager.init()
  const db = dbManager.getDatabase()

  console.log('--- BEGIN MANUAL BYPASS TEST ---')

  let passCount = 0
  let failCount = 0

  function assertThrow(name: string, fn: () => void, expectedCode: string) {
    try {
      fn()
      console.log(`[FAIL] ${name} did not throw`)
      failCount++
    } catch (err: any) {
      // Zod throws ZodError without a code property on the root object, so we catch ZodError or check issues
      // But we wrapped it in service? No, service doesn't catch it, ipcHandler catches it.
      // Service just lets ZodError bubble up.
      if (err.name === 'ZodError') {
        if (expectedCode === 'VALIDATION_ERROR') {
          console.log(`[PASS] ${name} threw ZodError (VALIDATION_ERROR)`)
          passCount++
        } else {
          console.log(`[FAIL] ${name} threw ZodError instead of ${expectedCode}`)
          failCount++
        }
      } else if (err.code === expectedCode) {
        console.log(`[PASS] ${name} threw ${expectedCode}`)
        passCount++
      } else {
        console.log(`[FAIL] ${name} threw wrong error: ${err.code} / ${err.message}`)
        failCount++
      }
    }
  }

  // Bypass 1: transaction amount < 0
  assertThrow('Transaction amount < 0', () => {
    transactionService.createTransaction(db, { type: 'expense', amount: -500, category_id: 1, transaction_date: '2023-01-01' })
  }, 'VALIDATION_ERROR')

  // Bypass 2: category name empty
  assertThrow('Category name empty', () => {
    categoryService.createCategory(db, { name: '', type: 'expense' })
  }, 'VALIDATION_ERROR')

  // Bypass 3: budget month 13
  assertThrow('Budget month 13', () => {
    budgetService.createBudget(db, { category_id: 1, amount: 1000, month: 13, year: 2023 })
  }, 'VALIDATION_ERROR')

  console.log('--- BEGIN BUSINESS RULE TEST ---')

  // Prepare data
  const testCat1 = categoryService.createCategory(db, { name: 'TestCat' + Date.now(), type: 'expense' })
  const testCatIncome = categoryService.createCategory(db, { name: 'TestCatInc' + Date.now(), type: 'income' })

  // Business 1: Duplicate category
  assertThrow('Duplicate category', () => {
    categoryService.createCategory(db, { name: testCat1.name, type: 'expense' })
  }, 'DUPLICATE_ERROR')

  // Business 2: Transaction category/type mismatch
  assertThrow('Transaction category/type mismatch', () => {
    transactionService.createTransaction(db, { type: 'income', amount: 100, category_id: testCat1.id, transaction_date: '2023-01-01' })
  }, 'TYPE_MISMATCH')

  // Business 3: Delete category in use
  const testTx = transactionService.createTransaction(db, { type: 'expense', amount: 100, category_id: testCat1.id, transaction_date: '2023-01-01' })
  assertThrow('Delete category in use', () => {
    categoryService.deleteCategory(db, testCat1.id)
  }, 'CONSTRAINT_ERROR')

  // Business 4: Income category for budget
  assertThrow('Income category for budget', () => {
    budgetService.createBudget(db, { category_id: testCatIncome.id, amount: 1000, month: 1, year: 2023 })
  }, 'VALIDATION_ERROR')

  // Business 5: Duplicate budget period
  const testBudget = budgetService.createBudget(db, { category_id: testCat1.id, amount: 1000, month: 2, year: 2023 })
  assertThrow('Duplicate budget period', () => {
    budgetService.createBudget(db, { category_id: testCat1.id, amount: 2000, month: 2, year: 2023 })
  }, 'DUPLICATE_ERROR')

  console.log(`TEST RESULTS: ${passCount} PASS, ${failCount} FAIL`)
}

runTests().catch(console.error)
