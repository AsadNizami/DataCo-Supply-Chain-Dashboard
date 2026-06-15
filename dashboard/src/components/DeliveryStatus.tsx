import { useRef, useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { AiBubble } from './AiBubble'
import type { ChatMessage } from './AiChatPanel'
import type { ChatSession } from '@google/generative-ai'
import type { OrderRow } from '../types'

const COLORS: Record<string, string> = {
  'Advance shipping': '#10b981',
  'Shipping on time': '#3b82f6',
  'Late delivery': '#ef4444',
  'Shipping canceled': '#f59e0b',
}
const FALLBACK = ['#8b5cf6','#06b6d4','#ec4899','#14b8a6']

export function DeliveryStatus({ data, onOpen }: { data: OrderRow[]; onOpen: (session: ChatSession, messages: ChatMessage[], title: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)

  const chartData = useMemo(() => {
    const map = new Map<string, number>()
    for (const row of data) {
      const status = row['Delivery Status'] || 'Unknown'
      map.set(status, (map.get(status) ?? 0) + 1)
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  }, [data])

  return (
    <div className="chart-card" ref={ref}>
      <h3 className="text-slate-200 font-semibold mb-4 text-sm">Delivery Status Distribution</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            label={({ percent }: { percent?: number }) => `${((percent ?? 0) * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {chartData.map((entry, i) => (
              <Cell key={i} fill={COLORS[entry.name] ?? FALLBACK[i % FALLBACK.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
            formatter={(v: unknown) => [(v as number).toLocaleString(), 'Orders']}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
        </PieChart>
      </ResponsiveContainer>
      <AiBubble chartRef={ref} chartTitle="Delivery Status Distribution" onOpen={onOpen} />
    </div>
  )
}
