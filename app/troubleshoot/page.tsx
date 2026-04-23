'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Send, ArrowLeft, Loader2 } from 'lucide-react'

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

const faqData = {
  'car engine': 'Check battery charge - ensure terminals are clean and connected. Check fuel level - make sure you have enough fuel. Check ignition system - verify the starter is working.',
  'bike engine stop': 'Check fuel level - may have run out. Check battery connection - ensure terminals are secure. Check spark plug - may need replacement. Allow engine to cool and restart.',
  'flat tire': 'Use a tire repair kit or temporary seal if available. Pull to a safe location and use your spare tire. Never drive on a flat tire as it damages the wheel rim.',
  'engine overheat': 'Pull over safely and turn off the engine. Allow it to cool for at least 30 minutes. Check coolant levels when cool. Do not drive further without professional inspection.',
  'grinding noise': 'A grinding noise usually indicates worn brake pads or damaged brake rotor. Have a mechanic inspect the brakes immediately.',
  'check engine light': 'This indicates a problem with the engine, emissions, or transmission. You can usually drive to a mechanic, but it should be checked soon.',
  'default': 'I understand your concern. Can you describe the problem more specifically? What sounds or symptoms is your vehicle showing? This will help me provide better guidance.'
}

export default function TroubleshootPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hi! I\'m AutoCares AI Assistant. Tell me what\'s wrong with your vehicle, and I\'ll help you diagnose the issue.',
      isUser: false,
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const findAnswer = (question: string): string => {
    const lowerQuestion = question.toLowerCase()
    for (const [key, answer] of Object.entries(faqData)) {
      if (key !== 'default' && lowerQuestion.includes(key)) {
        return answer
      }
    }
    return faqData.default
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isUser: true,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse = findAnswer(input)
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
      setLoading(false)
    }, 500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Button 
            onClick={() => router.back()}
            variant="ghost"
            size="icon"
            className="text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">AI Troubleshooting</h1>
            <p className="text-sm text-gray-600">Describe your vehicle issue</p>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs sm:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${
                message.isUser
                  ? 'bg-purple-600 text-white rounded-br-none'
                  : 'bg-white text-gray-900 shadow-md rounded-bl-none border border-gray-200'
              }`}
            >
              <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                {message.text}
              </p>
              <p className={`text-xs mt-2 ${
                message.isUser ? 'text-purple-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-900 shadow-md rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">AI is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your vehicle issue..."
              disabled={loading}
              className="flex-1 rounded-full border-gray-300 focus:border-purple-500 focus:ring-purple-500"
            />
            <Button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-0 w-10 h-10"
              size="icon"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Pro tip: Ask about specific symptoms like "engine won't start", "strange noise", or "tire flat"
          </p>
        </div>
      </div>
    </main>
  )
}
