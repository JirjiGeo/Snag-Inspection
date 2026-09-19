# Deployment Guide: Employee Evaluations

This guide will help you deploy the Qbel Employee Evaluations app to GitHub and Supabase.

## Prerequisites

- GitHub account (https://github.com)
- Supabase account (https://supabase.com)
- Git installed on your computer

## Part 1: Set Up Supabase

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in/create an account
2. Click "New Project"
3. Fill in the project details:
   - **Name**: `qbel-employee-evaluations` (or your choice)
   - **Database Password**: Create a strong password and save it securely
   - **Region**: Select your region
4. Click "Create new project" and wait for it to initialize (2-3 minutes)

### Step 2: Get Your Supabase API Keys

1. Once your project is ready, go to **Settings** > **API**
2. Copy the following:
   - **Project URL**: This is your `SUPABASE_URL`
   - **Project API Key (anon, public)**: This is your `SUPABASE_ANON_KEY`

### Step 3: Set Up the Database

1. In your Supabase project, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the contents of `supabase-schema.sql`
4. Click "Run" to execute the schema

### Step 4: Configure Supabase Auth

1. Go to **Authentication** > **Providers**
2. Make sure **Email** provider is enabled (it should be by default)
3. Go to **URL Configuration**
4. Add your website URLs to the "Allowed Redirect URLs" list:
   - For local development: `http://localhost:8000`
   - For production: Your actual domain (e.g., `https://yourdomain.com`)

### Step 5: Create `supabase-config.js`

In your project folder, create a file named `supabase-config.js`:

```javascript
// Copy this file from supabase-config.js template
window.SUPABASE_CONFIG = {
  url: 'https://YOUR_PROJECT_REF.supabase.co',
  anonKey: 'YOUR_PUBLIC_ANON_KEY'
};
```

Replace:
- `YOUR_PROJECT_REF`: Your Supabase project reference (from the URL)
- `YOUR_PUBLIC_ANON_KEY`: The anon key you copied from API settings

## Part 2: Set Up GitHub

### Step 1: Create a GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click **New** (or the "+" icon)
3. Create a new repository:
   - **Repository name**: `employees-evaluation`
   - **Description**: "Employee evaluation system for Qbel"
   - **Public/Private**: Choose based on your needs
   - **Initialize with README**: Yes
4. Click "Create repository"

### Step 2: Push Your Code to GitHub

In your project folder, run these commands:

```bash
# Initialize git (if not already done)
git init

# Add remote (replace USERNAME and REPOSITORY_NAME)
git remote add origin https://github.com/USERNAME/employees-evaluation.git

# Create .gitignore to exclude sensitive files
echo "supabase-config.js" > .gitignore
echo "node_modules/" >> .gitignore
echo ".env" >> .gitignore

# Add all files
git add .

# Commit
git commit -m "Initial commit: Employee evaluation system with Supabase auth"

# Push to GitHub
git branch -M main
git push -u origin main
```

## Part 3: Deploy to Supabase (Hosting)

Supabase provides free static site hosting. Here's how:

### Step 1: Build Your Project (Optional)

Since this is a client-side app, no build step is needed. Skip to Step 2.

### Step 2: Deploy via Vercel (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign up with GitHub
2. Click "New Project"
3. Import your GitHub repository (`employees-evaluation`)
4. Add environment variables:
   - Create a `.env.local` file (don't commit this):
     ```
     VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
     VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
     ```
5. Click "Deploy"

Your app will be live at a Vercel URL!

### Alternative: Deploy to GitHub Pages

1. In your GitHub repo, go to **Settings** > **Pages**
2. Under "Source", select `main` branch
3. Your site will be available at `https://USERNAME.github.io/employees-evaluation`

## Part 4: Using the Application

### First Time Setup

1. Visit your deployed app
2. Click "Create an account"
3. Enter your email and password
4. Check your email for a confirmation link
5. Click the link to confirm your email
6. Return to the app and sign in

### Using the App

Once logged in:
- Add employees in the "Employees" section
- Create evaluations for each employee
- View department evaluation progress
- Export evaluations as PDF
- All data syncs with Supabase automatically

## Troubleshooting

### "Supabase not configured" error

Make sure `supabase-config.js` exists and has the correct API keys.

### Auth not working

1. Check that your app URL is in Supabase "Allowed Redirect URLs"
2. Verify the anon key is correct
3. Check browser console for error messages

### Data not syncing

1. Verify you have internet connection
2. Check that Row Level Security policies are enabled in Supabase
3. Clear browser cache and localStorage

## Support

For issues:
- **Supabase**: https://supabase.com/docs
- **GitHub**: https://docs.github.com
- **Vercel**: https://vercel.com/docs
