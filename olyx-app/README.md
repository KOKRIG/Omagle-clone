# Olyx.site - Random Video Chat Platform

A modern, secure video chat platform built with React, Supabase, and WebRTC. Connect with people worldwide through private peer-to-peer video calls.

## Features

### Core Features
- **Random Matching**: Instant connections with people worldwide
- **Live Video Chat**: High-quality peer-to-peer video calls
- **Live Text Chat**: Real-time messaging during video calls
- **Premium Filters**: Gender and region filters for paid users
- **Mobile-First Design**: Optimized for phones and tablets

### Security & Privacy
- **Peer-to-Peer Connections**: No server access to your video or audio
- **No Recording**: Video, audio, and messages are never stored
- **Device-Side NSFW Detection**: Privacy-focused content moderation
- **Anti-Bot Protection**: Detects and blocks automated users
- **Secure Authentication**: Email/password with Supabase Auth

### Smart Features
- **Automatic Quality Adjustment**: Adapts to your network speed
- **Echo Cancellation & Noise Suppression**: Crystal clear audio
- **Active Users Counter**: See how many people are online
- **Ban System**: Protects users from repeated violations
- **Match Count Tracking**: Smart gender ratio for free users (6:1)

## Technology Stack

- **Frontend**: React 18 + Vite
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Video**: WebRTC (peer-to-peer)
- **Deployment**: Netlify
- **Styling**: CSS3 with modern features

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Run Development Server
```bash
npm run dev
```

Visit http://localhost:5173

### 4. Build for Production
```bash
npm run build
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed Netlify deployment instructions.

Quick deploy:
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

## User Flows

### Registration & Login
1. User registers with email, password, name, gender, country
2. Security question set for password recovery
3. Login with email/password
4. Redirect to Home page

### Starting a Chat
1. Click "START CHAT" button
2. Grant camera/microphone permissions
3. System finds a match (2-3 seconds)
4. Redirect to Chat page
5. Video and text chat begins

### During a Chat
- See remote user's video (full screen)
- See your own video (small overlay)
- Send/receive text messages
- Toggle audio/video on/off
- Click "Skip" to find next match
- Click "Stop" to return home
- Click "Report" to report violations

### Free vs Premium

**Free Users**:
- Random matching (6 same-gender, 1 opposite-gender ratio)
- Random regions
- No filter control

**Premium Users**:
- Choose gender filter (Male/Female/Any)
- Choose region filter (US/Europe/Asia/Japan/Korea/Other)
- Priority in match queue

## Browser Support

- Chrome 90+ (Desktop & Android)
- Safari 14+ (Desktop & iOS)
- Firefox 88+
- Edge 90+

WebRTC and getUserMedia required.

## Safety Features

- NSFW detection (device-side, no images stored)
- Anti-bot protection
- Ban system for violations
- Secure peer-to-peer connections
- No recording or storage of media

## License

Proprietary - All rights reserved
