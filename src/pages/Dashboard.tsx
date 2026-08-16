import { useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { useDashboardStore } from '../stores/dashboardStore'
import type { BudgetOverviewItem, RecentTransaction } from '../types/models'

// ============================================================
// Helpers
// ============================================================

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('IDR', 'Rp').trim()
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

// ============================================================
// Sub-components
// ============================================================

function LoadingState() {
  return (
    <div className="flex flex-col w-full gap-8 animate-pulse">
      <div className="h-10 w-48 bg-surface-container-high rounded-xl"></div>
      <div className="grid grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-[140px] bg-surface-container-high rounded-2xl"></div>
        ))}
      </div>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8 h-[400px] bg-surface-container-high rounded-2xl"></div>
        <div className="col-span-4 h-[400px] bg-surface-container-high rounded-2xl"></div>
      </div>
    </div>
  )
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="w-full px-4 py-3 rounded-lg bg-error-container text-on-error-container text-[14px] font-medium flex items-center gap-2">
      <span className="material-symbols-outlined text-[18px]">error</span>
      <span>Gagal memuat sebagian data: {message}</span>
    </div>
  )
}

function EmptyTransactions() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-on-surface-variant">
      <span className="material-symbols-outlined text-[48px] mb-3 opacity-30">receipt_long</span>
      <p className="text-[14px] font-medium">Belum ada transaksi</p>
    </div>
  )
}

function EmptyChart() {
  return (
    <div className="flex flex-col items-center justify-center h-[220px] text-on-surface-variant">
      <span className="material-symbols-outlined text-[48px] mb-3 opacity-30">bar_chart</span>
      <p className="text-[14px] font-medium">Belum ada data</p>
    </div>
  )
}

function EmptyBudget() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-on-surface-variant">
      <span className="material-symbols-outlined text-[40px] mb-2 opacity-30">savings</span>
      <p className="text-[13px] font-medium">Belum ada anggaran bulan ini</p>
    </div>
  )
}

// Custom Recharts tooltip
function ChartTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="bg-inverse-surface text-inverse-on-surface text-[12px] font-medium px-3 py-2 rounded-lg shadow-lg">
      <p className="mb-1 opacity-70">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {formatRupiah(p.value)}
        </p>
      ))}
    </div>
  )
}

// ============================================================
// Budget bar with icon mapping
// ============================================================

const BUDGET_ICONS: Record<string, string> = {
  makanan: 'restaurant',
  food: 'restaurant',
  transportasi: 'directions_car',
  transport: 'directions_car',
  hiburan: 'movie',
  entertainment: 'movie',
  utilitas: 'bolt',
  utilities: 'bolt',
  belanja: 'shopping_bag',
  kesehatan: 'health_and_safety',
  pendidikan: 'school',
  tabungan: 'savings',
}

function getBudgetIcon(name: string): string {
  return BUDGET_ICONS[name.toLowerCase()] ?? 'category'
}

function BudgetBar({ item }: { item: BudgetOverviewItem }) {
  const pct = Math.min(item.percentage, 100)
  const barColor = item.is_over ? 'bg-error' : item.percentage >= 80 ? 'bg-tertiary' : 'bg-primary'
  const icon = getBudgetIcon(item.category_name)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`material-symbols-outlined text-[18px] ${item.is_over ? 'text-error' : 'text-primary'}`}>
            {icon}
          </span>
          <span className="text-[14px] font-semibold text-on-surface">{item.category_name}</span>
        </div>
        <span className={`text-[13px] font-medium tabular-nums ${item.is_over ? 'text-error' : 'text-on-surface-variant'}`}>
          {formatRupiah(item.spent_amount)} / {formatRupiah(item.budget_amount)}
        </span>
      </div>
      <div className="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden">
        <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${pct}%` }}></div>
      </div>
      {item.is_over && (
        <span className="text-[12px] font-medium text-error mt-0.5">Melebihi anggaran!</span>
      )}
    </div>
  )
}

// ============================================================
// Transaction row
// ============================================================

function TransactionRow({ tx, striped }: { tx: RecentTransaction; striped: boolean }) {
  const isIncome = tx.type === 'income'
  const amountStr = isIncome
    ? `+${formatRupiah(tx.amount)}`
    : `-${formatRupiah(tx.amount)}`

  return (
    <div className={`flex items-center py-3.5 px-4 hover:bg-surface-container-lowest transition-colors border-b border-outline-variant/10 ${striped ? 'bg-surface-container-low/20' : ''}`}>
      <div className="w-[15%] text-[14px] text-on-surface-variant">{formatDate(tx.transaction_date)}</div>
      <div className="w-[30%] text-[15px] font-semibold text-on-surface truncate pr-4">
        {tx.description ?? '(tanpa deskripsi)'}
      </div>
      <div className="w-[20%]">
        {tx.category_name ? (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-medium ${isIncome ? 'bg-primary-container/40 text-on-primary-container border border-primary-container' : 'bg-error-container/30 text-on-error-container border border-error-container/50'}`}>
            {tx.category_name}
          </span>
        ) : (
          <span className="text-[12px] text-on-surface-variant">—</span>
        )}
      </div>
      <div className="w-[15%] text-[14px] text-on-surface-variant">
        {isIncome ? 'Pemasukan' : 'Pengeluaran'}
      </div>
      <div className={`w-[20%] text-[15px] font-semibold text-right tabular-nums ${isIncome ? 'text-primary' : 'text-on-surface'}`}>
        {amountStr}
      </div>
    </div>
  )
}

// ============================================================
// Main Dashboard Component
// ============================================================

export function Dashboard() {
  const { summary, recentTransactions, chartData, budgetOverview, loading, error, fetchDashboardData } = useDashboardStore()

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  if (loading) return <LoadingState />

  return (
    <div className="flex flex-col w-full gap-8 max-w-[1400px]">
      {/* Error Banner */}
      {error && <ErrorBanner message={error} />}

      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-[40px] font-bold tracking-tight text-on-background leading-tight">Dashboard</h1>
        <p className="text-[16px] text-on-surface-variant">Ringkasan kondisi keuangan Anda</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Saldo */}
        <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-6 flex flex-col gap-6 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between z-10">
            <span className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">Total Saldo</span>
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[20px]">account_balance_wallet</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 z-10">
            <span className="text-[32px] font-semibold text-on-surface tabular-nums">{formatRupiah(summary.totalBalance)}</span>
            <div className={`flex items-center gap-1 ${summary.totalBalance >= 0 ? 'text-primary' : 'text-error'}`}>
              <span className="material-symbols-outlined text-[16px]">{summary.totalBalance >= 0 ? 'trending_up' : 'trending_down'}</span>
              <span className="text-[12px] font-medium">Saldo keseluruhan</span>
            </div>
          </div>
        </div>

        {/* Pemasukan */}
        <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-6 flex flex-col gap-6 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between z-10">
            <span className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">Pemasukan (Bulan Ini)</span>
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary-container text-[20px]">arrow_downward</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 z-10">
            <span className="text-[32px] font-semibold text-on-surface tabular-nums">{formatRupiah(summary.monthlyIncome)}</span>
            <div className="flex items-center gap-1 text-primary">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span className="text-[12px] font-medium">Bulan ini</span>
            </div>
          </div>
        </div>

        {/* Pengeluaran */}
        <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-6 flex flex-col gap-6 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between z-10">
            <span className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">Pengeluaran (Bulan Ini)</span>
            <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-error-container text-[20px]">arrow_upward</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 z-10">
            <span className="text-[32px] font-semibold text-on-surface tabular-nums">{formatRupiah(summary.monthlyExpense)}</span>
            <div className="flex items-center gap-1 text-error">
              <span className="material-symbols-outlined text-[16px]">trending_up</span>
              <span className="text-[12px] font-medium">Bulan ini</span>
            </div>
          </div>
        </div>

        {/* Sisa Anggaran */}
        <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-6 flex flex-col gap-6 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between z-10">
            <span className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider">Sisa Anggaran</span>
            <div className="w-10 h-10 rounded-full bg-tertiary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-tertiary-container text-[20px]">savings</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 z-10">
            <span className={`text-[32px] font-semibold tabular-nums ${summary.remainingBudget < 0 ? 'text-error' : 'text-on-surface'}`}>
              {formatRupiah(summary.remainingBudget)}
            </span>
            {summary.totalBudget > 0 ? (
              <div className={`flex items-center gap-1 ${summary.remainingBudget < 0 ? 'text-error' : 'text-tertiary'}`}>
                <span className="material-symbols-outlined text-[16px]">{summary.remainingBudget < 0 ? 'warning' : 'info'}</span>
                <span className="text-[12px] font-medium">
                  {summary.totalBudget > 0
                    ? `${Math.round((summary.monthlyExpense / summary.totalBudget) * 100)}% terpakai`
                    : '—'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px]">info</span>
                <span className="text-[12px] font-medium">Belum ada anggaran</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Middle Section: Chart & Budget */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Arus Kas Chart */}
        <div className="lg:col-span-8 bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-semibold text-on-surface">Arus Kas</h2>
            <div className="flex items-center bg-surface-container-low rounded-lg p-1 border border-outline-variant/20">
              <span className="px-4 py-1.5 rounded-md text-[13px] font-medium text-on-surface bg-surface shadow-sm">Bulan</span>
            </div>
          </div>

          {chartData.length === 0 ? (
            <EmptyChart />
          ) : (
            <div className="h-[260px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barGap={4} barCategoryGap="35%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#dee8ff" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#3c4a42', fontWeight: 500 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(d: string) => {
                      try { return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) }
                      catch { return d }
                    }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#3c4a42', fontWeight: 500 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => `${(v / 1_000_000).toFixed(1)}M`}
                    width={48}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    formatter={(value) => (
                      <span style={{ fontSize: 13, color: '#3c4a42', fontWeight: 500 }}>
                        {value === 'income' ? 'Pemasukan' : 'Pengeluaran'}
                      </span>
                    )}
                  />
                  <Bar dataKey="income" name="income" fill="#006c49" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="expense" fill="#ba1a1a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Anggaran Bulan Ini */}
        <div className="lg:col-span-4 bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-6 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-semibold text-on-surface">Anggaran Bulan Ini</h2>
            <button className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant transition-colors">
              <span className="material-symbols-outlined text-[20px]">more_vert</span>
            </button>
          </div>

          {budgetOverview.length === 0 ? (
            <EmptyBudget />
          ) : (
            <div className="flex flex-col gap-5 flex-1">
              {budgetOverview.map((item) => (
                <BudgetBar key={item.budget_id} item={item} />
              ))}
            </div>
          )}

          <button className="mt-2 w-full py-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface font-semibold text-[14px] transition-colors border border-outline-variant/30">
            Kelola Anggaran
          </button>
        </div>
      </div>

      {/* Transaksi Terbaru Table */}
      <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[20px] font-semibold text-on-surface">Transaksi Terbaru</h2>
          <button className="px-4 py-2 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface font-medium text-[13px] border border-outline-variant/30 transition-colors">
            Lihat Semua
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <EmptyTransactions />
        ) : (
          <div className="w-full overflow-x-auto">
            <div className="min-w-[800px] flex flex-col">
              {/* Header */}
              <div className="flex items-center bg-surface-container-low/50 py-3 px-4 rounded-t-lg border-b border-outline-variant/20">
                <div className="w-[15%] text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Tanggal</div>
                <div className="w-[30%] text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Deskripsi</div>
                <div className="w-[20%] text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Kategori</div>
                <div className="w-[15%] text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">Tipe</div>
                <div className="w-[20%] text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider text-right">Jumlah</div>
              </div>
              {/* Rows */}
              <div className="flex flex-col">
                {recentTransactions.map((tx, idx) => (
                  <TransactionRow key={tx.id} tx={tx} striped={idx % 2 === 1} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
