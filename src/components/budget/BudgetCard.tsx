import type { BudgetOverviewItem } from '../../types/models'

// Formatters
function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('IDR', 'Rp').trim()
}

interface BudgetCardProps {
  item: BudgetOverviewItem
  onEdit: (item: BudgetOverviewItem) => void
  onDelete: (id: number) => void
}

export function BudgetCard({ item, onEdit, onDelete }: BudgetCardProps) {
  // Determine progress bar color
  let progressColor = 'bg-primary'
  if (item.percentage >= 80 && item.percentage <= 100) {
    progressColor = 'bg-tertiary-fixed-dim'
  } else if (item.percentage > 100) {
    progressColor = 'bg-error'
  }

  // Cap width at 100% for the visual bar
  const visualPercentage = Math.min(item.percentage, 100)

  return (
    <div className="group relative bg-surface-container-lowest border border-outline-variant/30 rounded-xl p-5 hover:shadow-md transition-all hover:border-primary/30 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-error-container text-on-error-container">
            <span className="material-symbols-outlined text-[20px]">
              account_balance_wallet
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[16px] font-semibold text-on-surface">{item.category_name}</span>
            <span className="text-[13px] text-on-surface-variant mt-0.5">
              Anggaran: {formatRupiah(item.budget_amount)}
            </span>
          </div>
        </div>
        
        {/* Over budget badge */}
        {item.is_over && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-error-container text-on-error-container text-[11px] font-bold uppercase tracking-wider">
            <span className="material-symbols-outlined text-[14px]">warning</span>
            Terlampaui
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="flex flex-col gap-1.5 mt-2">
        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-[12px] font-medium text-on-surface-variant">Terpakai</span>
            <span className="text-[15px] font-semibold text-on-surface tabular-nums">
              {formatRupiah(item.spent_amount)}
            </span>
          </div>
          <span className={`text-[14px] font-bold tabular-nums ${item.is_over ? 'text-error' : 'text-on-surface'}`}>
            {item.percentage}%
          </span>
        </div>
        <div className="w-full h-2.5 bg-surface-variant rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ease-out ${progressColor}`} 
            style={{ width: `${visualPercentage}%` }}
          />
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-[12px] font-medium text-on-surface-variant">Sisa</span>
          <span className={`text-[13px] font-semibold tabular-nums ${item.remaining < 0 ? 'text-error' : 'text-on-surface'}`}>
            {formatRupiah(item.remaining)}
          </span>
        </div>
      </div>

      {/* Hover Actions */}
      <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-surface-container-lowest/80 backdrop-blur-sm rounded-full px-1 py-1">
        <button 
          onClick={() => onEdit(item)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-primary-container/20 transition-colors shadow-sm"
          aria-label="Edit Anggaran"
        >
          <span className="material-symbols-outlined text-[18px]">edit</span>
        </button>
        <button 
          onClick={() => onDelete(item.budget_id)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors shadow-sm"
          aria-label="Hapus Anggaran"
        >
          <span className="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>
    </div>
  )
}
