# Firebase Setup for Nutrition Tracker App

This document provides instructions for setting up and deploying Firebase services for the Nutrition Tracker App.

## Prerequisites

1. Node.js and npm installed
2. Firebase CLI installed (`npm install -g firebase-tools`)
3. A Firebase project created at [Firebase Console](https://console.firebase.google.com/)

## Firebase Configuration

The app uses the following Firebase services:
- Firebase Authentication
- Cloud Firestore (database)
- Firebase Hosting (optional)

## Setting Up Firebase

1. Log in to Firebase CLI:
   ```
   firebase login
   ```

2. Initialize your project (if not already done):
   ```
   firebase init
   ```
   
   Select the following options:
   - Firestore
   - Authentication (optional)
   - Hosting (optional)

## Firestore Indexes

The app requires specific Firestore indexes for efficient querying. These are defined in `firestore.indexes.json`.

### Deploy Indexes

To deploy the required indexes:

```
firebase deploy --only firestore:indexes
```

This will create the following indexes:
- A composite index on `meals` collection for querying by `userId` and sorting by `createdAt` in descending order

### Index Deployment Status

You can check the status of your index deployments in the Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to Firestore Database
4. Click on the "Indexes" tab

Indexes may take a few minutes to fully build after deployment.

## Firestore Security Rules

The app includes Firestore security rules in `firestore.rules` that:
- Allow users to read and modify only their own data
- Restrict access to other users' data
- Allow authenticated users to read cached food data

To deploy the security rules:

```
firebase deploy --only firestore:rules
```

## Environment Variables

Create a `.env` file in the project root with your Firebase configuration:

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_USDA_API_KEY=your-usda-api-key
```

## Complete Deployment

To deploy everything at once:

```
firebase deploy
```

This will deploy:
- Firestore indexes
- Firestore security rules
- Hosting (if configured)

## Troubleshooting

### Missing Indexes
If you see errors like "The query requires an index" in the console:

1. Make sure you've deployed the indexes using the command above
2. Check the Firebase Console to ensure indexes are built (not still building)
3. If the error persists, you may need to modify `firestore.indexes.json` to include additional indexes

### Authentication Issues
If users cannot authenticate:

1. Ensure Authentication is enabled in Firebase Console
2. Check that you've enabled the appropriate auth providers (Email/Password, Google, etc.)
3. Verify your environment variables are correctly set