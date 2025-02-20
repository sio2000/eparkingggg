create table public.locations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  timestamp timestamptz default now(),
  created_at timestamptz default now(),
  user_email text
);

-- Enable RLS
alter table public.locations enable row level security;

-- Create policy for viewing locations
create policy "Locations are viewable by everyone"
  on locations for select
  using (true);

-- Create policy for inserting locations
create policy "Users can insert their own locations"
  on locations for insert
  with check (auth.uid() = user_id);

-- Create policy for deleting locations
create policy "Users can delete their own locations"
  on locations for delete
  using (auth.uid() = user_id);

-- Enable realtime
alter publication supabase_realtime add table locations; 