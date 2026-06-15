import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { getLocalAssistantResponse } from '@/lib/chatbot-engine'
import { CHATBOT_KNOWLEDGE, type KnowledgeItem } from '@/lib/chatbot-knowledge'

const SYSTEM_PROMPT = `You are AutoCares AI Assistant.
Provide clear, practical, and safety-first vehicle guidance.
Use the provided knowledge when available to answer the user's query.
If the issue sounds urgent or unsafe, advise roadside assistance immediately.
Keep answers short and actionable.`

function getRelevantKnowledge(query: string, items: KnowledgeItem[], topN = 3) {
  const normalizedQuery = query.toLowerCase()
  const queryTokens = Array.from(new Set(normalizedQuery.match(/\w+/g) || []))

  return [...items]
    .map((item) => {
      const combined = `${item.intent} ${item.question} ${item.answer}`.toLowerCase()
      const score = queryTokens.reduce(
        (count, token) => (combined.includes(token) ? count + 1 : count),
        0,
      )
      return { item, score }
    })
    .sort((a, b) => b.score - a.score)
    .filter((entry) => entry.score > 0)
    .slice(0, topN)
    .map((entry) => entry.item)
}

export async function POST(request: NextRequest) {
  let userMessage = ''
  try {
    const { message, userName, history } = await request.json()
    userMessage = String(message || '')
    const displayName =
      typeof userName === 'string' && userName.trim() ? userName.trim() : null

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const geminiApiKey = process.env.GEMINI_API_KEY
    if (!geminiApiKey) {
      console.warn('[rag] GEMINI_API_KEY is missing, using local fallback')
      return NextResponse.json({
        answer: getLocalAssistantResponse(message),
        source: 'local_fallback',
        reason: 'GEMINI_API_KEY is not configured',
        matches: [],
      })
    }

    const ai = new GoogleGenAI({ apiKey: geminiApiKey })

    const relevantItems = getRelevantKnowledge(message, CHATBOT_KNOWLEDGE, 4)
    const context = (relevantItems.length ? relevantItems : CHATBOT_KNOWLEDGE)
      .map((item, index) => {
        return `#${index + 1}
Intent: ${item.intent}
Question: ${item.question}
Answer: ${item.answer}`
      })
      .join('\n\n')

    const personalization = displayName
      ? `The user's first name is ${displayName}. Address them naturally by name when it fits (not in every sentence).`
      : ''

    let historyText = ''
    if (Array.isArray(history) && history.length > 0) {
      historyText = 'Previous conversation:\n' + history.map((m: any) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n') + '\n\n'
    }

    const prompt = `
${SYSTEM_PROMPT}
${personalization}

Retrieved vehicle knowledge base:
${context}

${historyText}
Respond to the User's query based on the retrieved knowledge and previous conversation. If not found, use your general knowledge, but prioritize AutoCares guidance. Provide detailed and clear explanations.

User's query: ${message}
`

    // Retry logic for handling temporary 503 errors
    let response
    let attempts = 0
    const maxAttempts = 3
    const baseDelay = 1000 // 1 second

    while (attempts < maxAttempts) {
      try {
        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            temperature: 0.2,
          }
        })
        break // Success, exit retry loop
      } catch (error: any) {
        attempts++
        if (error?.error?.code === 503 && attempts < maxAttempts) {
          const delay = baseDelay * Math.pow(2, attempts - 1) // Exponential backoff
          console.warn(`[rag] Attempt ${attempts} failed with 503, retrying in ${delay}ms`)
          await new Promise(resolve => setTimeout(resolve, delay))
        } else {
          throw error // Re-throw if not 503 or max attempts reached
        }
      }
    }

    const answer =
      response?.text?.trim() ||
      'I can help. Please share your vehicle type and the exact symptom.'

    return NextResponse.json({
      answer,
      source: 'gemini-direct',
      matches: [], // Bypassing Supabase matching completely
    })
  } catch (error) {
    console.error('[rag] unexpected error:', error)
    return NextResponse.json({
      answer: getLocalAssistantResponse(userMessage),
      source: 'local_fallback',
      reason: 'Internal server error',
      matches: [],
    })
  }
}
