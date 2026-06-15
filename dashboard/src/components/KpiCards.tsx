import { useMemo } from 'react'
import { TrendingUp, Package, AlertTriangle, DollarSign } from 'lucide-react'
import type { OrderRow } from '../types'

export function KpiCards({ data }: { data: OrderRow[] }) {
  const kpis = useMemo(() => {
    let totalSales = 0, totalProfit = 0, lateCount = 0
    for (const row of data) {
      totalSales += parseFloat(row['Sales']) || 0
      totalProfit += parseFloat(row['Order Profit Per Order']) || 0
      if (row['Late_delivery_risk'] === '1' || row['Delivery Status'] === 'Late delivery') lateCount++
    }
    const lateRate = ((lateCount / data.length) * 100).toFixed(1)
    const avgOrderValue = (totalSales / data.length).toFixed(2)
    return { totalSales, totalProfit, lateRate, avgOrderValue, count: data.length }
  }, [data])

  const cards = [
    {
      label: 'Total Sales (sample)',
      value: `$${(kpis.totalSales / 1000).toFixed(1)}k`,
      icon: DollarSign,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/30',
    },
    {
      label: 'Total Profit (sample)',
      value: `$${(kpis.totalProfit / 1000).toFixed(1)}k`,
      icon: TrendingUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/30',
    },
    {
      label: 'Avg Order Value',
      value: `$${kpis.avgOrderValue}`,
      icon: Package,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10 border-violet-500/30',
    },
    {
      label: 'Late Delivery Rate',
      value: `${kpis.lateRate}%`,
      icon: AlertTriangle,
      color: parseFloat(kpis.lateRate) > 50 ? 'text-red-400' : 'text-amber-400',
      bg: parseFloat(kpis.lateRate) > 50 ? 'bg-red-500/10 border-red-500/30' : 'bg-amber-500/10 border-amber-500/30',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {cards.map(card => (
        <div key={card.label} className={`rounded-xl p-4 border ${card.bg} flex items-center gap-3`}>
          <div className={`p-2 rounded-lg ${card.bg}`}>
            <card.icon size={20} className={card.color} />
          </div>
          <div>
            <p className="text-slate-400 text-xs">{card.label}</p>
            <p className={`font-bold text-xl ${card.color}`}>{card.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
