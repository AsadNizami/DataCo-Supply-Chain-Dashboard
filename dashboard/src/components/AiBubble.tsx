import { useRef, useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import html2canvas from 'html2canvas'
import { createChatSession, analyzeChart, isApiKeyConfigured } from '../gemini'
import type { ChatMessage } from './AiChatPanel'
import type { ChatSession } from '@google/generative-ai'

interface Props {
  chartRef: React.RefObject<HTMLDivElement | null>
  chartTitle: string
  onOpen: (session: ChatSession, messages: ChatMessage[], title: string) => void
}

export function AiBubble({ chartRef, chartTitle, onOpen }: Props) {
  const [loading, setLoading] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleClick = async () => {
    if (!isApiKeyConfigured()) {
      onOpen(null as unknown as ChatSession, [
        { role: 'ai', text: 'VITE_GEMINI_API_KEY is not set. Add your key to the .env file and restart the dev server.' },
      ], chartTitle)
      return
    }

    if (!chartRef.current) return
    setLoading(true)

    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#1e293b',
        scale: 1,
        logging: false,
      })
      const base64 = canvas.toDataURL('image/png').split(',')[1]
      const session = createChatSession()

      onOpen(session, [{ role: 'ai', text: '', loading: true }], chartTitle)

      const reply = await analyzeChart(session, base64, chartTitle)

      onOpen(session, [{ role: 'ai', text: reply }], chartTitle)
    } catch (e) {
      onOpen(null as unknown as ChatSession, [
        { role: 'ai', text: `Error: ${e instanceof Error ? e.message : 'Failed to analyze chart.'}` },
      ], chartTitle)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      ref={buttonRef}
      className="ai-bubble"
      onClick={handleClick}
      disabled={loading}
      title="Ask AI to explain this chart"
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
      {loading ? 'Analyzing…' : 'AI Explain'}
    </button>
  )
}
