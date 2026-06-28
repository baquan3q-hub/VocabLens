create extension if not exists pgcrypto;

create table public.vocabulary_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  term text not null,
  normalized_term text not null,
  phonetic text not null default '',
  audio_url text,
  definitions jsonb not null default '[]'::jsonb,
  translation_vi text not null,
  synonyms text[] not null default '{}',
  antonyms text[] not null default '{}',
  examples text[] not null default '{}',
  review_score smallint not null default 0 check (review_score between 0 and 5),
  last_reviewed_at timestamptz,
  next_review_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vocabulary_items_user_term_unique unique(user_id, normalized_term)
);

create table public.word_occurrences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vocabulary_item_id uuid not null references public.vocabulary_items(id) on delete cascade,
  context_sentence text not null default '',
  source_url text not null,
  source_title text not null default '',
  created_at timestamptz not null default now()
);

create type public.review_outcome as enum ('remembered', 'forgotten');
create table public.review_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  vocabulary_item_id uuid not null references public.vocabulary_items(id) on delete cascade,
  outcome public.review_outcome not null,
  previous_score smallint not null check (previous_score between 0 and 5),
  new_score smallint not null check (new_score between 0 and 5),
  interval_days integer not null default 0,
  reviewed_at timestamptz not null default now()
);

create table public.quiz_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null default 'mixed' check (mode in ('word-to-meaning', 'meaning-to-word', 'mixed')),
  score integer not null check (score >= 0),
  total integer not null check (total > 0 and score <= total),
  created_at timestamptz not null default now()
);

create table public.quiz_answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  quiz_session_id uuid not null references public.quiz_sessions(id) on delete cascade,
  vocabulary_item_id uuid references public.vocabulary_items(id) on delete set null,
  prompt text not null,
  selected_answer text not null,
  correct_answer text not null,
  is_correct boolean not null,
  response_ms integer check (response_ms is null or response_ms >= 0),
  created_at timestamptz not null default now()
);

create table public.lookup_cache (
  normalized_term text primary key,
  payload jsonb not null,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);

create index vocabulary_items_user_next_review_idx on public.vocabulary_items(user_id, next_review_at);
create index vocabulary_items_user_created_idx on public.vocabulary_items(user_id, created_at desc);
create index word_occurrences_item_created_idx on public.word_occurrences(vocabulary_item_id, created_at desc);
create index review_events_user_reviewed_idx on public.review_events(user_id, reviewed_at desc);
create index quiz_sessions_user_created_idx on public.quiz_sessions(user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger vocabulary_items_set_updated_at
before update on public.vocabulary_items
for each row execute function public.set_updated_at();

alter table public.vocabulary_items enable row level security;
alter table public.word_occurrences enable row level security;
alter table public.review_events enable row level security;
alter table public.quiz_sessions enable row level security;
alter table public.quiz_answers enable row level security;
alter table public.lookup_cache enable row level security;

create policy "users read own vocabulary" on public.vocabulary_items for select to authenticated using ((select auth.uid()) = user_id);
create policy "users insert own vocabulary" on public.vocabulary_items for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "users update own vocabulary" on public.vocabulary_items for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "users delete own vocabulary" on public.vocabulary_items for delete to authenticated using ((select auth.uid()) = user_id);

create policy "users read own occurrences" on public.word_occurrences for select to authenticated using ((select auth.uid()) = user_id);
create policy "users insert own occurrences" on public.word_occurrences for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "users delete own occurrences" on public.word_occurrences for delete to authenticated using ((select auth.uid()) = user_id);

create policy "users read own reviews" on public.review_events for select to authenticated using ((select auth.uid()) = user_id);
create policy "users insert own reviews" on public.review_events for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "users read own quiz sessions" on public.quiz_sessions for select to authenticated using ((select auth.uid()) = user_id);
create policy "users insert own quiz sessions" on public.quiz_sessions for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "users read own quiz answers" on public.quiz_answers for select to authenticated using ((select auth.uid()) = user_id);
create policy "users insert own quiz answers" on public.quiz_answers for insert to authenticated with check ((select auth.uid()) = user_id);

-- lookup_cache has no client policy by design. Only the server secret key can access it.
