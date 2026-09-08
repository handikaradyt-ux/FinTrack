import { useEffect, useState, useMemo } from 'react'
import { useTransactionStore } from '../stores/transactionStore'
import { useSettingsStore } from '../stores/settingsStore'
import { useToastStore } from '../stores/toastStore'
import { formatCurrency } from '../utils/formatCurrency'
import { transactionSchema } from '../schemas/transactionSchema'
import type { Transaction, CreateTransactionPayload, UpdateTransactionPayload, Category, TransactionType } from '../types/models'
import { DateRangeFilter } from '../components/report/DateRangeFilter'

// ============================================================
// Formatters
// ============================================================

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
// Modals
// ============================================================

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  transaction?: Transaction | null
  categories: Category[]
  onSubmit: (payload: CreateTransactionPayload | UpdateTransactionPayload) => Promise<boolean>
}

function TransactionModal({ isOpen, onClose, transaction, categories, onSubmit }: TransactionModalProps) {
  const { settings } = useSettingsStore()
  const [type, setType] = useState<TransactionType>(transaction?.type ?? 'expense')
  const [amount, setAmount] = useState(transaction?.amount?.toString() ?? '')
  const [date, setDate] = useState(transaction?.transaction_date ?? new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState(transaction?.description ?? '')
  const [categoryId, setCategoryId] = useState(transaction?.category_id?.toString() ?? '')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when opened with new transaction
  useEffect(() => {
    if (isOpen) {
      setType(transaction?.type ?? 'expense')
      setAmount(transaction?.amount?.toString() ?? '')
      setDate(transaction?.transaction_date ?? new Date().toISOString().split('T')[0])
      setDescription(transaction?.description ?? '')
      setCategoryId(transaction?.category_id?.toString() ?? '')
      setFieldErrors({})
      setError(null)
    }
  }, [isOpen, transaction])

  const filteredCategories = useMemo(() => {
    return categories.filter(c => c.type === type)
  }, [categories, type])

  // Auto-select first category when type changes if current category is invalid
  useEffect(() => {
    if (isOpen && filteredCategories.length > 0) {
      const isCurrentValid = filteredCategories.some(c => c.id.toString() === categoryId)
      if (!isCurrentValid) {
        setCategoryId(filteredCategories[0].id.toString())
      }
    }
  }, [type, filteredCategories, isOpen, categoryId])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const payload = {
      type,
      amount,
      transaction_date: date,
      description: description || undefined,
      category_id: categoryId,
    }

    const validation = transactionSchema.safeParse(payload)
    if (!validation.success) {
      const errs: Record<string, string> = {}
      validation.error.issues.forEach((err: any) => {
        if (err.path[0]) {
          errs[err.path[0] as string] = err.message
        }
      })
      setFieldErrors(errs)
      return
    }

    setIsSubmitting(true)
    const success = await onSubmit(validation.data)
    setIsSubmitting(false)

    if (success) {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-surface w-full max-w-[28rem] rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30">
          <h2 className="text-[20px] font-semibold text-on-surface">
            {transaction ? 'Edit Transaksi' : 'Tambah Transaksi'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col p-6 gap-5">
          {error && (
            <div className="px-4 py-3 rounded-lg bg-error-container text-on-error-container text-[14px] font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-on-surface-variant">Tipe Transaksi</label>
            <div className="flex bg-surface-container-lowest rounded-lg p-1 border border-outline-variant/30">
              <button
                type="button"
                onClick={() => { setType('expense'); setFieldErrors(prev => ({ ...prev, type: '' })) }}
                className={`flex-1 py-2 text-[14px] font-medium rounded-md transition-colors ${type === 'expense' ? 'bg-error text-on-error shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
              >
                Pengeluaran
              </button>
              <button
                type="button"
                onClick={() => { setType('income'); setFieldErrors(prev => ({ ...prev, type: '' })) }}
                className={`flex-1 py-2 text-[14px] font-medium rounded-md transition-colors ${type === 'income' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
              >
                Pemasukan
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-on-surface-variant">Jumlah ({settings.currency})</label>
            <input
              type="number"
              value={amount}
              onChange={e => { setAmount(e.target.value); setFieldErrors(prev => ({ ...prev, amount: '' })) }}
              className={`w-full px-4 py-2.5 rounded-lg bg-surface border ${fieldErrors.amount ? 'border-error focus:ring-error' : 'border-outline-variant/50 focus:border-primary focus:ring-primary'} focus:ring-1 outline-none transition-all text-[15px] font-medium text-on-surface`}
              placeholder="0"
            />
            {fieldErrors.amount && <span className="text-[12px] font-medium text-error mt-0.5">{fieldErrors.amount}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-on-surface-variant">Tanggal</label>
              <input
                type="date"
                value={date}
                onChange={e => { setDate(e.target.value); setFieldErrors(prev => ({ ...prev, transaction_date: '' })) }}
                className={`w-full px-4 py-2.5 rounded-lg bg-surface border ${fieldErrors.transaction_date ? 'border-error focus:ring-error' : 'border-outline-variant/50 focus:border-primary focus:ring-primary'} focus:ring-1 outline-none transition-all text-[15px] text-on-surface`}
              />
              {fieldErrors.transaction_date && <span className="text-[12px] font-medium text-error mt-0.5">{fieldErrors.transaction_date}</span>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-on-surface-variant">Kategori</label>
              <select
                value={categoryId}
                onChange={e => { setCategoryId(e.target.value); setFieldErrors(prev => ({ ...prev, category_id: '' })) }}
                className={`w-full px-4 py-2.5 rounded-lg bg-surface border ${fieldErrors.category_id ? 'border-error focus:ring-error' : 'border-outline-variant/50 focus:border-primary focus:ring-primary'} focus:ring-1 outline-none transition-all text-[15px] text-on-surface appearance-none`}
              >
                {filteredCategories.length === 0 && <option value="" disabled>Belum ada kategori</option>}
                {filteredCategories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {fieldErrors.category_id && <span className="text-[12px] font-medium text-error mt-0.5">{fieldErrors.category_id}</span>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-on-surface-variant">Deskripsi (Opsional)</label>
            <input
              type="text"
              value={description}
              onChange={e => { setDescription(e.target.value); setFieldErrors(prev => ({ ...prev, description: '' })) }}
              className={`w-full px-4 py-2.5 rounded-lg bg-surface border ${fieldErrors.description ? 'border-error focus:ring-error' : 'border-outline-variant/50 focus:border-primary focus:ring-primary'} focus:ring-1 outline-none transition-all text-[15px] text-on-surface`}
              placeholder="Contoh: Makan siang"
            />
            {fieldErrors.description && <span className="text-[12px] font-medium text-error mt-0.5">{fieldErrors.description}</span>}
          </div>

          <div className="flex gap-3 mt-4 pt-4 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface font-semibold text-[14px] transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-on-primary font-semibold text-[14px] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteConfirmation({ isOpen, onClose, onConfirm, isDeleting }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, isDeleting: boolean }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-surface w-full max-w-[360px] rounded-2xl shadow-xl flex flex-col p-6 gap-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-error-container flex items-center justify-center text-error">
            <span className="material-symbols-outlined text-[24px]">delete</span>
          </div>
          <div>
            <h3 className="text-[18px] font-semibold text-on-surface">Hapus Transaksi</h3>
            <p className="text-[14px] text-on-surface-variant mt-1">
              Apakah Anda yakin ingin menghapus transaksi ini? Data yang dihapus tidak dapat dikembalikan.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface font-semibold text-[14px] transition-colors">
            Batal
          </button>
          <button onClick={onConfirm} disabled={isDeleting} className="flex-1 py-2.5 rounded-lg bg-error hover:bg-error/90 text-on-error font-semibold text-[14px] transition-colors disabled:opacity-50">
            {isDeleting ? 'Menghapus...' : 'Hapus'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Main Page
// ============================================================

export function Transactions() {
  const { settings } = useSettingsStore()
  const { 
    transactions, categories, loading, error, filters,
    fetchTransactions, fetchCategories, createTransaction, updateTransaction, deleteTransaction,
    setFilters, resetFilters
  } = useTransactionStore()
  
  const [searchInput, setSearchInput] = useState(filters.keyword)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 20

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [isExporting, setIsExporting] = useState(false)
  const { addToast } = useToastStore()

  // Fetch initial data
  useEffect(() => {
    fetchTransactions()
    fetchCategories()
  }, [fetchTransactions, fetchCategories])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (filters.keyword !== searchInput) {
        setFilters({ keyword: searchInput })
        setCurrentPage(1)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput, filters.keyword, setFilters])

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters.categoryId, filters.type, filters.startDate, filters.endDate, filters.sortBy, filters.sortDirection])

  // Filter Dropdown items based on selected type
  const filterCategories = useMemo(() => {
    if (!filters.type) return categories
    return categories.filter(c => c.type === filters.type)
  }, [categories, filters.type])

  const handleCreateOrUpdate = async (payload: CreateTransactionPayload | UpdateTransactionPayload) => {
    if (editingTransaction) {
      return await updateTransaction(editingTransaction.id, payload as UpdateTransactionPayload)
    } else {
      return await createTransaction(payload as CreateTransactionPayload)
    }
  }

  const handleDelete = async () => {
    if (deletingId) {
      setIsDeleting(true)
      const success = await deleteTransaction(deletingId)
      setIsDeleting(false)
      if (success) {
        setIsDeleteOpen(false)
        setDeletingId(null)
      }
    }
  }

  const handleExport = async (format: 'csv' | 'pdf') => {
    if (transactions.length === 0) {
      addToast('info', 'Tidak ada data untuk diekspor.')
      return
    }

    setIsExporting(true)
    try {
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

  const handleSort = (column: 'date' | 'amount') => {
    if (filters.sortBy === column) {
      setFilters({ sortDirection: filters.sortDirection === 'asc' ? 'desc' : 'asc' })
    } else {
      setFilters({ sortBy: column, sortDirection: 'desc' })
    }
  }

  const handleResetFilters = () => {
    setSearchInput('')
    resetFilters()
    setCurrentPage(1)
  }

  const SortIcon = ({ column }: { column: 'date' | 'amount' }) => {
    if (filters.sortBy !== column) {
      return <span className="material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-50">arrow_downward</span>
    }
    return (
      <span className="material-symbols-outlined text-[14px] text-primary">
        {filters.sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
      </span>
    )
  }

  const isFilterActive = filters.keyword !== '' || filters.categoryId !== null || filters.type !== null || filters.startDate !== null || filters.endDate !== null

  // Pagination logic
  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE) || 1
  const currentData = transactions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  return (
    <div className="flex flex-col w-full gap-6 max-w-[1400px]">
      {/* Modals */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTransaction(null) }}
        transaction={editingTransaction}
        categories={categories}
        onSubmit={handleCreateOrUpdate}
      />
      <DeleteConfirmation
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setDeletingId(null) }}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[40px] font-bold tracking-tight text-on-background leading-tight">Transaksi</h1>
          <p className="text-[16px] text-on-surface-variant">Kelola pemasukan dan pengeluaran Anda</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExport('csv')}
            disabled={isExporting || (loading && transactions.length === 0)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold text-[14px] transition-colors shadow-sm disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">description</span>
            CSV
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={isExporting || (loading && transactions.length === 0)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold text-[14px] transition-colors shadow-sm disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            PDF
          </button>
          <button
            onClick={() => { setEditingTransaction(null); setIsModalOpen(true) }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-semibold text-[14px] transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Tambah Transaksi
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="w-full px-4 py-3 rounded-lg bg-error-container text-on-error-container text-[14px] font-medium flex items-center justify-between gap-2 shadow-sm border border-error-container/20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>Gagal memuat data: {error}</span>
          </div>
          <button onClick={fetchTransactions} className="px-3 py-1.5 bg-error-container hover:bg-error/20 text-on-error-container rounded-md font-semibold text-[13px] transition-colors border border-on-error-container/20">
            Coba Lagi
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-5 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between w-full">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant">search</span>
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-[14px] text-on-surface placeholder:text-on-surface-variant/60"
            />
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Type */}
            <select
              value={filters.type ?? ''}
              onChange={e => setFilters({ type: e.target.value ? e.target.value as TransactionType : null })}
              className="px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-[14px] text-on-surface appearance-none cursor-pointer"
            >
              <option value="">Semua Tipe</option>
              <option value="income">Pemasukan</option>
              <option value="expense">Pengeluaran</option>
            </select>

            {/* Category */}
            <select
              value={filters.categoryId ?? ''}
              onChange={e => setFilters({ categoryId: e.target.value ? parseInt(e.target.value, 10) : null })}
              className="px-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-[14px] text-on-surface appearance-none cursor-pointer max-w-[180px]"
            >
              <option value="">Semua Kategori</option>
              {filterCategories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Date Filter & Reset */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 pt-4 border-t border-outline-variant/30">
          <DateRangeFilter 
            initialStartDate={filters.startDate}
            initialEndDate={filters.endDate}
            onFilter={(start, end) => setFilters({ startDate: start, endDate: end })}
          />
          {isFilterActive && (
            <button 
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-4 py-2 bg-error-container text-on-error-container hover:bg-error/20 rounded-lg text-[13px] font-semibold transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col overflow-hidden">
        {loading && transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
            <span className="material-symbols-outlined text-[40px] animate-spin opacity-50 mb-3">progress_activity</span>
            <p className="text-[14px] font-medium">Memuat data...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-on-surface-variant">
            <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[32px] opacity-60">
                {isFilterActive ? 'search_off' : 'receipt_long'}
              </span>
            </div>
            <p className="text-[16px] font-semibold text-on-surface mb-1">
              {isFilterActive ? 'Tidak ada hasil' : 'Belum ada transaksi'}
            </p>
            <p className="text-[14px]">
              {isFilterActive ? 'Tidak ada transaksi yang sesuai dengan filter saat ini.' : 'Data transaksi yang Anda buat akan muncul di sini.'}
            </p>
            {isFilterActive && (
              <button 
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 bg-surface-container-highest hover:bg-surface-container-high rounded-lg font-medium text-[14px] text-on-surface transition-colors"
              >
                Reset Filter
              </button>
            )}
          </div>
        ) : (
          <div className="w-full flex flex-col">
            <div className="w-full overflow-x-auto">
              <div className="min-w-[900px] flex flex-col">
                {/* Header */}
                <div className="flex items-center bg-surface-container-low/50 py-3.5 px-6 border-b border-outline-variant/30">
                  <div 
                    onClick={() => handleSort('date')}
                    className="w-[15%] text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider flex items-center gap-1 cursor-pointer group select-none"
                  >
                    Tanggal <SortIcon column="date" />
                  </div>
                  <div className="w-[30%] text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">Deskripsi</div>
                  <div className="w-[20%] text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">Kategori</div>
                  <div className="w-[12%] text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">Tipe</div>
                  <div 
                    onClick={() => handleSort('amount')}
                    className="w-[15%] text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider flex items-center justify-end gap-1 cursor-pointer group select-none"
                  >
                    Jumlah <SortIcon column="amount" />
                  </div>
                  <div className="w-[8%] text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider text-right">Aksi</div>
                </div>
                
                {/* Rows */}
                <div className="flex flex-col divide-y divide-outline-variant/10">
                  {currentData.map((tx) => {
                    const isIncome = tx.type === 'income'
                    const categoryName = categories.find(c => c.id === tx.category_id)?.name ?? '—'

                    return (
                      <div key={tx.id} className="flex items-center py-4 px-6 hover:bg-surface-container-lowest transition-colors group">
                        <div className="w-[15%] text-[14px] text-on-surface-variant font-medium">
                          {formatDate(tx.transaction_date)}
                        </div>
                        <div className="w-[30%] text-[15px] font-semibold text-on-surface truncate pr-4">
                          {tx.description || <span className="text-on-surface-variant/50 italic">Tanpa deskripsi</span>}
                        </div>
                        <div className="w-[20%]">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[12px] font-semibold shadow-sm ${
                            isIncome 
                              ? 'bg-primary-container/30 text-on-primary-container border border-primary-container' 
                              : 'bg-error-container/20 text-on-error-container border border-error-container/40'
                          }`}>
                            {categoryName}
                          </span>
                        </div>
                        <div className="w-[12%] text-[13px] font-medium text-on-surface-variant">
                          {isIncome ? 'Pemasukan' : 'Pengeluaran'}
                        </div>
                        <div className={`w-[15%] text-[15px] font-semibold text-right tabular-nums ${
                          isIncome ? 'text-primary' : 'text-on-surface'
                        }`}>
                          {isIncome ? '+' : '-'}{formatCurrency(tx.amount, settings.currency)}
                        </div>
                        <div className="w-[8%] flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => { setEditingTransaction(tx); setIsModalOpen(true) }}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary-container/20 transition-colors"
                            aria-label="Edit Transaksi"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button 
                            onClick={() => { setDeletingId(tx.id); setIsDeleteOpen(true) }}
                            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors"
                            aria-label="Hapus Transaksi"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-outline-variant/30 bg-surface-container-lowest">
                <span className="text-[13px] text-on-surface-variant font-medium">
                  Menampilkan {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, transactions.length)} dari {transactions.length} transaksi
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/50 text-on-surface disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-container transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  <span className="text-[14px] font-semibold text-on-surface px-2">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-outline-variant/50 text-on-surface disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-container transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
