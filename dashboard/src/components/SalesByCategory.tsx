import { useRef, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { AiBubble } from './AiBubble'
import type { ChatMessage } from './AiChatPanel'
import type { ChatSession } from '@google/generative-ai'
import type { OrderRow } from '../types'

const COLORS = ['#3b82f6','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899','#14b8a6']

export function SalesByCategory({ data, onOpen }: { data: OrderRow[]; onOpen: (session: ChatSession, messages: ChatMessage[], title: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)

  const chartData = useMemo(() => {
    const map = new Map<string, number>()
    for (const row of data) {
      const cat = row['Category Name'] || 'Unknown'
      const sales = parseFloat(row['Sales']) || 0
      map.set(cat, (map.get(cat) ?? 0) + sales)
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name: name.length > 20 ? name.slice(0, 18) + '…' : name, value: Math.round(value) }))
  }, [data])

  return (
    <div className="chart-card" ref={ref}>
      <h3 className="text-slate-200 font-semibold mb-4 text-sm">Sales by Category (Top 10)</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ left: 10, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
          <Tooltip
            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
            labelStyle={{ color: '#e2e8f0' }}
            formatter={(v: unknown) => [`$${(v as number).toLocaleString()}`, 'Sales']}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <AiBubble chartRef={ref} chartTitle="Sales by Category (Top 10)" onOpen={onOpen} />
    </div>
  )
}
