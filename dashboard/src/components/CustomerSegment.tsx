import { useRef, useMemo } from 'react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { AiBubble } from './AiBubble'
import type { ChatMessage } from './AiChatPanel'
import type { ChatSession } from '@google/generative-ai'
import type { OrderRow } from '../types'

export function CustomerSegment({ data, onOpen }: { data: OrderRow[]; onOpen: (session: ChatSession, messages: ChatMessage[], title: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)

  const chartData = useMemo(() => {
    const segments = new Set(data.map(r => r['Customer Segment']).filter(Boolean))
    const metrics = ['Sales', 'Order Profit Per Order', 'Order Item Quantity', 'Order Item Discount Rate', 'Order Item Profit Ratio']
    const labels = ['Avg Sales', 'Avg Profit', 'Avg Qty', 'Avg Discount', 'Profit Ratio']
    const keys = Array.from(segments)

    const totals: Record<string, Record<string, number>> = {}
    const counts: Record<string, number> = {}
    for (const seg of keys) {
      totals[seg] = {}
      counts[seg] = 0
      for (const m of metrics) totals[seg][m] = 0
    }

    for (const row of data) {
      const seg = row['Customer Segment']
      if (!seg || !totals[seg]) continue
      counts[seg]++
      for (const m of metrics) totals[seg][m] += parseFloat(row[m as keyof typeof row] as string) || 0
    }

    return metrics.map((m, i) => {
      const entry: Record<string, string | number> = { metric: labels[i] }
      for (const seg of keys) {
        const avg = counts[seg] > 0 ? totals[seg][m] / counts[seg] : 0
        entry[seg] = Math.round(avg * 100) / 100
      }
      return entry
    })
  }, [data])

  const segments = useMemo(() => Array.from(new Set(data.map(r => r['Customer Segment']).filter(Boolean))), [data])
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b']

  return (
    <div className="chart-card" ref={ref}>
      <h3 className="text-slate-200 font-semibold mb-4 text-sm">Customer Segment Performance</h3>
      <ResponsiveContainer width="100%" height={260}>
        <RadarChart data={chartData}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <PolarRadiusAxis tick={{ fill: '#475569', fontSize: 9 }} />
          {segments.map((seg, i) => (
            <Radar key={seg} name={seg} dataKey={seg} stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} fillOpacity={0.15} />
          ))}
          <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }} />
          <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
        </RadarChart>
      </ResponsiveContainer>
      <AiBubble chartRef={ref} chartTitle="Customer Segment Performance Radar" onOpen={onOpen} />
    </div>
  )
}
