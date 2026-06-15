import { useRef, useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { AiBubble } from './AiBubble'
import type { ChatMessage } from './AiChatPanel'
import type { ChatSession } from '@google/generative-ai'
import type { OrderRow } from '../types'

const STATUS_COLORS: Record<string, string> = {
  COMPLETE: '#10b981',
  PENDING: '#f59e0b',
  PROCESSING: '#3b82f6',
  CLOSED: '#6b7280',
  CANCELED: '#ef4444',
  'PENDING_PAYMENT': '#f97316',
  SUSPECTED_FRAUD: '#dc2626',
  'ON_HOLD': '#8b5cf6',
  PAYMENT_REVIEW: '#06b6d4',
}
const FALLBACK = ['#3b82f6','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444']

export function OrderStatus({ data, onOpen }: { data: OrderRow[]; onOpen: (session: ChatSession, messages: ChatMessage[], title: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)

  const chartData = useMemo(() => {
    const map = new Map<string, number>()
    for (const row of data) {
      const status = row['Order Status'] || 'Unknown'
      map.set(status, (map.get(status) ?? 0) + 1)
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }))
  }, [data])

  return (
    <div className="chart-card" ref={ref}>
      <h3 className="text-slate-200 font-semibold mb-4 text-sm">Order Status Breakdown</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            outerRadius={95}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, i) => (
              <Cell key={i} fill={STATUS_COLORS[entry.name] ?? FALLBACK[i % FALLBACK.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
            formatter={(v: unknown) => [(v as number).toLocaleString(), 'Orders']}
          />
          <Legend wrapperStyle={{ fontSize: 10, color: '#94a3b8' }} />
        </PieChart>
      </ResponsiveContainer>
      <AiBubble chartRef={ref} chartTitle="Order Status Breakdown" onOpen={onOpen} />
    </div>
  )
}
