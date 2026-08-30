Cric360 / Auction Tracker — Render deploy
=========================================

1) Environment Variables (Render → Environment)
   Set these exact names (values from Firebase console):

   FIREBASE_API_KEY
   FIREBASE_AUTH_DOMAIN
   FIREBASE_PROJECT_ID
   FIREBASE_STORAGE_BUCKET
   FIREBASE_MESSAGING_SENDER_ID
   FIREBASE_APP_ID
   FIREBASE_MEASUREMENT_ID   (optional)

2) Build settings
   Build Command:     bash build.sh
   Publish Directory: ./

3) After first deploy
   Firebase → Authentication → Authorized domains
   Add your Render domain (example: your-app.onrender.com)

Notes
- HTML files no longer contain API keys in source.
- build.sh writes firebase-config.js at deploy time from env vars.
