'use client'

import Image from 'next/image'
import { useRef, useEffect } from 'react'
import { ArrowLeft, Send, Loader2, User, Sparkles } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ChatMessage {
  id: string
  type: 'user' | 'bot'
  content: string
  timestamp: Date
}

interface AiChatInterfaceProps {
  userName: string
  userAvatarUrl?: string | null
  messages: ChatMessage[]
  input: string
  loading: boolean
  onInputChange: (value: string) => void
  onSend: () => void
  onBack: () => void
}

function formatMessageTime(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function BotAvatar({
  className,
  size = 'md',
}: {
  className?: string
  size?: 'md' | 'lg'
}) {
  return (
    <div
      className={cn(
        'relative shrink-0 overflow-hidden rounded-full',
        size === 'lg' ? 'size-12 sm:size-14' : 'size-10 sm:size-11',
        className,
      )}
    >
      <Image
        src="/icons/Aichat.webp"
        alt="AutoCares AI"
        fill
        sizes={size === 'lg' ? '56px' : '44px'}
        className="object-cover"
        priority={size === 'lg'}
      />
    </div>
  )
}

function UserAvatar({
  userName,
  avatarUrl,
  className,
}: {
  userName: string
  avatarUrl?: string | null
  className?: string
}) {
  const initial = userName?.[0]?.toUpperCase() || 'U'

  return (
    <Avatar
      className={cn(
        'size-9 shrink-0 shadow-md ring-2 ring-white',
        className,
      )}
    >
      {avatarUrl ? (
        <AvatarImage src={avatarUrl} alt={userName} className="object-cover" />
      ) : null}
      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-indigo-600 text-sm font-semibold text-white">
        {avatarUrl ? initial : <User className="size-4" strokeWidth={2.5} />}
      </AvatarFallback>
    </Avatar>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5">
      <BotAvatar />
      <div className="rounded-2xl rounded-bl-md border border-purple-100/80 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="size-2 animate-bounce rounded-full bg-purple-400 [animation-delay:0ms]" />
          <span className="size-2 animate-bounce rounded-full bg-purple-400 [animation-delay:150ms]" />
          <span className="size-2 animate-bounce rounded-full bg-purple-400 [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  )
}

function MessageBubble({
  message,
  userName,
  userAvatarUrl,
}: {
  message: ChatMessage
  userName: string
  userAvatarUrl?: string | null
}) {
  const isUser = message.type === 'user'

  return (
    <div
      className={cn(
        'flex w-full animate-in fade-in-0 slide-in-from-bottom-2 duration-300',
        isUser ? 'justify-end' : 'justify-start',
      )}
    >
      <div
        className={cn(
          'flex max-w-[min(100%,28rem)] items-end gap-2.5 sm:max-w-[32rem]',
          isUser ? 'flex-row-reverse' : 'flex-row',
        )}
      >
        {isUser ? (
          <UserAvatar userName={userName} avatarUrl={userAvatarUrl} />
        ) : (
          <BotAvatar />
        )}

        <div className={cn('min-w-0 flex-1', isUser ? 'items-end text-right' : 'items-start')}>
          <p
            className={cn(
              'mb-1 text-xs font-medium',
              isUser ? 'text-purple-700' : 'text-gray-500',
            )}
          >
            {isUser ? userName : 'AutoCares AI'}
          </p>
          <div
            className={cn(
              'inline-block px-4 py-3 text-left text-sm leading-relaxed shadow-sm',
              isUser
                ? 'rounded-2xl rounded-br-md bg-gradient-to-br from-purple-600 to-violet-600 text-white'
                : 'rounded-2xl rounded-bl-md border border-gray-100 bg-white text-gray-800',
            )}
          >
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          </div>
          <p className="mt-1.5 text-[11px] text-gray-400">
            {formatMessageTime(message.timestamp)}
          </p>
        </div>
      </div>
    </div>
  )
}

export function AiChatInterface({
  userName,
  userAvatarUrl,
  messages,
  input,
  loading,
  onInputChange,
  onSend,
  onBack,
}: AiChatInterfaceProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-purple-50 via-white to-purple-50/80">
      <header className="sticky top-0 z-40 border-b border-purple-100/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={onBack}
            className="rounded-xl p-2 text-gray-600 transition hover:bg-purple-50 hover:text-purple-700"
            aria-label="Go back"
          >
            <ArrowLeft className="size-5" />
          </button>

          <div className="flex min-w-0 flex-1 items-center gap-3">
            <BotAvatar size="lg" />
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-bold text-gray-900">
                Hello, {userName}
              </h1>
              <p className="flex items-center gap-1.5 truncate text-sm text-gray-500">
                <Sparkles className="size-3.5 shrink-0 text-purple-500" />
                AI Vehicle Assistant
                <span className="text-gray-300">·</span>
                <span className="inline-flex items-center gap-1 text-emerald-600">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  Online
                </span>
              </p>
            </div>
          </div>

          <UserAvatar userName={userName} avatarUrl={userAvatarUrl} className="hidden sm:flex" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="space-y-6">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              userName={userName}
              userAvatarUrl={userAvatarUrl}
            />
          ))}
          {loading && <TypingIndicator />}
          <div ref={messagesEndRef} className="h-1" />
        </div>
      </main>

      <footer className="sticky bottom-0 border-t border-purple-100/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              onSend()
            }}
            className="flex items-center gap-2 rounded-2xl border border-purple-100 bg-gray-50/80 p-1.5 shadow-sm focus-within:border-purple-300 focus-within:ring-2 focus-within:ring-purple-100"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              placeholder={`Ask anything, ${userName}...`}
              disabled={loading}
              className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 disabled:opacity-60"
            />
            <Button
              type="submit"
              disabled={loading || !input.trim()}
              size="icon"
              className="size-10 shrink-0 rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
              aria-label="Send message"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </form>
          <p className="mt-2 text-center text-xs text-gray-400">
            For urgent roadside help, use SOS from your dashboard.
          </p>
        </div>
      </footer>
    </div>
  )
}
