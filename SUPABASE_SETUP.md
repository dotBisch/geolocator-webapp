# Supabase Setup Guide

To enable the database features for GeoLocator, follow these steps:

## 1. Create a Supabase Project
Go to [Supabase](https://supabase.com/) and create a new project.

## 2. Get Credentials
Copy your **Project URL** and **anon public key** from the API settings.
Add them to your `.env` file:

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 3. Database Schema & Seeding

Run the following SQL in your Supabase SQL Editor to create the table and seed the test user.

### Step 3a: Create Tables
```sql
-- Create the search_history table
create table search_history (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table search_history enable row level security;

-- Create Policy: Users can only see their own history
create policy "Users can view their own history"
  on search_history for select
  using ( auth.uid() = user_id );

-- Create Policy: Users can insert their own history
create policy "Users can insert their own history"
  on search_history for insert
  with check ( auth.uid() = user_id );

-- Create Policy: Users can delete their own history
create policy "Users can delete their own history"
  on search_history for delete
  using ( auth.uid() = user_id );
```

### Step 3b: Seed Test User
You can run the contents of `supabase_seed.sql` to create the default user:
- **Email**: `admin@lamar.com`
- **Password**: `password123`

*(Copy the content of `supabase_seed.sql` and run it in the Supabase SQL Editor)*

## 4. Restart Development Server
After updating the `.env` file, restart your Vite server:

```bash
npm run dev
```
