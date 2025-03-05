-- Drop existing table if it exists
drop table if exists public.parking_spots cascade;

-- Create new table
create table public.parking_spots (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  address text,
  is_active boolean default true,
  created_at timestamptz default now(),
  user_email text,
  size text default 'medium',
  is_accessible boolean default false
);

-- Enable RLS
alter table public.parking_spots enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Spots are viewable by everyone" on parking_spots;
drop policy if exists "Users can insert their own spots" on parking_spots;
drop policy if exists "Users can update their own spots" on parking_spots;

-- Create policies
create policy "Spots are viewable by everyone"
  on parking_spots for select
  using (true);

create policy "Users can insert their own spots"
  on parking_spots for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own spots"
  on parking_spots for update
  using (auth.uid() = user_id);

-- Enable realtime
alter publication supabase_realtime add table parking_spots; 