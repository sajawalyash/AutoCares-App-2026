import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { getLocalAssistantResponse } from '@/lib/chatbot-engine'
import { CHATBOT_KNOWLEDGE } from '@/lib/chatbot-knowledge'

const SYSTEM_PROMPT = `You are AutoCares AI Assistant.
Provide clear, practical, and safety-first vehicle guidance.
Use the provided knowledge when available to answer the user's query.
If the issue sounds urgent or unsafe, advise roadside assistance immediately.
Keep answers short and actionable.`

export async function POST(request: NextRequest) {
  let userMessage = ''
  try {
    const { message } = await request.json()
    userMessage = String(message || '')

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

    // Inject the entire local knowledge base directly into the prompt context
    const context = CHATBOT_KNOWLEDGE
      .map((item, index) => {
        return `#${index + 1}
Intent: ${item.intent}
Question: ${item.question}
Answer: ${item.answer}`
      })
      .join('\n\n')

    const prompt = `
${SYSTEM_PROMPT}

Retrieved vehicle knowledge base:
${context}

Respond to the User's query based on the retrieved knowledge. If not found, use your general knowledge, but prioritize AutoCares guidance.

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
