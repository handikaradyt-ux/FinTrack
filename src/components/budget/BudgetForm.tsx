import { useEffect, useState } from 'react'
import type { Category, CreateBudgetPayload, UpdateBudgetPayload, BudgetOverviewItem } from '../../types/models'
import { useSettingsStore } from '../../stores/settingsStore'
import { budgetSchema, updateBudgetSchema } from '../../schemas/budgetSchema'

interface BudgetFormProps {
  isOpen: boolean
  onClose: () => void
  budgetItem?: BudgetOverviewItem | null
  categories: Category[]
  month: number
  year: number
  onSubmit: (payload: CreateBudgetPayload | UpdateBudgetPayload) => Promise<boolean>
}

export function BudgetForm({ isOpen, onClose, budgetItem, categories, month, year, onSubmit }: BudgetFormProps) {
  const { settings } = useSettingsStore()
  const [amount, setAmount] = useState(budgetItem?.budget_amount?.toString() ?? '')
  const [categoryId, setCategoryId] = useState(budgetItem?.category_id?.toString() ?? '')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setAmount(budgetItem?.budget_amount?.toString() ?? '')
      setCategoryId(budgetItem?.category_id?.toString() ?? '')
      setFieldErrors({})
      setError(null)
    }
  }, [isOpen, budgetItem])

  // Auto-select first category if none selected
  useEffect(() => {
    if (isOpen && categories.length > 0 && !categoryId) {
      setCategoryId(categories[0].id.toString())
    }
  }, [isOpen, categories, categoryId])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (budgetItem) {
      const payload = {
        amount,
        month,
        year
      }
      const validation = updateBudgetSchema.safeParse(payload)
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
      if (success) onClose()
    } else {
      const payload = {
        category_id: categoryId,
        amount,
        month,
        year
      }
      const validation = budgetSchema.safeParse(payload)
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
      if (success) onClose()
    }
  }

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      {/* Explicit width using max-w-[28rem] (448px) to prevent v4 unified spacing overrides collapsing the modal */}
      <div className="bg-surface w-full max-w-[28rem] rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30">
          <h2 className="text-[20px] font-semibold text-on-surface">
            {budgetItem ? 'Edit Anggaran' : 'Tambah Anggaran'}
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

          <div className="px-4 py-3 bg-surface-container-low rounded-lg border border-outline-variant/20 flex flex-col gap-1">
            <span className="text-[12px] font-medium text-on-surface-variant">Periode Anggaran</span>
            <span className="text-[14px] font-semibold text-on-surface">{monthNames[month - 1]} {year}</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-on-surface-variant">Kategori (Pengeluaran)</label>
            <select
              value={categoryId}
              onChange={e => { setCategoryId(e.target.value); setFieldErrors(prev => ({ ...prev, category_id: '' })) }}
              disabled={!!budgetItem}
              className={`w-full px-4 py-2.5 rounded-lg bg-surface border ${fieldErrors.category_id ? 'border-error focus:ring-error' : 'border-outline-variant/50 focus:border-primary focus:ring-primary'} focus:ring-1 outline-none transition-all text-[15px] text-on-surface appearance-none disabled:opacity-50 disabled:bg-surface-container-low`}
            >
              {categories.length === 0 && <option value="" disabled>Belum ada kategori pengeluaran</option>}
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {fieldErrors.category_id && <span className="text-[12px] font-medium text-error mt-0.5">{fieldErrors.category_id}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-on-surface-variant">Nominal Anggaran ({settings.currency})</label>
            <input
              type="number"
              value={amount}
              onChange={e => { setAmount(e.target.value); setFieldErrors(prev => ({ ...prev, amount: '' })) }}
              className={`w-full px-4 py-2.5 rounded-lg bg-surface border ${fieldErrors.amount ? 'border-error focus:ring-error' : 'border-outline-variant/50 focus:border-primary focus:ring-primary'} focus:ring-1 outline-none transition-all text-[15px] font-medium text-on-surface`}
              placeholder="Contoh: 1000000"
            />
            {fieldErrors.amount && <span className="text-[12px] font-medium text-error mt-0.5">{fieldErrors.amount}</span>}
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
              disabled={isSubmitting || categories.length === 0}
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
