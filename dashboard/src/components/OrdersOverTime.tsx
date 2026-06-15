import { useRef, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { AiBubble } from './AiBubble'
import type { ChatMessage } from './AiChatPanel'
import type { ChatSession } from '@google/generative-ai'
import type { OrderRow } from '../types'

export function OrdersOverTime({ data, onOpen }: { data: OrderRow[]; onOpen: (session: ChatSession, messages: ChatMessage[], title: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)

  const chartData = useMemo(() => {
    const map = new Map<string, { sales: number; orders: number }>()
    for (const row of data) {
      const rawDate = row['order date (DateOrders)']
      if (!rawDate) continue
      const parts = rawDate.split(' ')[0].split('/')
      if (parts.length < 3) continue
      const [month, , year] = parts
      const key = `${year}-${month.padStart(2, '0')}`
      const sales = parseFloat(row['Sales']) || 0
      const prev = map.get(key) ?? { sales: 0, orders: 0 }
      map.set(key, { sales: prev.sales + sales, orders: prev.orders + 1 })
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, { sales, orders }]) => ({
        month: key.slice(0, 7),
        sales: Math.round(sales),
        orders,
      }))
  }, [data])

  return (
    <div className="chart-card" ref={ref}>
      <h3 className="text-slate-200 font-semibold mb-4 text-sm">Sales & Orders Over Time</h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData} margin={{ left: 10, right: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-30} textAnchor="end" />
          <YAxis yAxisId="left" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
          <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
            labelStyle={{ color: '#e2e8f0' }}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
          <Line yAxisId="left" type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} dot={false} name="Sales ($)" />
          <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} dot={false} name="Orders" />
        </LineChart>
      </ResponsiveContainer>
      <AiBubble chartRef={ref} chartTitle="Sales & Orders Over Time" onOpen={onOpen} />
    </div>
  )
}
