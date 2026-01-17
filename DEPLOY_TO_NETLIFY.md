# Deploy Olyx.site to Netlify - Simple Guide

## Method 1: Using Netlify CLI (Recommended)

### Step 1: Install Netlify CLI
Open your terminal and run:
```bash
npm install -g netlify-cli
```

### Step 2: Login to Netlify
```bash
netlify login
```
This will open your browser. Sign in to Netlify or create a free account.

### Step 3: Navigate to Your Project
```bash
cd /tmp/cc-agent/62484706/project/olyx-app
```

### Step 4: Deploy
```bash
netlify deploy --prod
```

When prompted:
- **Create & configure a new site**: Yes
- **Team**: Select your team (or default)
- **Site name**: Choose a name (e.g., olyx-site-yourname)
- **Publish directory**: Type `dist` and press Enter

### Step 5: Set Environment Variables
After deployment, set your Supabase credentials:

```bash
netlify env:set VITE_SUPABASE_URL "https://ubhawcfbgrqucfgdukrp.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViaGF3Y2ZiZ3JxdWNmZ2R1a3JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0MDcyODUsImV4cCI6MjA4Mzk4MzI4NX0.LzxUn0zkWQAqCNwElVL_F7f91dC49-5ij2ZwTrx-IBE"
```

### Step 6: Redeploy with Environment Variables
```bash
netlify deploy --prod
```

### Done!
Your site is now live! The URL will be displayed in the terminal.

---

## Method 2: Using Netlify Dashboard

### Step 1: Create a Git Repository

First, initialize git and push to GitHub:

```bash
cd /tmp/cc-agent/62484706/project/olyx-app
git init
git add .
git commit -m "Initial commit: Olyx.site video chat app"
```

Create a new repository on GitHub, then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/olyx-site.git
git branch -M main
git push -u origin main
```

### Step 2: Connect to Netlify

1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **"GitHub"**
4. Select your repository (`olyx-site`)

### Step 3: Configure Build Settings

Netlify will auto-detect most settings, but verify:

- **Base directory**: `olyx-app` (or leave empty if repo root is olyx-app)
- **Build command**: `npm run build`
- **Publish directory**: `dist`

### Step 4: Add Environment Variables

Before deploying, click **"Show advanced"** and add:

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | `https://ubhawcfbgrqucfgdukrp.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViaGF3Y2ZiZ3JxdWNmZ2R1a3JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0MDcyODUsImV4cCI6MjA4Mzk4MzI4NX0.LzxUn0zkWQAqCNwElVL_F7f91dC49-5ij2ZwTrx-IBE` |

### Step 5: Deploy

Click **"Deploy site"**

Wait 2-3 minutes for the build to complete.

### Done!
Your site is live at the URL shown on your dashboard (e.g., `https://your-site-name.netlify.app`)

---

## Method 3: Manual Upload (Quick Test)

### Step 1: Build Locally
```bash
cd /tmp/cc-agent/62484706/project/olyx-app
npm install
npm run build
```

### Step 2: Upload to Netlify

1. Go to https://app.netlify.com/drop
2. Drag the `dist` folder to the upload area
3. Wait for upload to complete

### Step 3: Configure Environment Variables

1. After upload, click on your new site
2. Go to **Site settings** → **Environment variables**
3. Add:
   - `VITE_SUPABASE_URL`: `https://ubhawcfbgrqucfgdukrp.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViaGF3Y2ZiZ3JxdWNmZ2R1a3JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0MDcyODUsImV4cCI6MjA4Mzk4MzI4NX0.LzxUn0zkWQAqCNwElVL_F7f91dC49-5ij2ZwTrx-IBE`

### Step 4: Trigger Redeploy

1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Clear cache and deploy site"**

---

## After Deployment Checklist

Test these features on your live site:

- [ ] Site loads without errors
- [ ] Can register a new account
- [ ] Can login successfully
- [ ] Home page shows "Active now" counter
- [ ] Click "START CHAT" shows permission modal
- [ ] Can grant camera/microphone permissions
- [ ] Matchmaking works (finds users in queue)
- [ ] Video chat page loads
- [ ] Local video appears (your camera)
- [ ] Text chat input works
- [ ] Filter panel opens/closes
- [ ] Can logout

---

## Troubleshooting

### "Site shows blank page"
1. Open browser console (F12)
2. Look for errors mentioning Supabase
3. Verify environment variables are set correctly
4. Redeploy after adding variables

### "Build fails"
1. Check build logs in Netlify dashboard
2. Verify `package.json` has all dependencies
3. Make sure Node version is 18+

### "Video/audio not working"
1. Ensure site uses HTTPS (Netlify does this automatically)
2. Test in Chrome or Safari
3. Check browser permissions
4. Try a different device

### "Supabase connection fails"
1. Verify Supabase project is active
2. Check URL and key are correct
3. Ensure no extra spaces in environment variables

---

## Custom Domain (Optional)

To add your own domain:

1. Go to **Domain settings** in Netlify
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `olyx.site`)
4. Follow DNS configuration instructions
5. SSL certificate auto-generates

---

## Support

If you encounter issues:
1. Check browser console for JavaScript errors
2. Review Netlify build logs
3. Verify all environment variables are set
4. Ensure Supabase database migrations ran successfully

Your Olyx.site video chat platform should now be live and working!
