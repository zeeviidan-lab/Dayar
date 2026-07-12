-- Run once in Supabase → SQL Editor.
-- Adds a report counter to reviews so the "דווח" button actually persists
-- and flagged reviews surface in the /admin dashboard.

alter table reviews add column if not exists report_count int not null default 0;

-- Atomic increment used by /api/report-review (avoids read-modify-write races)
create or replace function increment_report(review_id uuid)
returns void
language sql
as $$
  update reviews set report_count = report_count + 1 where id = review_id;
$$;
