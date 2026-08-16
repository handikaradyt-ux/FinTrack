import { useState } from 'react'

// ============================================================
// SESSION 4 — CRUD Test Page (temporary)
// Tests the full React → window.api → IPC → Service → SQLite chain
// ============================================================

type Log = { ok: boolean; label: string; detail: string }

function App() {
  const [logs, setLogs] = useState<Log[]>([])
  const [running, setRunning] = useState(false)

  function addLog(ok: boolean, label: string, detail: unknown) {
    setLogs(prev => [
      ...prev,
      { ok, label, detail: typeof detail === 'string' ? detail : JSON.stringify(detail, null, 2) },
    ])
  }

  async function runTests() {
    setLogs([])
    setRunning(true)

    // ---- 0. Regression: getVersion ----------------------------
    const version = await window.api.getVersion()
    addLog(typeof version === 'string', 'getVersion()', version)

    // ================================================================
    // CATEGORY TESTS
    // ================================================================

    // C-1: Create income category
    const c1 = await window.api.category.create({ name: 'Test Salary', type: 'income' })
    addLog(c1.success, 'category.create (income)', c1)
    const catIncomeId: number = c1.success ? c1.data.id : -1

    // C-2: Create expense category
    const c2 = await window.api.category.create({ name: 'Test Food', type: 'expense' })
    addLog(c2.success, 'category.create (expense)', c2)
    const catExpenseId: number = c2.success ? c2.data.id : -1

    // C-3: Duplicate detection
    const c3 = await window.api.category.create({ name: 'Test Salary', type: 'income' })
    addLog(!c3.success, 'category.create duplicate → should FAIL', c3)

    // C-4: getAll
    const c4 = await window.api.category.getAll()
    addLog(c4.success, 'category.getAll()', c4)

    // C-5: getAll filtered by type
    const c5 = await window.api.category.getAll('income')
    addLog(c5.success, 'category.getAll(income)', c5)

    // C-6: Update
    const c6 = await window.api.category.update(catIncomeId, { name: 'Test Salary Updated' })
    addLog(c6.success, 'category.update', c6)

    // ================================================================
    // TRANSACTION TESTS
    // ================================================================

    const today = new Date().toISOString().split('T')[0]

    // T-1: Create income transaction
    const t1 = await window.api.transaction.create({
      type: 'income',
      amount: 5000000,
      category_id: catIncomeId,
      description: 'Test income',
      transaction_date: today,
    })
    addLog(t1.success, 'transaction.create (income)', t1)
    const txId: number = t1.success ? t1.data.id : -1

    // T-2: Create expense transaction
    const t2 = await window.api.transaction.create({
      type: 'expense',
      amount: 50000,
      category_id: catExpenseId,
      description: 'Test food',
      transaction_date: today,
    })
    addLog(t2.success, 'transaction.create (expense)', t2)
    const txExpenseId: number = t2.success ? t2.data.id : -1

    // T-3: Type mismatch — income tx with expense category → FAIL
    const t3 = await window.api.transaction.create({
      type: 'income',
      amount: 100,
      category_id: catExpenseId,
      transaction_date: today,
    })
    addLog(!t3.success, 'transaction.create type mismatch → should FAIL', t3)

    // T-4: Negative amount → FAIL
    const t4 = await window.api.transaction.create({
      type: 'income',
      amount: -100,
      category_id: catIncomeId,
      transaction_date: today,
    })
    addLog(!t4.success, 'transaction.create negative amount → should FAIL', t4)

    // T-5: Invalid category_id → FAIL
    const t5 = await window.api.transaction.create({
      type: 'income',
      amount: 100,
      category_id: 999999,
      transaction_date: today,
    })
    addLog(!t5.success, 'transaction.create unknown category → should FAIL', t5)

    // T-6: getAll
    const t6 = await window.api.transaction.getAll()
    addLog(t6.success, 'transaction.getAll()', t6)

    // T-7: getById
    const t7 = await window.api.transaction.getById(txId)
    addLog(t7.success, 'transaction.getById', t7)

    // T-8: getById unknown → FAIL
    const t8 = await window.api.transaction.getById(999999)
    addLog(!t8.success, 'transaction.getById unknown → should FAIL', t8)

    // T-9: Update
    const t9 = await window.api.transaction.update(txId, { amount: 6000000 })
    addLog(t9.success, 'transaction.update', t9)

    // T-10: Delete expense tx
    const t10 = await window.api.transaction.delete(txExpenseId)
    addLog(t10.success, 'transaction.delete', t10)

    // ================================================================
    // BUDGET TESTS
    // ================================================================

    // B-1: Create budget
    const b1 = await window.api.budget.create({
      category_id: catExpenseId,
      amount: 1000000,
      month: 8,
      year: 2026,
    })
    addLog(b1.success, 'budget.create', b1)
    const budgetId: number = b1.success ? b1.data.id : -1

    // B-2: Duplicate budget → FAIL
    const b2 = await window.api.budget.create({
      category_id: catExpenseId,
      amount: 500000,
      month: 8,
      year: 2026,
    })
    addLog(!b2.success, 'budget.create duplicate → should FAIL', b2)

    // B-3: Month out of range → FAIL
    const b3 = await window.api.budget.create({
      category_id: catExpenseId,
      amount: 100000,
      month: 13,
      year: 2026,
    })
    addLog(!b3.success, 'budget.create month=13 → should FAIL', b3)

    // B-4: Negative amount → FAIL
    const b4 = await window.api.budget.create({
      category_id: catExpenseId,
      amount: -1,
      month: 9,
      year: 2026,
    })
    addLog(!b4.success, 'budget.create negative amount → should FAIL', b4)

    // B-5: get all
    const b5 = await window.api.budget.get()
    addLog(b5.success, 'budget.get()', b5)

    // B-6: get filtered by month/year
    const b6 = await window.api.budget.get(8, 2026)
    addLog(b6.success, 'budget.get(8, 2026)', b6)

    // B-7: Update budget
    const b7 = await window.api.budget.update(budgetId, { amount: 1500000 })
    addLog(b7.success, 'budget.update', b7)

    // ================================================================
    // CLEANUP — delete category-blocked test (FK constraint)
    // ================================================================

    // Attempt to delete income category while transaction still exists → FAIL
    const cleanup1 = await window.api.category.delete(catIncomeId)
    addLog(!cleanup1.success, 'category.delete (in use) → should FAIL', cleanup1)

    // Delete remaining income transaction first, then delete category
    const cleanup2 = await window.api.transaction.delete(txId)
    addLog(cleanup2.success, 'cleanup: delete income transaction', cleanup2)

    // Now category should be deletable
    const cleanup3 = await window.api.category.delete(catIncomeId)
    addLog(cleanup3.success, 'cleanup: category.delete (now free)', cleanup3)

    // Delete budget
    const cleanup4 = await window.api.budget.delete(budgetId)
    addLog(cleanup4.success, 'cleanup: budget.delete', cleanup4)

    // Delete expense category (budget deleted, no transactions)
    const cleanup5 = await window.api.category.delete(catExpenseId)
    addLog(cleanup5.success, 'cleanup: expense category.delete', cleanup5)

    setRunning(false)
  }

  const passed = logs.filter(l => l.ok).length
  const failed = logs.filter(l => !l.ok).length

  return (
    <div style={{ fontFamily: 'monospace', padding: 24, background: '#0f0f0f', minHeight: '100vh', color: '#e5e5e5' }}>
      <h1 style={{ fontSize: 20, marginBottom: 8, color: '#60a5fa' }}>FinTrack — Session 4 IPC/CRUD Test</h1>
      <button
        onClick={runTests}
        disabled={running}
        style={{
          padding: '8px 20px', background: running ? '#555' : '#2563eb',
          color: '#fff', border: 'none', borderRadius: 6, cursor: running ? 'not-allowed' : 'pointer',
          marginBottom: 16,
        }}
      >
        {running ? 'Running…' : 'Run All Tests'}
      </button>

      {logs.length > 0 && (
        <div style={{ marginBottom: 12, fontSize: 14 }}>
          <span style={{ color: '#22c55e' }}>✓ {passed} passed</span>
          {'  '}
          <span style={{ color: failed > 0 ? '#ef4444' : '#555' }}>✗ {failed} failed</span>
        </div>
      )}

      {logs.map((l, i) => (
        <div key={i} style={{
          marginBottom: 6, padding: '6px 10px',
          background: l.ok ? '#052e16' : '#450a0a',
          borderLeft: `3px solid ${l.ok ? '#22c55e' : '#ef4444'}`,
          borderRadius: 4,
        }}>
          <div style={{ fontSize: 13, fontWeight: 'bold', color: l.ok ? '#86efac' : '#fca5a5' }}>
            {l.ok ? '✓' : '✗'} {l.label}
          </div>
          <pre style={{ fontSize: 11, margin: 0, color: '#a3a3a3', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {l.detail}
          </pre>
        </div>
      ))}
    </div>
  )
}

export default App