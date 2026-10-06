create table business_settings (
  id uuid default gen_random_uuid() primary key,
  business_name text not null,
  support_email text not null,
  tone_preset text not null default 'Professional',
  custom_instructions text,
  updated_at timestamptz default now() not null
);
