# Medicine Availability Finder (Firebase + Vanilla JS)

A beginner-friendly cloud web app to search medicine availability in nearby stores, built with:

- HTML, CSS, JavaScript (Vanilla JS)
- Firebase Authentication (Email/Password)
- Firestore Database
- Firebase Storage
- Firebase Cloud Messaging (basic setup)
- Firebase Hosting

## Project Structure

```text
cloudproject/
  index.html
  dashboard.html
  firebase-messaging-sw.js
  firebase.json
  firestore.rules
  storage.rules
  css/
    styles.css
  js/
    firebase-config.js
    auth.js
    db.js
    app.js
  assets/
```

## Firestore Collection Design

Collection: `medicines`

- `medicine_name` (string)
- `medicine_name_lower` (string, used for search)
- `store_name` (string)
- `location` (string)
- `quantity` (number)
- `contact` (string)
- `image_url` (string)
- `created_by` (string)
- `created_at` (timestamp)

## Features Included

1. Signup/Login with Firebase Auth and input validation.
2. Redirect to dashboard after authentication.
3. Search medicine by name from Firestore with loading states.
4. Dynamic results rendering with medicine/store details.
5. Upload image to Firebase Storage and save image URL in Firestore.
6. Firebase Cloud Messaging setup (foreground/background basics).
7. Mock notification shown after adding a medicine.
8. Responsive UI with clean CSS (no frameworks).

## Setup Instructions

### 1) Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Create a new project.
3. Add a Web App to your project.
4. Enable these services:
   - Authentication -> Email/Password
   - Firestore Database
   - Storage
   - Cloud Messaging

### 2) Update Firebase Config

Open `js/firebase-config.js` and replace:

- `YOUR_API_KEY`
- `YOUR_PROJECT_ID`
- `YOUR_MESSAGING_SENDER_ID`
- `YOUR_APP_ID`

Open `firebase-messaging-sw.js` and replace the same values there.

### 3) Add VAPID Key for FCM

1. In Firebase Console -> Project Settings -> Cloud Messaging.
2. Generate Web Push key pair (if not available).
3. Copy public key.
4. Replace `YOUR_PUBLIC_VAPID_KEY` in `js/app.js`.

### 4) Run Locally

You can run with Firebase Hosting emulator or any static server.

#### Option A: Firebase Emulator

```bash
npm install -g firebase-tools
firebase login
firebase init
firebase emulators:start --only hosting
```

Open the local URL shown in terminal.

#### Option B: Simple static server (for quick UI testing)

Use any static file server and open `index.html`.

## Deploy to Firebase Hosting

```bash
firebase login
firebase init hosting
firebase deploy
```

If asked:

- Public directory: `.`
- Single-page app rewrite: `No`
- Overwrite `index.html`: `No`

## Recommended Firebase CLI Commands

Deploy Firestore and Storage rules:

```bash
firebase deploy --only firestore:rules,storage
```

Deploy hosting:

```bash
firebase deploy --only hosting
```

## Notes

- Firestore search uses `medicine_name_lower` for efficient prefix matching.
- If index errors appear, create index from Firebase console link shown in errors.
- FCM on web requires HTTPS (or localhost) for full support.



