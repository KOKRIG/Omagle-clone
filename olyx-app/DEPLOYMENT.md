# Olyx.site - Netlify Deployment Guide

## Prerequisites

1. A Netlify account (free tier works)
2. Supabase project credentials
3. GitHub account (optional, but recommended)

## Deployment Steps

### Option 1: Deploy via Netlify CLI (Fastest)

1. Install Netlify CLI globally:
```bash
npm install -g netlify-cli
```

2. Login to Netlify:
```bash
netlify login
```

3. Deploy from the project directory:
```bash
cd olyx-app
netlify deploy --prod
```

4. When prompted:
   - **Publish directory**: `dist`
   - Follow the prompts to create a new site

5. Set environment variables in Netlify:
```bash
netlify env:set VITE_SUPABASE_URL "https://ubhawcfbgrqucfgdukrp.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViaGF3Y2ZiZ3JxdWNmZ2R1a3JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0MDcyODUsImV4cCI6MjA4Mzk4MzI4NX0.LzxUn0zkWQAqCNwElVL_F7f91dC49-5ij2ZwTrx-IBE"
```

6. Redeploy to apply environment variables:
```bash
netlify deploy --prod
```

### Option 2: Deploy via Netlify Dashboard

1. **Push to GitHub** (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Olyx.site video chat app"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Connect to Netlify**:
   - Go to https://app.netlify.com
   - Click "Add new site" → "Import an existing project"
   - Connect to your GitHub repository
   - Select the repository

3. **Configure Build Settings**:
   - **Base directory**: `olyx-app`
   - **Build command**: `npm run build`
   - **Publish directory**: `olyx-app/dist`

4. **Add Environment Variables**:
   - Go to Site settings → Environment variables
   - Add these variables:
     ```
     VITE_SUPABASE_URL=https://ubhawcfbgrqucfgdukrp.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InViaGF3Y2ZiZ3JxdWNmZ2R1a3JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0MDcyODUsImV4cCI6MjA4Mzk4MzI4NX0.LzxUn0zkWQAqCNwElVL_F7f91dC49-5ij2ZwTrx-IBE
     ```

5. **Deploy**:
   - Click "Deploy site"
   - Wait for the build to complete

### Option 3: Drag and Drop Deploy

1. Build the project locally:
   ```bash
   cd olyx-app
   npm install
   npm run build
   ```

2. Go to https://app.netlify.com/drop

3. Drag the `dist` folder to the upload area

4. After deployment, add environment variables:
   - Go to Site settings → Environment variables
   - Add the Supabase credentials
   - Trigger a redeploy

## Post-Deployment Configuration

### 1. Custom Domain (Optional)
- Go to Domain settings → Add custom domain
- Follow DNS configuration instructions

### 2. HTTPS
- HTTPS is automatically enabled by Netlify
- Certificate is auto-generated

### 3. Continuous Deployment
- If using GitHub integration, every push to main branch auto-deploys
- Can configure branch deploys and deploy previews

## Verification Checklist

After deployment, verify:

- [ ] Site loads correctly
- [ ] Can register a new account
- [ ] Can login
- [ ] Camera/microphone permissions work
- [ ] Video chat connects properly
- [ ] Text chat works
- [ ] Skip/Stop buttons function
- [ ] Filter panel appears
- [ ] Active users counter updates

## Troubleshooting

### Build fails
- Check that Node version is 18 or higher
- Verify all dependencies are in package.json
- Check build logs for specific errors

### Site loads but shows blank page
- Open browser console (F12)
- Check for JavaScript errors
- Verify environment variables are set correctly

### Supabase connection fails
- Verify VITE_SUPABASE_URL is correct
- Verify VITE_SUPABASE_ANON_KEY is correct
- Check Supabase project is active

### Video/Audio not working
- Ensure site is served over HTTPS
- Check browser permissions for camera/microphone
- Test in different browsers (Chrome, Safari, Firefox)

## Support

For issues or questions:
- Check browser console for errors
- Review Netlify build logs
- Verify Supabase database migrations ran successfully
