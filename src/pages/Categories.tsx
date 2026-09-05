import { useEffect, useState, useMemo } from 'react'
import { useCategoryStore } from '../stores/categoryStore'
import type { Category, CreateCategoryPayload, UpdateCategoryPayload, TransactionType } from '../types/models'

// ============================================================
// Modals
// ============================================================

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  category?: Category | null
  onSubmit: (payload: CreateCategoryPayload | UpdateCategoryPayload) => Promise<boolean>
}

function CategoryModal({ isOpen, onClose, category, onSubmit }: CategoryModalProps) {
  const [name, setName] = useState(category?.name ?? '')
  const [type, setType] = useState<TransactionType>(category?.type ?? 'expense')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setName(category?.name ?? '')
      setType(category?.type ?? 'expense')
      setError(null)
    }
  }, [isOpen, category])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Nama kategori tidak boleh kosong')
      return
    }
    if (trimmedName.length > 50) {
      setError('Nama kategori maksimal 50 karakter')
      return
    }

    setIsSubmitting(true)
    const success = await onSubmit({
      name: trimmedName,
      type,
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
            {category ? 'Edit Kategori' : 'Tambah Kategori'}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col p-6 gap-5">
          {error && (
            <div className="px-4 py-3 rounded-lg bg-error-container text-on-error-container text-[14px] font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-on-surface-variant">Tipe Kategori</label>
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
            <label className="text-[13px] font-medium text-on-surface-variant">Nama Kategori</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-surface border border-outline-variant/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-[15px] font-medium text-on-surface"
              placeholder="Contoh: Makanan"
              required
              maxLength={50}
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
            <h3 className="text-[18px] font-semibold text-on-surface">Hapus Kategori?</h3>
            <p className="text-[14px] text-on-surface-variant mt-1">
              Kategori tidak dapat dihapus jika masih digunakan oleh riwayat transaksi.
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

export function Categories() {
  const { categories, loading, error, fetchCategories, createCategory, updateCategory, deleteCategory } = useCategoryStore()
  
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const filteredCategories = useMemo(() => {
    return categories.filter(c => filterType === 'all' || c.type === filterType)
  }, [categories, filterType])

  const handleCreateOrUpdate = async (payload: CreateCategoryPayload | UpdateCategoryPayload) => {
    if (editingCategory) {
      return await updateCategory(editingCategory.id, payload as UpdateCategoryPayload)
    } else {
      return await createCategory(payload as CreateCategoryPayload)
    }
  }

  const handleDelete = async () => {
    if (deletingId) {
      setIsDeleting(true)
      const success = await deleteCategory(deletingId)
      setIsDeleting(false)
      if (success) {
        setIsDeleteOpen(false)
        setDeletingId(null)
      } else {
        // The store handles the general error state, but we also show it in the UI
        // Actually, since deleteCategory updates the store's error state, 
        // we can just use that, or set a local error state for the delete dialog.
        // For better UX, we'll let the main error banner handle it and close the dialog, 
        // OR keep the dialog open. The requirement says:
        // Jika gagal: tampilkan error, jangan crash.
        // If we close the dialog, the main error banner shows it. Let's close it so the user sees the main banner.
        setIsDeleteOpen(false)
        setDeletingId(null)
      }
    }
  }

  return (
    <div className="flex flex-col w-full gap-8 max-w-[1400px]">
      {/* Modals */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingCategory(null) }}
        category={editingCategory}
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
          <h1 className="text-[40px] font-bold tracking-tight text-on-background leading-tight">Kategori</h1>
          <p className="text-[16px] text-on-surface-variant">Kelola daftar kategori pemasukan dan pengeluaran</p>
        </div>
        <button
          onClick={() => { setEditingCategory(null); setIsModalOpen(true) }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-semibold text-[14px] transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Tambah Kategori
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="w-full px-4 py-3 rounded-lg bg-error-container text-on-error-container text-[14px] font-medium flex items-center justify-between gap-2 shadow-sm border border-error-container/20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
          <button onClick={fetchCategories} className="px-3 py-1.5 bg-error-container hover:bg-error/20 text-on-error-container rounded-md font-semibold text-[13px] transition-colors border border-on-error-container/20 shrink-0">
            Coba Lagi
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 w-full overflow-x-auto pb-1 md:pb-0">
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

      {/* Category Grid/List */}
      <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col min-h-[400px]">
        {loading && categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-20 text-on-surface-variant">
            <span className="material-symbols-outlined text-[40px] animate-spin opacity-50 mb-3">progress_activity</span>
            <p className="text-[14px] font-medium">Memuat kategori...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-24 text-on-surface-variant">
            <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[32px] opacity-60">category</span>
            </div>
            <p className="text-[16px] font-semibold text-on-surface mb-1">Belum ada kategori</p>
            <p className="text-[14px]">Tambahkan kategori untuk mulai mengatur transaksi Anda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {filteredCategories.map((c) => {
              const isIncome = c.type === 'income'
              return (
                <div key={c.id} className="group relative bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 hover:shadow-md transition-all hover:border-primary/30 flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isIncome ? 'bg-primary-container text-on-primary-container' : 'bg-error-container text-on-error-container'
                      }`}>
                        <span className="material-symbols-outlined text-[20px]">
                          {isIncome ? 'trending_up' : 'trending_down'}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[16px] font-semibold text-on-surface">{c.name}</span>
                        <span className="text-[13px] text-on-surface-variant mt-0.5">
                          {isIncome ? 'Pemasukan' : 'Pengeluaran'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => { setEditingCategory(c); setIsModalOpen(true) }}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary-container/20 transition-colors"
                      aria-label="Edit Kategori"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button 
                      onClick={() => { setDeletingId(c.id); setIsDeleteOpen(true) }}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors"
                      aria-label="Hapus Kategori"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
