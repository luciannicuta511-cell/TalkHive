# TalkHive - Multi-Device Chat App

## Quick Start

### Option 1: Run Locally (PC + Phone on Same Network)

```powershell
cd c:\Users\Admin\Desktop\site
powershell -ExecutionPolicy Bypass -File .\server.ps1
```

Then open:
- PC: http://localhost:3100/
- Phone: http://<YOUR_PC_IP>:3100/

### Option 2: Deploy to GitHub Pages (Recommended)

1. Create a GitHub repository named `talkhive`
2. Push these files to the `main` branch
3. Go to Settings → Pages → Source: `main` → Save
4. Your site will be available at `https://<yourusername>.github.io/talkhive/`

**Note:** Cross-device sync only works when on the same local network with Option 1, or by sharing the same online URL with Option 2.

### Option 3: Deploy to Netlify (Easy 1-click)

1. Connect your GitHub repo to Netlify
2. Deploy - it will be live in seconds
3. Share the public URL with anyone to sync messages

## Features

- ✅ User authentication (local storage)
- ✅ Multiple chat rooms
- ✅ Mute/Unmute users
- ✅ Admin controls & announcements  
- ✅ Block users
- ✅ Image sharing
- ✅ Owner moderation panel

## Troubleshooting

**"This site can't be reached"**
- If on Cloudflare Workers: Your worker might not be deployed. Try GitHub Pages instead (simpler)
- If local: Check that port 3100 is free and the PowerShell server is running

**Messages not syncing**
- Make sure both devices are on the same network (if running locally)
- Or both devices are accessing the same deployed URL (GitHub Pages / Netlify)

