import fs from 'node:fs/promises'
import path from 'node:path'
import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

type KnowledgeRow = {
  question: string
  answer: string
  intent: string
}

function parseJsonlRows(jsonl: string): KnowledgeRow[] {
  return jsonl
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line))
    .map((row) => ({
      question: String(row.question || '').trim(),
      answer: String(row.answer || '').trim(),
      intent: String(row.intent || '').trim(),
    }))
    .filter((row) => row.question && row.answer && row.intent)
}

export async function POST(request: NextRequest) {
  try {
    const syncToken = process.env.RAG_SYNC_TOKEN
    if (syncToken) {
      const provided = request.headers.get('x-rag-sync-token')
      if (provided !== syncToken) {
        return NextResponse.json({ error: 'Unauthorized sync request' }, { status: 401 })
      }
    }

    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY is not configured' }, { status: 500 })
    }

    const knowledgeFile = path.join(process.cwd(), 'chatbot-data', 'autocares_rag.jsonl')
    const raw = await fs.readFile(knowledgeFile, 'utf-8')
    const rows = parseJsonlRows(raw)

    if (!rows.length) {
      return NextResponse.json({ error: 'No rows found in dataset' }, { status: 400 })
    }

    const openai = new OpenAI({ apiKey: openaiApiKey })
    const supabase = createAdminClient()

    for (const row of rows) {
      const text = `Question: ${row.question}\nAnswer: ${row.answer}`
      const embedding = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      })

      const vector = embedding.data[0]?.embedding
      if (!vector) continue

      const { error } = await supabase.from('autocares_knowledge').upsert(
        {
          question: row.question,
          answer: row.answer,
          intent: row.intent,
          embedding: vector,
        },
        {
          onConflict: 'question',
        }
      )

      if (error) {
        console.error('[sync-knowledge] upsert error:', error)
      }
    }

    return NextResponse.json({ success: true, synced: rows.length })
  } catch (error) {
    console.error('[sync-knowledge] unexpected error:', error)
    return NextResponse.json({ error: 'Knowledge sync failed' }, { status: 500 })
  }
}
