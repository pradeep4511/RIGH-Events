# Righ Events

React + Vite event decoration website for Righ Events.

## Customer flow
Home → Choose Event → Event Themes → Theme Details → Request Quote.

## Admin flow
Admin Login → Dashboard → Themes → Add/Edit/Delete Theme → Upload multiple photos → Set event + price.

## Local demo
If Supabase environment variables are not configured, `/admin/login` opens a **local demo admin** after clicking Login. Data and uploaded image previews are stored in that browser only. Do not deploy the demo mode as a production admin system.

## Production Supabase setup
1. Create a Supabase project.
2. Open SQL Editor and run `supabase-schema.sql`.
3. Create an admin user in Authentication → Users.
4. Copy that user's UUID and run the commented `profiles` insert in the SQL file with role `admin`.
5. Copy `.env.example` to `.env.local` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
6. Run `npm install` then `npm run dev`.
7. For Vercel, add the same two variables under Project Settings → Environment Variables and redeploy.

## Important
The production theme editor stores theme records in PostgreSQL and uploads photos to the `theme-images` Supabase Storage bucket. Customer pages read active events/themes from Supabase automatically.
