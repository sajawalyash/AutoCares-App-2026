-- AutoCares Database Schema

-- Users Profile (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  first_name text,
  last_name text,
  full_name text generated always as (first_name || ' ' || last_name) stored,
  phone text,
  user_type text check (user_type in ('customer', 'mechanic')),
  vehicle_type text,
  vehicle_make text,
  vehicle_model text,
  vehicle_year integer,
  vehicle_plate text,
  avatar_url text,
  is_admin boolean default false,
  is_mechanic boolean default false,
  created_at timestamp with time zone default current_timestamp,
  updated_at timestamp with time zone default current_timestamp
);

-- Mechanics Profile
create table if not exists public.mechanics (
  id uuid primary key references auth.users(id) on delete cascade,
  business_name text not null,
  license_number text not null unique,
  phone text not null,
  latitude numeric,
  longitude numeric,
  rating numeric default 0,
  is_verified boolean default false,
  experience_years integer,
  avatar_url text,
  created_at timestamp with time zone default current_timestamp,
  updated_at timestamp with time zone default current_timestamp
);

-- Service Requests
create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mechanic_id uuid references auth.users(id) on delete set null,
  vehicle_type text not null,
  problem_description text not null,
  latitude numeric not null,
  longitude numeric not null,
  address text,
  image_url text,
  status text default 'pending',
  estimated_arrival timestamp with time zone,
  completed_at timestamp with time zone,
  rating integer,
  feedback text,
  created_at timestamp with time zone default current_timestamp,
  updated_at timestamp with time zone default current_timestamp
);

-- Chat Messages for Troubleshooting
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  message_text text not null,
  is_user_message boolean default true,
  vehicle_context text,
  created_at timestamp with time zone default current_timestamp
);

-- Chatbot Knowledge Base
create table if not exists public.chatbot_faq (
  id uuid primary key default gen_random_uuid(),
  vehicle_type text,
  question text not null,
  answer text not null,
  category text,
  created_at timestamp with time zone default current_timestamp,
  updated_at timestamp with time zone default current_timestamp
);

-- Service History
create table if not exists public.service_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mechanic_id uuid references auth.users(id) on delete set null,
  service_type text not null,
  description text,
  cost numeric,
  completed_at timestamp with time zone,
  rating integer,
  feedback text,
  created_at timestamp with time zone default current_timestamp
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.mechanics enable row level security;
alter table public.service_requests enable row level security;
alter table public.chat_messages enable row level security;
alter table public.chatbot_faq enable row level security;
alter table public.service_history enable row level security;

-- RLS Policies for profiles
create policy "Allow users to view their own profile" on public.profiles for select using (auth.uid() = id);
create policy "Allow users to update their own profile" on public.profiles for update using (auth.uid() = id);
create policy "Allow users to insert their own profile" on public.profiles for insert with check (auth.uid() = id);

-- RLS Policies for mechanics (public read)
create policy "Allow anyone to view mechanics" on public.mechanics for select using (true);
create policy "Allow mechanics to update their own profile" on public.mechanics for update using (auth.uid() = id);
create policy "Allow mechanics to insert their own profile" on public.mechanics for insert with check (auth.uid() = id);

-- RLS Policies for service_requests
create policy "Allow users to view their own requests" on public.service_requests for select using (auth.uid() = user_id or auth.uid() = mechanic_id);
create policy "Allow users to create requests" on public.service_requests for insert with check (auth.uid() = user_id);
create policy "Allow users to update their own requests" on public.service_requests for update using (auth.uid() = user_id or auth.uid() = mechanic_id);

-- RLS Policies for chat_messages
create policy "Allow users to view their own messages" on public.chat_messages for select using (auth.uid() = user_id);
create policy "Allow users to insert messages" on public.chat_messages for insert with check (auth.uid() = user_id);

-- RLS Policies for chatbot_faq (public read)
create policy "Allow anyone to view FAQ" on public.chatbot_faq for select using (true);

-- RLS Policies for service_history
create policy "Allow users to view their own history" on public.service_history for select using (auth.uid() = user_id or auth.uid() = mechanic_id);
create policy "Allow users to insert history" on public.service_history for insert with check (auth.uid() = user_id);

-- Insert sample FAQ data
insert into public.chatbot_faq (vehicle_type, question, answer, category) values
('all', 'Why does my vehicle not start?', 'Check the following: 1. Battery charge - ensure terminals are clean and connected. 2. Fuel level - make sure you have enough fuel. 3. Ignition system - check if the starter is working. 4. If the issue persists, call roadside assistance.', 'engine'),
('all', 'What should I do if my engine overheats?', 'Pull over safely and turn off the engine. Allow it to cool for at least 30 minutes. Check coolant levels (when cool). If overheating continues, you may have a leak or thermostat issue.', 'engine'),
('all', 'How do I fix a flat tire?', 'Use a tire repair kit or temporary seal. If not available: 1. Pull to a safe location. 2. Use your spare tire if you have one. 3. Call for roadside assistance.', 'tire'),
('bike', 'Why did my bike engine stop suddenly?', 'Check the following: 1. Fuel level - may have run out. 2. Battery connection - ensure terminals are secure. 3. Spark plug - may need replacement. 4. Allow engine to cool and restart.', 'engine'),
('car', 'Why is my car making a grinding noise?', 'A grinding noise usually indicates: 1. Worn brake pads. 2. Damaged brake rotor. Have a mechanic inspect the brakes.', 'brakes');