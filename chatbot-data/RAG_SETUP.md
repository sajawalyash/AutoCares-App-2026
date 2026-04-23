# AutoCares RAG Setup

## 1) Add environment variables

Set these in `.env.local`:

```
OPENAI_API_KEY=your_openai_api_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_VECTOR_RPC_FUNCTION=match_autocares_knowledge
RAG_SYNC_TOKEN=choose_any_secret_token
```

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` already exist in this project.

## 2) Create Supabase vector schema

Run this SQL in Supabase SQL editor:

- `scripts/003_chatbot_rag.sql`

## 3) Sync dataset to vector table

Call:

```
POST /api/chatbot/sync-knowledge
Header: x-rag-sync-token: <RAG_SYNC_TOKEN>
```

Example:

```bash
curl -X POST http://localhost:3000/api/chatbot/sync-knowledge \
  -H "x-rag-sync-token: your_token"
```

Expected response:

```json
{ "success": true, "synced": 30 }
```

## 4) Chatbot now uses RAG

`app/chatbot/page.tsx` calls:

- `POST /api/chatbot/rag`

This endpoint:
1. creates embedding for user message
2. runs Supabase vector RPC (`match_autocares_knowledge`)
3. sends top matches as context to OpenAI chat model
4. returns grounded answer to UI
