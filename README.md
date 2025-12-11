# GeoLocator

A modern geolocation tracking application built with React, Vite, and Leaflet. It features user authentication and search history persistence using Supabase.

## Features

- 📍 **IP Geolocation**: Track location details for any IP address.
- 🗺️ **Interactive Map**: Visual representation using Leaflet maps with custom pins.
- 🔐 **Authentication**: Secure Sign Up and Login using Supabase Auth.
- 📜 **History**: Saves your search history to the cloud (Supabase Database).
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile.

## Run Locally

**Prerequisites:** Node.js (v16 or higher)

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Create a `.env` file in the root directory and add your Supabase credentials.
   
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   
   > **Note:** See `SUPABASE_SETUP.md` for instructions on how to create the database schema and get these keys.

3. **Run the app**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Deploy on Vercel

The easiest way to deploy this app is to use [Vercel](https://vercel.com).

1. **Push to GitHub**: Ensure your project is pushed to a GitHub repository.

2. **Import to Vercel**:
   - Go to the Vercel Dashboard.
   - Click **"Add New..."** > **"Project"**.
   - Import your `GeoLocator` repository.

3. **Configure Project**:
   - **Framework Preset**: Vite (should be detected automatically).
   - **Build Command**: `vite build` (default).
   - **Output Directory**: `dist` (default).

4. **Environment Variables**:
   Expand the "Environment Variables" section and add the keys from your `.env` file:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

5. **Deploy**:
   Click **"Deploy"**. Vercel will build your app and provide you with a live URL.

---

*Built with React, TypeScript, Vite, Tailwind CSS, and Supabase.*
