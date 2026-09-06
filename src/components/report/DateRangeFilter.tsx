import { useState, useEffect } from 'react'

export interface DateRangeFilterProps {
  initialStartDate: string | null
  initialEndDate: string | null
  onFilter: (startDate: string | null, endDate: string | null) => void
}

export function DateRangeFilter({ initialStartDate, initialEndDate, onFilter }: DateRangeFilterProps) {
  const [startDate, setStartDate] = useState(initialStartDate || '')
  const [endDate, setEndDate] = useState(initialEndDate || '')
  const [error, setError] = useState<string | null>(null)

  // Sync state if props change externally
  useEffect(() => {
    setStartDate(initialStartDate || '')
    setEndDate(initialEndDate || '')
  }, [initialStartDate, initialEndDate])

  const handleApply = () => {
    setError(null)
    
    if (!startDate && !endDate) {
      onFilter(null, null)
      return
    }

    if (!startDate || !endDate) {
      setError('Harap isi kedua tanggal')
      return
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('Tanggal mulai tidak boleh lebih dari tanggal akhir')
      return
    }

    onFilter(startDate, endDate)
  }

  const setPreset = (preset: 'this_month' | 'last_3_months' | 'this_year' | 'all_time') => {
    if (preset === 'all_time') {
      setStartDate('')
      setEndDate('')
      setError(null)
      onFilter(null, null)
      return
    }

    const now = new Date()
    const format = (d: Date) => d.toISOString().split('T')[0]
    
    let start: Date
    let end: Date

    if (preset === 'this_month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    } else if (preset === 'last_3_months') {
      start = new Date(now.getFullYear(), now.getMonth() - 2, 1)
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    } else { // this_year
      start = new Date(now.getFullYear(), 0, 1)
      end = new Date(now.getFullYear(), 11, 31)
    }

    const sDate = format(start)
    const eDate = format(end)
    setStartDate(sDate)
    setEndDate(eDate)
    setError(null)
    onFilter(sDate, eDate)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2 rounded-lg bg-surface border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-[14px] text-on-surface"
          />
          <span className="text-on-surface-variant font-medium text-[14px]">s/d</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2 rounded-lg bg-surface border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-[14px] text-on-surface"
          />
        </div>
        
        <button
          onClick={handleApply}
          className="px-4 py-2 bg-primary text-on-primary rounded-lg font-semibold text-[14px] hover:bg-primary/90 transition-colors shadow-sm"
        >
          Terapkan
        </button>

        <div className="hidden xl:flex items-center gap-2 ml-auto">
          <button onClick={() => setPreset('this_month')} className="px-3 py-1.5 text-[12px] font-medium rounded-md bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors border border-outline-variant/30">Bulan Ini</button>
          <button onClick={() => setPreset('last_3_months')} className="px-3 py-1.5 text-[12px] font-medium rounded-md bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors border border-outline-variant/30">3 Bulan</button>
          <button onClick={() => setPreset('this_year')} className="px-3 py-1.5 text-[12px] font-medium rounded-md bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors border border-outline-variant/30">Tahun Ini</button>
          <button onClick={() => setPreset('all_time')} className="px-3 py-1.5 text-[12px] font-medium rounded-md bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors border border-outline-variant/30">Semua Waktu</button>
        </div>
      </div>

      {error && (
        <span className="text-[13px] text-error font-medium flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">error</span>
          {error}
        </span>
      )}
    </div>
  )
}
