import { useState, useEffect, useCallback } from 'react'
import { BarChart3 } from 'lucide-react'
import { KpiCards } from './components/KpiCards'
import { SalesByCategory } from './components/SalesByCategory'
import { DeliveryStatus } from './components/DeliveryStatus'
import { ShippingModeProfit } from './components/ShippingModeProfit'
import { SalesByMarket } from './components/SalesByMarket'
import { LateDeliveryByRegion } from './components/LateDeliveryByRegion'
import { OrdersOverTime } from './components/OrdersOverTime'
import { CustomerSegment } from './components/CustomerSegment'
import { OrderStatus } from './components/OrderStatus'
import { ShippingDaysScatter } from './components/ShippingDaysScatter'
import { AiChatPanel } from './components/AiChatPanel'
import type { ChatMessage } from './components/AiChatPanel'
import type { ChatSession } from '@google/generative-ai'
import type { OrderRow } from './types'
import './index.css'

export default function App() {
  const [data, setData] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)

  // Chat panel state
  const [chatOpen, setChatOpen] = useState(false)
  const [chatTitle, setChatTitle] = useState('')
  const [chatSession, setChatSession] = useState<ChatSession | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])

  useEffect(() => {
    fetch('/data.json')
      .then(r => r.json())
      .then((rows: OrderRow[]) => {
        setData(rows)
        setLoading(false)
      })
  }, [])

  const handleOpenChat = useCallback(
    (session: ChatSession, messages: ChatMessage[], title: string) => {
      setChatSession(session)
      setChatMessages(messages)
      setChatTitle(title)
      setChatOpen(true)
    },
    []
  )

  const handleFollowUp = useCallback((msg: ChatMessage) => {
    setChatMessages(prev => [...prev, msg])
  }, [])

  const handleUpdateLastMessage = useCallback((text: string) => {
    setChatMessages(prev => {
      const updated = [...prev]
      const last = updated[updated.length - 1]
      if (last?.role === 'ai') updated[updated.length - 1] = { role: 'ai', text }
      return updated
    })
  }, [])

  const handleClearChat = useCallback(() => {
    setChatSession(null)
    setChatMessages([])
    setChatTitle('')
    setChatOpen(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-slate-400 text-lg flex items-center gap-3">
          <BarChart3 className="animate-pulse" size={24} />
          Loading supply chain data…
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 size={26} className="text-blue-400" />
            DataCo Supply Chain Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Analyzing {data.length.toLocaleString()} sampled orders · AI-powered insights via Gemini 2.5 Flash
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <KpiCards data={data} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        <SalesByCategory data={data} onOpen={handleOpenChat} />
        <DeliveryStatus data={data} onOpen={handleOpenChat} />
        <ShippingModeProfit data={data} onOpen={handleOpenChat} />
        <SalesByMarket data={data} onOpen={handleOpenChat} />
        <LateDeliveryByRegion data={data} onOpen={handleOpenChat} />
        <OrdersOverTime data={data} onOpen={handleOpenChat} />
        <CustomerSegment data={data} onOpen={handleOpenChat} />
        <OrderStatus data={data} onOpen={handleOpenChat} />
        <ShippingDaysScatter data={data} onOpen={handleOpenChat} />
      </div>

      <p className="text-center text-slate-600 text-xs mt-8 pb-6">
        Data sample: {data.length.toLocaleString()} of 180,519 orders · DataCo Supply Chain Dataset
      </p>

      {/* Draggable AI Chat Panel */}
      {chatOpen && (
        <AiChatPanel
          session={chatSession}
          messages={chatMessages}
          chartTitle={chatTitle}
          onClose={() => setChatOpen(false)}
          onClearChat={handleClearChat}
          onFollowUp={handleFollowUp}
          onUpdateLastMessage={handleUpdateLastMessage}
        />
      )}
    </div>
  )
}
