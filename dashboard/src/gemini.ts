import { GoogleGenerativeAI, type ChatSession } from '@google/generative-ai'

function getApiKey(): string {
  const key = import.meta.env.VITE_GEMINI_API_KEY
  if (!key || key === 'your_gemini_api_key_here') {
    throw new Error('VITE_GEMINI_API_KEY is not set in your .env file.')
  }
  return key
}

let genAI: GoogleGenerativeAI | null = null

function getClient(): GoogleGenerativeAI {
  if (!genAI) genAI = new GoogleGenerativeAI(getApiKey())
  return genAI
}

export function createChatSession(): ChatSession {
  const model = getClient().getGenerativeModel({ model: 'gemini-2.5-flash' })
  return model.startChat({ history: [] })
}

export async function analyzeChart(
  chat: ChatSession,
  base64Image: string,
  chartTitle: string
): Promise<string> {
  const result = await chat.sendMessage([
    `You are a supply chain analyst. Analyze this chart titled "${chartTitle}". Provide a concise analysis (3-5 sentences): key patterns, any anomalies or outliers, and one actionable recommendation. Be direct and specific.`,
    { inlineData: { mimeType: 'image/png', data: base64Image } },
  ])
  return result.response.text()
}

export async function sendFollowUp(
  chat: ChatSession,
  message: string
): Promise<string> {
  const result = await chat.sendMessage(message)
  return result.response.text()
}

export function isApiKeyConfigured(): boolean {
  const key = import.meta.env.VITE_GEMINI_API_KEY
  return !!key && key !== 'your_gemini_api_key_here'
}
