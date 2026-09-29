-- Righ Events Supabase setup
create table if not exists public.profiles (id uuid primary key references auth.users(id) on delete cascade, full_name text, role text not null default 'customer' check (role in ('customer','admin')), created_at timestamptz not null default now());
create table if not exists public.events (id text primary key, name text not null, icon text, image text, active boolean not null default true, created_at timestamptz not null default now());
create table if not exists public.themes (id text primary key, event_id text not null references public.events(id) on delete cascade, name text not null, description text default '', price numeric(12,2) not null default 0, tag text default '', includes jsonb not null default '[]'::jsonb, image_url text default '', active boolean not null default true, created_at timestamptz not null default now());
create table if not exists public.theme_images (id uuid primary key default gen_random_uuid(), theme_id text not null references public.themes(id) on delete cascade, url text not null, sort_order integer not null default 0, created_at timestamptz not null default now());

alter table public.profiles enable row level security; alter table public.events enable row level security; alter table public.themes enable row level security; alter table public.theme_images enable row level security;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.profiles where id=auth.uid() and role='admin'); $$;
drop policy if exists "Public can view active events" on public.events; create policy "Public can view active events" on public.events for select using(active=true);
drop policy if exists "Admins manage events" on public.events; create policy "Admins manage events" on public.events for all using(public.is_admin()) with check(public.is_admin());
drop policy if exists "Public can view active themes" on public.themes; create policy "Public can view active themes" on public.themes for select using(active=true);
drop policy if exists "Admins manage themes" on public.themes; create policy "Admins manage themes" on public.themes for all using(public.is_admin()) with check(public.is_admin());
drop policy if exists "Public can view theme images" on public.theme_images; create policy "Public can view theme images" on public.theme_images for select using(exists(select 1 from public.themes t where t.id=theme_id and t.active=true));
drop policy if exists "Admins manage theme images" on public.theme_images; create policy "Admins manage theme images" on public.theme_images for all using(public.is_admin()) with check(public.is_admin());
drop policy if exists "Users read own profile" on public.profiles; create policy "Users read own profile" on public.profiles for select using(id=auth.uid() or public.is_admin());

insert into public.events(id,name,icon,image) values
('birthday','Birthday','🎂','https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=900&q=80'),('wedding','Wedding','💍','https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=900&q=80'),('engagement','Engagement','💐','https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80'),('house-warming','House Warming','🏠','https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80'),('baby-shower','Baby Shower','👶','https://images.unsplash.com/photo-1513159446162-54eb8bdaa79b?auto=format&fit=crop&w=900&q=80'),('naming','Naming Ceremony','✨','https://images.unsplash.com/photo-1464349153735-7db50ed83c84?auto=format&fit=crop&w=900&q=80'),('anniversary','Anniversary','❤️','https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=900&q=80'),('reception','Reception','🥂','https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=900&q=80'),('corporate','Corporate Event','🏢','https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=80'),('custom','Other / Custom Event','✨','https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80') on conflict(id) do update set name=excluded.name,icon=excluded.icon,image=excluded.image;

-- Create a PUBLIC Supabase Storage bucket named theme-images.
-- After creating your admin user in Authentication, run:
-- insert into public.profiles(id,full_name,role) values('AUTH_USER_UUID','Righ Events Admin','admin');
-- Storage policies:
drop policy if exists "Public view Righ theme images" on storage.objects;
drop policy if exists "Admin upload Righ theme images" on storage.objects;
drop policy if exists "Admin update Righ theme images" on storage.objects;
drop policy if exists "Admin delete Righ theme images" on storage.objects;
create policy "Public view Righ theme images" on storage.objects for select using(bucket_id='theme-images');
create policy "Admin upload Righ theme images" on storage.objects for insert to authenticated with check(bucket_id='theme-images' and public.is_admin());
create policy "Admin update Righ theme images" on storage.objects for update to authenticated using(bucket_id='theme-images' and public.is_admin());
create policy "Admin delete Righ theme images" on storage.objects for delete to authenticated using(bucket_id='theme-images' and public.is_admin());
