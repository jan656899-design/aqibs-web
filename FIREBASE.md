# Real SMS OTP for AQIB'S WEB

GitHub Pages is static. **Twilio / Fast2SMS API keys cannot live in this repo** — anyone could steal them and send SMS on your bill. Firebase Phone Auth is the secure path: Google sends the SMS.

Google’s SMS code is **6 digits**. A custom 4-digit code would need your own paid gateway + a secret server.

## One-time setup

1. Open [Firebase Console](https://console.firebase.google.com) → add a project (or use an existing one).
2. Build → **Authentication** → Get started → **Sign-in method** → enable **Phone**.
3. Project settings → Your apps → **Web** → register `AQIB'S WEB`.
4. Copy the config into [`firebase-config.js`](firebase-config.js):

```js
export const firebaseConfig = {
  apiKey: "AIza…",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app",
  appId: "1:…:web:…",
};
```

5. Authentication → Settings → **Authorized domains** → add:

   `jan656899-design.github.io`

6. Commit and push. After Pages rebuilds, **Send OTP** texts a real code to `+91` + the 10-digit number.

## Test numbers (no SMS spend)

Authentication → Sign-in method → Phone → **Phone numbers for testing**.  
Add e.g. `+919876543210` with a fixed code `123456`.

## Billing

Phone Auth needs the Blaze plan after the free SMS quota. Spark-only projects cannot send live SMS.
