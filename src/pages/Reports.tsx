import { useEffect, useState } from 'react'
import { useReportStore } from '../stores/reportStore'
import { useToastStore } from '../stores/toastStore'
import { DateRangeFilter } from '../components/report/DateRangeFilter'
import { CategoryPieChart } from '../components/report/CategoryPieChart'
import { TrendChart } from '../components/report/TrendChart'
import { useSettingsStore } from '../stores/settingsStore'
import { formatCurrency } from '../utils/formatCurrency'

function SummaryCard({ title, amount, icon, type }: { title: string, amount: number, icon: string, type: 'income' | 'expense' | 'balance' }) {
  const { settings } = useSettingsStore()
  const isNegative = amount < 0

  let colorClass = 'text-on-surface'
  let iconClass = 'bg-surface-container-highest text-on-surface'
  
  if (type === 'income' || (type === 'balance' && amount > 0)) {
    colorClass = 'text-primary'
    iconClass = 'bg-primary-container text-on-primary-container'
  } else if (type === 'expense' || (type === 'balance' && amount < 0)) {
    colorClass = 'text-error'
    iconClass = 'bg-error-container text-on-error-container'
  }

  return (
    <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconClass}`}>
        <span className="material-symbols-outlined text-[24px]">{icon}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-[14px] font-medium text-on-surface-variant mb-1">{title}</span>
        <span className={`text-[20px] font-bold ${colorClass}`}>
          {isNegative ? '-' : ''}{formatCurrency(Math.abs(amount), settings.currency)}
        </span>
      </div>
    </div>
  )
}

export function Reports() {
  const { 
    dateRange,
    summary,
    expenseByCategory,
    trend,
    loading,
    error,
    setDateRange,
    fetchReportData
  } = useReportStore()

  useEffect(() => {
    fetchReportData()
  }, [fetchReportData])

  const [isExporting, setIsExporting] = useState(false)
  const { addToast } = useToastStore()

  const handleExport = async (format: 'csv' | 'pdf') => {
    if (!summary || (summary.totalIncome === 0 && summary.totalExpense === 0)) {
      addToast('info', 'Tidak ada data untuk diekspor.')
      return
    }

    setIsExporting(true)
    try {
      const filters = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      }
      
      const res = format === 'csv' 
        ? await window.api.export.csv(filters)
        : await window.api.export.pdf(filters)

      if (res.success) {
        if (!res.data.cancelled) {
          addToast('success', `${format.toUpperCase()} berhasil diekspor.`)
        } else {
          addToast('info', 'Ekspor dibatalkan.')
        }
      } else {
        addToast('error', res.error.message || 'Gagal mengekspor file.')
      }
    } catch (e: any) {
      addToast('error', 'Terjadi kesalahan sistem saat ekspor.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex flex-col w-full gap-8 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[40px] font-bold tracking-tight text-on-background leading-tight">Laporan</h1>
          <p className="text-[16px] text-on-surface-variant">Analisis kondisi keuangan berdasarkan periode</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExport('csv')}
            disabled={isExporting || loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold text-[14px] transition-colors shadow-sm disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">description</span>
            CSV
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={isExporting || loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold text-[14px] transition-colors shadow-sm disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            PDF
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <DateRangeFilter
          initialStartDate={dateRange.startDate}
          initialEndDate={dateRange.endDate}
          onFilter={(start, end) => {
            if (start && end) {
              setDateRange(start, end)
            }
          }}
        />
      </div>

      {/* Error Banner */}
      {error && (
        <div className="w-full px-4 py-3 rounded-lg bg-error-container text-on-error-container text-[14px] font-medium flex items-center justify-between gap-2 shadow-sm border border-error-container/20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
          <button onClick={fetchReportData} className="px-3 py-1.5 bg-error-container hover:bg-error/20 text-on-error-container rounded-md font-semibold text-[13px] transition-colors border border-on-error-container/20 shrink-0">
            Coba Lagi
          </button>
        </div>
      )}

      {/* Content */}
      <div className={`flex flex-col gap-8 transition-opacity duration-200 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SummaryCard 
            title="Total Pemasukan" 
            amount={summary?.totalIncome ?? 0} 
            icon="arrow_downward" 
            type="income" 
          />
          <SummaryCard 
            title="Total Pengeluaran" 
            amount={summary?.totalExpense ?? 0} 
            icon="arrow_upward" 
            type="expense" 
          />
          <SummaryCard 
            title="Saldo Bersih" 
            amount={summary?.balance ?? 0} 
            icon="account_balance_wallet" 
            type="balance" 
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h3 className="text-[18px] font-semibold text-on-background">Tren Pemasukan vs Pengeluaran</h3>
            <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-6">
              <TrendChart data={trend} />
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <h3 className="text-[18px] font-semibold text-on-background">Pengeluaran Berdasarkan Kategori</h3>
            <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-6">
              <CategoryPieChart data={expenseByCategory} />
            </div>
          </div>
        </div>
      </div>
      
    </div>
  )
}
