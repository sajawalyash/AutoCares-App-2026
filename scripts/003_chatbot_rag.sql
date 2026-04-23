-- AutoCares chatbot RAG schema (Supabase Postgres)
-- Run in Supabase SQL editor.

create extension if not exists vector;

create table if not exists public.autocares_knowledge (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  intent text not null,
  embedding vector(1536) not null,
  created_at timestamptz not null default now()
);

create unique index if not exists autocares_knowledge_question_uidx
  on public.autocares_knowledge (question);

create index if not exists autocares_knowledge_embedding_idx
  on public.autocares_knowledge
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create or replace function public.match_autocares_knowledge(
  query_embedding vector(1536),
  match_count int default 5,
  match_threshold float default 0.65
)
returns table (
  id uuid,
  question text,
  answer text,
  intent text,
  similarity float
)
language sql
stable
as $$
  select
    k.id,
    k.question,
    k.answer,
    k.intent,
    1 - (k.embedding <=> query_embedding) as similarity
  from public.autocares_knowledge k
  where 1 - (k.embedding <=> query_embedding) >= match_threshold
  order by k.embedding <=> query_embedding
  limit match_count;
$$;

grant usage on schema public to anon, authenticated, service_role;
grant select on public.autocares_knowledge to anon, authenticated, service_role;
grant execute on function public.match_autocares_knowledge(vector, int, float) to anon, authenticated, service_role;
