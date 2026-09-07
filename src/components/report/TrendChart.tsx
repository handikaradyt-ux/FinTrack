import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useSettingsStore } from '../../stores/settingsStore'
import { formatCurrency } from '../../utils/formatCurrency'
import type { ReportTrendItem } from '../../types/models'

interface TrendChartProps {
  data: ReportTrendItem[]
}

export function TrendChart({ data }: TrendChartProps) {
  const { settings } = useSettingsStore()

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[300px] flex flex-col items-center justify-center text-on-surface-variant bg-surface-container-lowest rounded-xl border border-outline-variant/30">
        <span className="material-symbols-outlined text-[40px] opacity-50 mb-3">bar_chart</span>
        <p className="text-[14px] font-medium">Belum ada data transaksi pada periode ini.</p>
      </div>
    )
  }

  // Format period (YYYY-MM to Short Month YYYY)
  const formatPeriod = (periodStr: string) => {
    const [year, month] = periodStr.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, 1)
    return date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
  }

  // Transform data for display
  const chartData = data.map(item => ({
    ...item,
    displayPeriod: formatPeriod(item.period)
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-outline-variant/30 rounded-lg shadow-lg p-3 text-[13px] min-w-[150px]">
          <p className="font-semibold text-on-surface mb-2 border-b border-outline-variant/30 pb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 mt-1">
              <span className="text-on-surface-variant flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name === 'income' ? 'Pemasukan' : 'Pengeluaran'}
              </span>
              <span className={`font-semibold ${entry.name === 'income' ? 'text-primary' : 'text-error'}`}>
                {formatCurrency(entry.value, settings.currency)}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          barGap={4}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.15)" />
          <XAxis 
            dataKey="displayPeriod" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: 'var(--color-on-surface-variant)' }}
            dy={10}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: 'var(--color-on-surface-variant)' }}
            tickFormatter={(value) => formatCurrency(value, settings.currency)}
            width={80}
            dx={-10}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(150,150,150,0.05)' }} />
          <Legend 
            verticalAlign="top" 
            height={36}
            iconType="circle"
            formatter={(value) => {
              return <span className="text-[13px] text-on-surface ml-1 mr-4">{value === 'income' ? 'Pemasukan' : 'Pengeluaran'}</span>
            }}
          />
          <Bar dataKey="income" fill="var(--color-primary)" radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey="expense" fill="var(--color-error)" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
