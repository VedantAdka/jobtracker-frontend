# Job Tracker - Frontend (Step 4)

## Prerequisites
- Node.js 18+ and npm
- The backend from steps 1-3 running on http://localhost:8080

## Setup
```
npm install
npm run dev
```
Then open http://localhost:5173

## What to test
1. Go to http://localhost:5173/register and create an account.
   You should land on /dashboard automatically (register auto-logs-in on the backend).
2. Refresh the page - you should stay logged in (the token lives in localStorage).
3. Click "Log out" - you should be sent back to /login.
4. Try visiting http://localhost:5173/dashboard directly while logged out -
   ProtectedRoute should bounce you to /login instead of showing the page.
5. Log back in at /login with the same credentials.

## If requests fail with a CORS error in the browser console
Make sure you're running the UPDATED backend (the SecurityConfig.java in this
step's backend zip adds CORS support for http://localhost:5173). If Vite
happens to start on a different port (e.g. 5174, because 5173 was busy),
update the allowed origin in SecurityConfig.java to match.
