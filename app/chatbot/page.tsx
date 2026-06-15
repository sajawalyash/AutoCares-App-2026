'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { getSessionOrClearToken, supabase } from '@/lib/supabase/client'
import { getLocalAssistantResponse } from '@/lib/chatbot-engine'
import {
  buildChatWelcomeMessage,
  getUserDisplayName,
} from '@/lib/user-display-name'
import {
  AiChatInterface,
  type ChatMessage,
} from '@/components/chatbot/ai-chat-interface'

const WELCOME_MESSAGE_ID = 'welcome'

export default function Chatbot() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [userName, setUserName] = useState('there')
  const [authReady, setAuthReady] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: WELCOME_MESSAGE_ID,
      type: 'bot',
      content: buildChatWelcomeMessage('there'),
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const loadUserContext = useCallback(async () => {
    const session = await getSessionOrClearToken()
    if (!session) {
      router.push('/auth/login')
      return
    }

    const currentUser = session.user
    setUser(currentUser)

    const { data: profile } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', currentUser.id)
      .maybeSingle()

    const displayName = getUserDisplayName(currentUser, profile)
    setUserName(displayName)
    setAuthReady(true)
  }, [router])

  useEffect(() => {
    void loadUserContext()
  }, [loadUserContext])

  useEffect(() => {
    if (!authReady || userName === 'there') return

    setMessages((prev) => {
      const welcome = prev.find((m) => m.id === WELCOME_MESSAGE_ID)
      if (!welcome) return prev

      const personalized = buildChatWelcomeMessage(userName)
      if (welcome.content === personalized) return prev

      return prev.map((m) =>
        m.id === WELCOME_MESSAGE_ID ? { ...m, content: personalized } : m,
      )
    })
  }, [authReady, userName])

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return

    const messageText = input.trim()
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chatbot/rag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          userName,
          history: messages.slice(-10).map((m) => ({
            role: m.type,
            content: m.content,
          })),
        }),
      })

      let ragAnswer = ''
      if (response.ok) {
        const data = await response.json()
        ragAnswer = data.answer || ''
      } else {
        let apiError = 'Unknown error'
        try {
          const errorData = await response.json()
          apiError = errorData?.error || apiError
        } catch {
          // Ignore parse failures and use fallback response.
        }
        console.warn('[chatbot] RAG unavailable, using local fallback:', apiError)
      }

      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: ragAnswer || getLocalAssistantResponse(messageText),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])
    } catch (error) {
      console.error('[chatbot] Falling back to local response:', error)
      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: getLocalAssistantResponse(messageText),
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])
    } finally {
      setLoading(false)
    }
  }

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-purple-50 to-white">
        <div className="size-10 animate-spin rounded-full border-2 border-purple-200 border-t-purple-600" />
      </div>
    )
  }

  return (
    <AiChatInterface
      userName={userName}
      userAvatarUrl={user?.user_metadata?.avatar_url ?? null}
      messages={messages}
      input={input}
      loading={loading}
      onInputChange={setInput}
      onSend={() => void handleSendMessage()}
      onBack={() => router.back()}
    />
  )
}
