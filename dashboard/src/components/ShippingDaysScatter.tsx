import { useRef, useMemo } from 'react'
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { AiBubble } from './AiBubble'
import type { ChatMessage } from './AiChatPanel'
import type { ChatSession } from '@google/generative-ai'
import type { OrderRow } from '../types'

export function ShippingDaysScatter({ data, onOpen }: { data: OrderRow[]; onOpen: (session: ChatSession, messages: ChatMessage[], title: string) => void }) {
  const ref = useRef<HTMLDivElement>(null)

  const chartData = useMemo(() => {
    return data
      .map(row => ({
        scheduled: parseInt(row['Days for shipment (scheduled)']) || 0,
        actual: parseInt(row['Days for shipping (real)']) || 0,
        status: row['Delivery Status'],
      }))
      .filter(r => r.scheduled > 0 && r.actual > 0)
      .slice(0, 400)
  }, [data])

  const maxVal = useMemo(() => Math.max(...chartData.map(d => Math.max(d.scheduled, d.actual)), 10), [chartData])

  return (
    <div className="chart-card" ref={ref}>
      <h3 className="text-slate-200 font-semibold mb-1 text-sm">Scheduled vs Actual Shipping Days</h3>
      <p className="text-slate-500 text-xs mb-3">Points above the diagonal line = late deliveries</p>
      <ResponsiveContainer width="100%" height={250}>
        <ScatterChart margin={{ left: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis type="number" dataKey="scheduled" name="Scheduled" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'Scheduled Days', fill: '#64748b', fontSize: 11, position: 'bottom' }} />
          <YAxis type="number" dataKey="actual" name="Actual" tick={{ fill: '#94a3b8', fontSize: 11 }} label={{ value: 'Actual Days', fill: '#64748b', fontSize: 11, angle: -90, position: 'insideLeft' }} />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8 }}
            formatter={(v: unknown, name: unknown) => [`${v} days`, name as string]}
          />
          <ReferenceLine segment={[{ x: 0, y: 0 }, { x: maxVal, y: maxVal }]} stroke="#f59e0b" strokeDasharray="5 5" strokeWidth={1.5} />
          <Scatter data={chartData} fill="#3b82f6" fillOpacity={0.5} />
        </ScatterChart>
      </ResponsiveContainer>
      <AiBubble chartRef={ref} chartTitle="Scheduled vs Actual Shipping Days" onOpen={onOpen} />
    </div>
  )
}
