import { useRef, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { AiBubble } from './AiBubble'
import type { ChatMessage } from './AiChatPanel'
import type { ChatSession } from '@google/generative-ai'
import type { OrderRow } from '../types'

export function ShippingModeProfit({ data, onOpen }: { data: OrderRow[]; onOpen: (session: ChatSession, messages: ChatMessage[], title: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)

  const chartData = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>()
    for (const row of data) {
      const mode = row['Shipping Mode'] || 'Unknown'
      const profit = parseFloat(row['Order Profit Per Order']) || 0
      const prev = map.get(mode) ?? { total: 0, count: 0 }
      map.set(mode, { total: prev.total + profit, count: prev.count + 1 })
    }
    return Array.from(map.entries()).map(([name, { total, count }]) => ({
      name,
      avgProfit: Math.round(total / count),
      orders: count,
    }))
  }, [data])

  return (
    <div className="chart-card" ref={ref}>
      <h3 className="text-slate-200 font-semibold mb-4 text-sm">Avg Profit per Order by Shipping Mode</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `$${v}`} />
          <Tooltip
            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
            labelStyle={{ color: '#e2e8f0' }}
            formatter={(v: unknown, name: unknown) => [
              name === 'avgProfit' ? `$${(v as number).toLocaleString()}` : (v as number).toLocaleString(),
              name === 'avgProfit' ? 'Avg Profit' : 'Orders',
            ]}
          />
          <ReferenceLine y={0} stroke="#475569" />
          <Bar dataKey="avgProfit" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <AiBubble chartRef={ref} chartTitle="Avg Profit per Order by Shipping Mode" onOpen={onOpen} />
    </div>
  )
}
