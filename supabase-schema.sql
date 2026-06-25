-- Run this in your Supabase SQL editor

create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  address text not null,
  city text not null,
  landlord_name text,
  lat float,
  lng float,
  created_at timestamptz default now()
);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  property_id uuid references properties(id) on delete cascade,
  rating int check (rating between 1 and 5),
  rating_maintenance int check (rating_maintenance between 1 and 5),
  rating_communication int check (rating_communication between 1 and 5),
  rating_neighbors int check (rating_neighbors between 1 and 5),
  rating_value int check (rating_value between 1 and 5),
  text text,
  helpful_count int default 0,
  is_anonymous bool default true,
  created_at timestamptz default now()
);

create table if not exists review_tags (
  id uuid primary key default gen_random_uuid(),
  review_id uuid references reviews(id) on delete cascade,
  tag text not null
);

-- Enable Row Level Security (allow public reads, allow inserts)
alter table properties enable row level security;
alter table reviews enable row level security;
alter table review_tags enable row level security;

create policy "Public read properties" on properties for select using (true);
create policy "Public insert properties" on properties for insert with check (true);

create policy "Public read reviews" on reviews for select using (true);
create policy "Public insert reviews" on reviews for insert with check (true);

create policy "Public read review_tags" on review_tags for select using (true);
create policy "Public insert review_tags" on review_tags for insert with check (true);
