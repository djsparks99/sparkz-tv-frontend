# SPARKZ.TV Frontend

React/TypeScript frontend for the SPARKZ.TV live streaming platform.

## Setup

```bash
npm install
npm run dev
```

## Environment Variables

Create a `.env.local` file:

```
VITE_API_URL=https://sparkz-tv-d5ee412c7726.herokuapp.com
```

## Build for Production

```bash
npm run build
npm run preview
```

## Deployment to Vercel

1. Push code to GitHub
2. Go to vercel.com and import this repository
3. Set environment variable: `VITE_API_URL=https://sparkz-tv-d5ee412c7726.herokuapp.com`
4. Deploy!

## Features

- User authentication (sign up/login)
- Live stream creation and management
- Watch live streams with HLS player
- Real-time chat with emotes
- Follow and subscribe to streamers
- User profiles with bio and profile pictures
- Stream settings and stream key management
- Deep purple and cyan color scheme
