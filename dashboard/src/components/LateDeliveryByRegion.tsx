import { useRef, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { AiBubble } from './AiBubble'
import type { ChatMessage } from './AiChatPanel'
import type { ChatSession } from '@google/generative-ai'
import type { OrderRow } from '../types'

export function LateDeliveryByRegion({ data, onOpen }: { data: OrderRow[]; onOpen: (session: ChatSession, messages: ChatMessage[], title: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)

  const chartData = useMemo(() => {
    const map = new Map<string, { late: number; total: number }>()
    for (const row of data) {
      const region = row['Order Region'] || 'Unknown'
      const isLate = row['Late_delivery_risk'] === '1' || row['Delivery Status'] === 'Late delivery'
      const prev = map.get(region) ?? { late: 0, total: 0 }
      map.set(region, { late: prev.late + (isLate ? 1 : 0), total: prev.total + 1 })
    }
    return Array.from(map.entries())
      .map(([name, { late, total }]) => ({
        name: name.length > 20 ? name.slice(0, 18) + '…' : name,
        lateRate: Math.round((late / total) * 100),
        total,
      }))
      .sort((a, b) => b.lateRate - a.lateRate)
  }, [data])

  return (
    <div className="chart-card" ref={ref}>
      <h3 className="text-slate-200 font-semibold mb-4 text-sm">Late Delivery Rate by Region (%)</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ left: 5, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} angle={-40} textAnchor="end" interval={0} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" domain={[0, 100]} />
          <Tooltip
            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
            formatter={(v: unknown) => [`${v}%`, 'Late Rate']}
          />
          <Bar dataKey="lateRate" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <AiBubble chartRef={ref} chartTitle="Late Delivery Rate by Region" onOpen={onOpen} />
    </div>
  )
}
