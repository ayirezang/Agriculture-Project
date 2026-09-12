# AgriConnect AI — Connected Frontend MVP

## Run on Windows

```powershell
cd "C:\Users\x1\OneDrive\Desktop\Project\frontend"
npm install
npm run dev -- --host
```

Use the Vite `Network:` address on a phone connected to the same Wi-Fi.

## What is now connected

- Frontend login with localStorage session
- Demo farmer login
- Sign out
- Sidebar navigation
- Topbar Ask Agent
- Global search + Ctrl/Cmd+K
- Notifications menu
- Profile/settings menu
- Marketplace search, crop filter, verified filter and buyer details
- Buyer registry search, trust profile and buyer registration
- AI Agent message sending and outreach draft
- Settings persistence
- LAN/Vite host configuration

## Important

Authentication is intentionally frontend-only for this MVP. It is not production security. Replace it with Firebase Auth, Supabase Auth or a secure backend before deployment.
