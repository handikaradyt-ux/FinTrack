import { useEffect, useState } from 'react'
import { useBudgetStore } from '../stores/budgetStore'
import { BudgetCard } from '../components/budget/BudgetCard'
import { BudgetForm } from '../components/budget/BudgetForm'
import type { BudgetOverviewItem, CreateBudgetPayload, UpdateBudgetPayload } from '../types/models'

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
            <h3 className="text-[18px] font-semibold text-on-surface">Hapus Anggaran</h3>
            <p className="text-[14px] text-on-surface-variant mt-1">
              Apakah Anda yakin ingin menghapus anggaran ini? Transaksi yang terkait tidak akan terhapus.
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

export function Budgets() {
  const { 
    budgetProgress, 
    categories, 
    selectedMonth, 
    selectedYear, 
    loading, 
    error,
    fetchBudgetProgress,
    fetchExpenseCategories,
    createBudget,
    updateBudget,
    deleteBudget,
    previousMonth,
    nextMonth
  } = useBudgetStore()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<BudgetOverviewItem | null>(null)
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchBudgetProgress()
    fetchExpenseCategories()
  }, [fetchBudgetProgress, fetchExpenseCategories, selectedMonth, selectedYear])

  const handleCreateOrUpdate = async (payload: CreateBudgetPayload | UpdateBudgetPayload) => {
    if (editingBudget) {
      return await updateBudget(editingBudget.budget_id, payload as UpdateBudgetPayload)
    } else {
      return await createBudget(payload as CreateBudgetPayload)
    }
  }

  const handleDelete = async () => {
    if (deletingId) {
      setIsDeleting(true)
      const success = await deleteBudget(deletingId)
      setIsDeleting(false)
      if (success) {
        setIsDeleteOpen(false)
        setDeletingId(null)
      } else {
        setIsDeleteOpen(false)
        setDeletingId(null)
      }
    }
  }

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]

  return (
    <div className="flex flex-col w-full gap-8 max-w-[1400px]">
      {/* Modals */}
      <BudgetForm
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingBudget(null) }}
        budgetItem={editingBudget}
        categories={categories}
        month={selectedMonth}
        year={selectedYear}
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
          <h1 className="text-[40px] font-bold tracking-tight text-on-background leading-tight">Anggaran</h1>
          <p className="text-[16px] text-on-surface-variant">Kelola target batas pengeluaran bulanan Anda</p>
        </div>
        <button
          onClick={() => { setEditingBudget(null); setIsModalOpen(true) }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-semibold text-[14px] transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Tambah Anggaran
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="w-full px-4 py-3 rounded-lg bg-error-container text-on-error-container text-[14px] font-medium flex items-center justify-between gap-2 shadow-sm border border-error-container/20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{error}</span>
          </div>
          <button onClick={fetchBudgetProgress} className="px-3 py-1.5 bg-error-container hover:bg-error/20 text-on-error-container rounded-md font-semibold text-[13px] transition-colors border border-on-error-container/20 shrink-0">
            Coba Lagi
          </button>
        </div>
      )}

      {/* Toolbar / Month Navigation */}
      <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-4 flex flex-col md:flex-row gap-4 items-center justify-center">
        <div className="flex items-center gap-4 bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-2 py-1.5">
          <button 
            onClick={previousMonth}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-low text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          
          <div className="flex items-center justify-center min-w-[140px]">
            <span className="text-[15px] font-semibold text-on-surface">
              {monthNames[selectedMonth - 1]} {selectedYear}
            </span>
          </div>

          <button 
            onClick={nextMonth}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-low text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>
      </div>

      {/* Budget Grid/List */}
      <div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col min-h-[400px]">
        {loading && budgetProgress.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-20 text-on-surface-variant">
            <span className="material-symbols-outlined text-[40px] animate-spin opacity-50 mb-3">progress_activity</span>
            <p className="text-[14px] font-medium">Memuat anggaran...</p>
          </div>
        ) : budgetProgress.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 py-24 text-on-surface-variant">
            <div className="w-16 h-16 rounded-full bg-surface-container-highest flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[32px] opacity-60">account_balance_wallet</span>
            </div>
            <p className="text-[16px] font-semibold text-on-surface mb-1">Belum ada anggaran bulan ini</p>
            <p className="text-[14px] mb-6">Tambahkan anggaran untuk mulai memonitor pengeluaran Anda.</p>
            <button
              onClick={() => { setEditingBudget(null); setIsModalOpen(true) }}
              className="px-5 py-2.5 rounded-xl bg-primary-container text-on-primary-container font-semibold text-[14px] hover:bg-primary-container/80 transition-colors"
            >
              Tambah Anggaran
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {budgetProgress.map((item) => (
              <BudgetCard 
                key={item.budget_id} 
                item={item} 
                onEdit={(b) => { setEditingBudget(b); setIsModalOpen(true) }}
                onDelete={(id) => { setDeletingId(id); setIsDeleteOpen(true) }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
