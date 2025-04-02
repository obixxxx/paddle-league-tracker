# Padel League Tracking System

A cutting-edge paddle league management platform that transforms player analytics and interaction through intelligent design and advanced technological integration.

## Features

- ELO-style player rating system (starting at 1500)
- Partnership chemistry metrics
- Power rankings
- Match tracking and history
- Performance visualization
- Historical trend analysis
- Player profile management
- Tournament organization and bracket generation

## Tech Stack

- **Frontend:** React with TypeScript
- **Styling:** Tailwind CSS
- **Backend:** Firebase Realtime Database
- **State Management:** React Context API with React Query
- **Routing:** Wouter for lightweight routing
- **Forms:** React Hook Form with Zod validation
- **UI Components:** Shadcn UI
- **Accessibility:** ARIA compliant with focus management
- **Error Handling:** Global error boundaries and toast notifications

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your Firebase project details

4. Start the development server:
   ```
   npm run dev
   ```

## Deployment to Vercel

### Environment Variables

Before deploying to Vercel, ensure you've set up the required environment variables:

1. In Vercel dashboard: Go to Project Settings → Environment Variables
2. Add the following environment variables:
   ```
   VITE_FIREBASE_API_KEY
   VITE_FIREBASE_AUTH_DOMAIN
   VITE_FIREBASE_DATABASE_URL
   VITE_FIREBASE_PROJECT_ID
   VITE_FIREBASE_STORAGE_BUCKET
   VITE_FIREBASE_MESSAGING_SENDER_ID
   VITE_FIREBASE_APP_ID
   ```

### Deployment Steps

1. Install Vercel CLI:
   ```
   npm i -g vercel
   ```

2. Login to Vercel:
   ```
   vercel login
   ```

3. Deploy to Vercel:
   ```
   vercel --prod
   ```

Alternatively, you can connect your GitHub repository to Vercel for automatic deployments.

## Project Structure

```
├── api/              # Serverless API functions for Vercel
├── client/           # Frontend React application
│   └── src/
│       ├── components/  # UI components
│       ├── hooks/       # Custom React hooks
│       ├── lib/         # Utility functions and services
│       ├── pages/       # Route components
│       └── services/    # API service layers
├── server/           # Express.js server for development
├── shared/           # Shared types and schemas
└── setup-scripts/    # Helper scripts for deployment
```

## Accessibility Features

- Keyboard navigation support
- Screen reader compatibility
- Focus management for modals and dialogs
- ARIA attributes for dynamic content
- Skip links for keyboard users
- Color contrast compliance