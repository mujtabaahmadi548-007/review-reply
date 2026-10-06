create table reviews (
  id uuid default gen_random_uuid() primary key,
  author_name text not null,
  rating smallint not null check (rating >= 1 and rating <= 5),
  comment text not null,
  status text default 'unanswered' not null,
  created_at timestamptz default now() not null
);

create table review_responses (
  id uuid default gen_random_uuid() primary key,
  review_id uuid references reviews(id) on delete cascade not null,
  response_text text not null,
  created_at timestamptz default now() not null
);
