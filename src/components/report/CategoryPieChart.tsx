import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { ExpenseByCategoryItem } from '../../types/models'

interface CategoryPieChartProps {
  data: ExpenseByCategoryItem[]
}

const CHART_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444', 
  '#8b5cf6', '#06b6d4', '#f97316', '#ec4899', 
  '#14b8a6', '#6366f1', '#eab308', '#f43f5e'
]

// Deterministic color based on category id
function getColor(id: number) {
  return CHART_COLORS[id % CHART_COLORS.length]
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[300px] flex flex-col items-center justify-center text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant/30">
        <span className="material-symbols-outlined text-[40px] opacity-50 mb-3">pie_chart</span>
        <p className="text-[14px] font-medium">Belum ada data pengeluaran pada periode ini.</p>
      </div>
    )
  }

  // Format currency
  const formatRp = (val: number) => `Rp ${val.toLocaleString('id-ID')}`

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-surface border border-outline-variant/30 rounded-lg shadow-lg p-3 text-[13px]">
          <p className="font-semibold text-on-surface mb-1">{data.categoryName}</p>
          <p className="text-on-surface-variant">
            Total: <span className="font-semibold text-error">{formatRp(data.amount)}</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="amount"
            nameKey="categoryName"
          >
            {data.map((entry) => (
              <Cell key={`cell-${entry.categoryId}`} fill={getColor(entry.categoryId)} stroke="rgba(255,255,255,0.2)" />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            iconType="circle"
            formatter={(value) => <span className="text-[13px] text-on-surface ml-1">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
