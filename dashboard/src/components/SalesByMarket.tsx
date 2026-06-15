import { useRef, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { AiBubble } from './AiBubble'
import type { ChatMessage } from './AiChatPanel'
import type { ChatSession } from '@google/generative-ai'
import type { OrderRow } from '../types'

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4']

export function SalesByMarket({ data, onOpen }: { data: OrderRow[]; onOpen: (session: ChatSession, messages: ChatMessage[], title: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)

  const chartData = useMemo(() => {
    const map = new Map<string, { sales: number; orders: number }>()
    for (const row of data) {
      const market = row['Market'] || 'Unknown'
      const sales = parseFloat(row['Sales']) || 0
      const prev = map.get(market) ?? { sales: 0, orders: 0 }
      map.set(market, { sales: prev.sales + sales, orders: prev.orders + 1 })
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1].sales - a[1].sales)
      .map(([name, { sales, orders }]) => ({ name, sales: Math.round(sales), orders }))
  }, [data])

  return (
    <div className="chart-card" ref={ref}>
      <h3 className="text-slate-200 font-semibold mb-4 text-sm">Total Sales by Market</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} layout="vertical" margin={{ left: 80, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
          <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
          <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} width={75} />
          <Tooltip
            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
            formatter={(v: unknown) => [`$${(v as number).toLocaleString()}`, 'Sales']}
          />
          <Bar dataKey="sales" radius={[0, 4, 4, 0]}>
            {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <AiBubble chartRef={ref} chartTitle="Total Sales by Market" onOpen={onOpen} />
    </div>
  )
}
