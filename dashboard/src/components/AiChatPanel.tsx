import { useRef, useState, useEffect, useCallback } from 'react'
import { Sparkles, X, Minus, Send, Loader2, GripVertical, RefreshCw } from 'lucide-react'
import type { ChatSession } from '@google/generative-ai'
import { sendFollowUp } from '../gemini'

export interface ChatMessage {
  role: 'user' | 'ai'
  text: string
  loading?: boolean
}

interface Props {
  session: ChatSession | null
  messages: ChatMessage[]
  chartTitle: string
  onClose: () => void
  onClearChat: () => void
  onFollowUp: (msg: ChatMessage) => void
  onUpdateLastMessage: (text: string) => void
}

export function AiChatPanel({
  session,
  messages,
  chartTitle,
  onClose,
  onClearChat,
  onFollowUp,
  onUpdateLastMessage,
}: Props) {
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [pos, setPos] = useState({ x: window.innerWidth - 400, y: 80 })
  const dragging = useRef(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
    e.preventDefault()
  }, [pos])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return
      setPos({
        x: Math.min(Math.max(0, e.clientX - dragOffset.current.x), window.innerWidth - 380),
        y: Math.min(Math.max(0, e.clientY - dragOffset.current.y), window.innerHeight - 60),
      })
    }
    const onUp = () => { dragging.current = false }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  const submit = async () => {
    if (!input.trim() || sending || !session) return
    const text = input.trim()
    setInput('')
    setSending(true)

    onFollowUp({ role: 'user', text })
    onFollowUp({ role: 'ai', text: '', loading: true })

    try {
      const reply = await sendFollowUp(session, text)
      onUpdateLastMessage(reply)
    } catch (e) {
      onUpdateLastMessage(`Error: ${e instanceof Error ? e.message : 'Failed to get response.'}`)
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      ref={panelRef}
      className="fixed z-50 w-96 rounded-2xl shadow-2xl border border-slate-600/60 overflow-hidden flex flex-col"
      style={{
        left: pos.x,
        top: pos.y,
        maxHeight: minimized ? 48 : 520,
        background: 'rgba(15, 23, 42, 0.97)',
        backdropFilter: 'blur(16px)',
        transition: 'max-height 0.2s ease',
        userSelect: dragging.current ? 'none' : 'auto',
      }}
    >
      {/* Header — drag handle */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-blue-600/90 to-violet-600/90 cursor-grab active:cursor-grabbing select-none"
        onMouseDown={onMouseDown}
      >
        <GripVertical size={14} className="text-white/60 shrink-0" />
        <Sparkles size={14} className="text-white shrink-0" />
        <span className="text-white text-xs font-semibold flex-1 truncate">{chartTitle}</span>
        <button onClick={() => setMinimized(v => !v)} className="text-white/70 hover:text-white p-0.5" title="Minimize">
          <Minus size={13} />
        </button>
        <button onClick={onClearChat} className="text-white/70 hover:text-white p-0.5" title="New chat">
          <RefreshCw size={13} />
        </button>
        <button onClick={onClose} className="text-white/70 hover:text-white p-0.5" title="Close">
          <X size={13} />
        </button>
      </div>

      {!minimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ maxHeight: 380 }}>
            {messages.length === 0 && (
              <p className="text-slate-500 text-xs text-center mt-8">
                Click "AI Explain" on any chart to start.
              </p>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`rounded-xl px-3 py-2 text-sm max-w-[85%] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 border border-slate-700 text-slate-200'
                  }`}
                >
                  {msg.loading ? (
                    <span className="flex items-center gap-2 text-slate-400">
                      <Loader2 size={13} className="animate-spin" /> Thinking…
                    </span>
                  ) : (
                    <span className="whitespace-pre-wrap">{msg.text}</span>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-700/60 p-2.5 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && submit()}
              placeholder="Ask a follow-up question…"
              disabled={sending || !session}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-blue-500 disabled:opacity-50"
            />
            <button
              onClick={submit}
              disabled={sending || !input.trim() || !session}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-lg px-2.5 py-1.5 transition-colors"
            >
              <Send size={14} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
