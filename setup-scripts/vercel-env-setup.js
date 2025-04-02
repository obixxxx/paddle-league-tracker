// This script helps with setting up Firebase environment variables in Vercel
// It generates the commands to properly configure the deployment

console.log(`
# Vercel Environment Variable Setup for Firebase

Use the following commands in your terminal to set up environment variables in Vercel.
You'll need to have the Vercel CLI installed (npm i -g vercel) and be logged in (vercel login).

After logging in, run these commands from the project root:

vercel env add VITE_FIREBASE_API_KEY
vercel env add VITE_FIREBASE_AUTH_DOMAIN
vercel env add VITE_FIREBASE_DATABASE_URL
vercel env add VITE_FIREBASE_PROJECT_ID
vercel env add VITE_FIREBASE_STORAGE_BUCKET
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID
vercel env add VITE_FIREBASE_APP_ID

# After setting up the environment variables, deploy with:
vercel --prod

# Alternatively, you can set environment variables in the Vercel dashboard:
# 1. Go to https://vercel.com/dashboard
# 2. Select your project
# 3. Go to Settings > Environment Variables
# 4. Add each variable with its corresponding value
`);