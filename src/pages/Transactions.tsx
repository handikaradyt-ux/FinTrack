import { useEffect, useState, useMemo } from 'react'
import { useTransactionStore } from '../stores/transactionStore'
import type { Transaction, CreateTransactionPayload, UpdateTransactionPayload, Category, TransactionType } from '../types/models'

// ============================================================
// Formatters
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
  const [type, setType] = useState<TransactionType>(transaction?.type ?? 'expense')
  const [amount, setAmount] = useState(transaction?.amount?.toString() ?? '')
  const [date, setDate] = useState(transaction?.transaction_date ?? new Date().toISOString().split('T')[0])
  const [description, setDescription] = useState(transaction?.description ?? '')
  const [categoryId, setCategoryId] = useState(transaction?.category_id?.toString() ?? '')
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

    // Frontend Validation
    const numAmount = parseInt(amount, 10)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Jumlah harus lebih dari 0')
      return
    }
    if (!date) {
      setError('Tanggal wajib diisi')
      return
    }
    if (!categoryId) {
      setError('Kategori wajib dipilih')
      return
    }

    setIsSubmitting(true)
    const success = await onSubmit({
      type,
      amount: numAmount,
      transaction_date: date,
      description: description.trim() || null,
      category_id: parseInt(categoryId, 10),
    })
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
                onClick={() => setType('expense')}
                className={`flex-1 py-2 text-[14px] font-medium rounded-md transition-colors ${type === 'expense' ? 'bg-error text-on-error shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
              >
                Pengeluaran
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`flex-1 py-2 text-[14px] font-medium rounded-md transition-colors ${type === 'income' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
              >
                Pemasukan
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-on-surface-variant">Jumlah (Rp)</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-surface border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-[15px] font-medium text-on-surface"
              placeholder="0"
              required
              min="1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-on-surface-variant">Tanggal</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-surface border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-[15px] text-on-surface"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-medium text-on-surface-variant">Kategori</label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-surface border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-[15px] text-on-surface appearance-none"
                required
              >
                {filteredCategories.length === 0 && <option value="" disabled>Belum ada kategori</option>}
                {filteredCategories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-on-surface-variant">Deskripsi (Opsional)</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-surface border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-[15px] text-on-surface"
              placeholder="Contoh: Makan siang"
            />
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
  const { transactions, categories, loading, error, fetchTransactions, fetchCategories, createTransaction, updateTransaction, deleteTransaction } = useTransactionStore()
  
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchTransactions()
    fetchCategories()
  }, [fetchTransactions, fetchCategories])

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchType = filterType === 'all' || tx.type === filterType
      const matchSearch = tx.description?.toLowerCase().includes(search.toLowerCase()) ?? false
      return matchType && (search === '' || matchSearch)
    })
  }, [transactions, filterType, search])

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

  return (
    <div className="flex flex-col w-full gap-8 max-w-[1400px]">
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
        <button
          onClick={() => { setEditingTransaction(null); setIsModalOpen(true) }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-semibold text-[14px] transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Tambah Transaksi
        </button>
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
      <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-on-surface-variant">search</span>
          <input
            type="text"
            placeholder="Cari transaksi..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-[14px] text-on-surface placeholder:text-on-surface-variant/60"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {(['all', 'income', 'expense'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-colors whitespace-nowrap ${
                filterType === type 
                  ? 'bg-secondary-container text-on-secondary-container shadow-sm border border-secondary-container/20' 
                  : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant/30 hover:bg-surface-container-low'
              }`}
            >
              {type === 'all' ? 'Semua' : type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col overflow-hidden">
        {loading && transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
            <span className="material-symbols-outlined text-[40px] animate-spin opacity-50 mb-3">progress_activity</span>
            <p className="text-[14px] font-medium">Memuat data...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-on-surface-variant">
            <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[32px] opacity-60">receipt_long</span>
            </div>
            <p className="text-[16px] font-semibold text-on-surface mb-1">Belum ada transaksi</p>
            <p className="text-[14px]">Data transaksi yang Anda buat akan muncul di sini.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <div className="min-w-[900px] flex flex-col">
              {/* Header */}
              <div className="flex items-center bg-surface-container-low/50 py-3.5 px-6 border-b border-outline-variant/30">
                <div className="w-[15%] text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">Tanggal</div>
                <div className="w-[30%] text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">Deskripsi</div>
                <div className="w-[20%] text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">Kategori</div>
                <div className="w-[12%] text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider">Tipe</div>
                <div className="w-[15%] text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider text-right">Jumlah</div>
                <div className="w-[8%] text-[12px] font-semibold text-on-surface-variant uppercase tracking-wider text-right">Aksi</div>
              </div>
              
              {/* Rows */}
              <div className="flex flex-col divide-y divide-outline-variant/10">
                {filteredTransactions.map((tx) => {
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
                        {isIncome ? '+' : '-'}{formatRupiah(tx.amount)}
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
        )}
      </div>
    </div>
  )
}
