# Angular Collaborative Editor (Firebase + WebRTC)

Companion project for [Building a Real-Time Collaborative Editor with Angular, Firebase, and WebRTC](https://omid.dev/2024/06/24/realtime-collaborative-editor-with-angular-firebase-webrtc/).

## Prerequisites

- Node.js 24+
- A Firebase project with **Anonymous Authentication** and **Cloud Firestore** enabled

## Setup

1. Copy `.env.example` values into `src/environments/environment.ts` (or paste your Firebase web app config directly).
2. Install dependencies:

```bash
npm install --legacy-peer-deps
```

3. In the Firebase console, enable Anonymous sign-in and create a Firestore database.

## Run

```bash
npm start
```

Open http://localhost:4200 in two tabs or browsers to test real-time Firestore sync.

## WebRTC

The project includes a `WebrtcService` and Firestore-based signaling scaffold matching the blog post. Peer connection wiring is a starting point for extending the tutorial.

## Blog post

https://omid.dev/2024/06/24/realtime-collaborative-editor-with-angular-firebase-webrtc/
