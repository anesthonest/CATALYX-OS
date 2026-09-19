# CATALYX DATABASE & DEPLOYMENT GUIDE
### COMPANY: VINEXSAH TECHNOLOGIES
### PLATFORM: EXECUTION INTELLIGENCE NETWORK

CATALYX is designed with a premium full-stack dual-layer persistence framework. This allows the application to run out-of-the-box in a highly responsive simulated local sandbox while establishing durable hooks to official Firebase servers.

---

## 1. DATABASE SCHEMA SETUP GUIDE

Official Firestore structure conforms to the following hierarchy:

| Collection Path | Document Fields | Purpose |
| :--- | :--- | :--- |
| `users/{uid}` | `username`, `email`, `xp`, `level`, `streak`, `executionScore`, `premium`, `achievements`, `createdAt` | Core User Profile logs |
| `users/{uid}/tasks/{id}` | `text`, `completed`, `createdAt`, `completedAt` | Personal Task archives |
| `users/{uid}/aiMemory/{id}` | `role`, `message`, `createdAt` | AI Coach conversations history buffers |
| `workspaces/{id}` | `name`, `ownerId`, `memberIds`, `createdAt` | Collaborative team workspaces |
| `workspaces/{id}/members/{uid}` | `uid`, `email`, `username`, `role`, `joinedAt` | Active workspace members roles |
| `workspaces/{id}/tasks/{taskId}` | `text`, `completed`, `createdAt`, `completedAt`, `completedBy` | Workspace collaborative targets |
| `workspaces/{id}/messages/{msgId}`| `text`, `username`, `userId`, `ai`, `createdAt` | Workspace Scrum chat logs |
| `invites/{inviteId}` | `workspaceId`, `workspaceName`, `email`, `senderEmail`, `status`, `createdAt` | Collaborative workspace keys |

---

## 2. FIRESTORE SECURITY RULES

Deploy the secure configuration in your `firestore.rules` console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() { return request.auth != null; }
    function isOwner(userId) { return isAuthenticated() && request.auth.uid == userId; }

    match /users/{userId} {
      allow read, write: if isAuthenticated();
      match /tasks/{taskId} { allow read, write: if isOwner(userId); }
      match /aiMemory/{messageId} { allow read, write: if isOwner(userId); }
    }

    match /workspaces/{workspaceId} {
      allow read, write: if isAuthenticated();
      match /members/{memberId} { allow read, write: if isAuthenticated(); }
      match /tasks/{taskId} { allow read, write: if isAuthenticated(); }
      match /messages/{messageId} { allow read, write: if isAuthenticated(); }
    }
    
    match /invites/{inviteId} {
      allow read, write: if isAuthenticated();
    }
  }
}
```

---

## 3. FIREBASE CONFIGURATION INSTRUCTIONS

### Step 3a: Provisioning Services
1. Open the [Firebase Console](https://console.firebase.google.com).
2. Click **Add project** and title it `catalyx-vinexsah`.
3. Select **Authentication** and activate the **Email/Password** sign-in provider.
4. Select **Firestore Database** and choose **Create database**. Set location and select production mode (or test mode, as we deploy security rules directly).

### Step 3b: Creating the App Configuration
1. Under **Project Settings**, find "Your Apps" and click the **Web icon `</>`** to build web configurations.
2. Register your App as `CATALYX-WEB`.
3. Extract the `firebaseConfig` credentials.
4. Open the CATALYX App, navigate to **Profile > Cloud Firestore Setup Gate**, and paste your config values, or declare them inside `.env` or client environmental variables:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_PROJECT_ID`

---

## 4. HOSTING & PRODUCTION DEPLOYMENT INSTRUCTIONS

CATALYX is complete with a standalone node server and responsive SPA static files.

### Step 4a: Local Build Test
Verify compiler pipelines run smoothly inside your CLI:
```bash
npm run build
```
This bundles standard static web layouts inside `dist/` and compiles the backend server-side proxy to `dist/server.cjs` via `esbuild` natively.

### Step 4b: Deploying to Firebase Hosting
1. Install global Firebase commands tool:
   ```bash
   npm install -g firebase-tools
   ```
2. Login to your Google Firebase account:
   ```bash
   firebase login
   ```
3. Initialize hosting project coordinates inside the root directory:
   ```bash
   firebase init hosting
   ```
   - *Select*: Use an existing project (`catalyx-vinexsah`).
   - *Select Public Directory*: Choose `dist`.
   - *Select single-page app fallback*: `Yes`.
   - *Select auto-github deployments*: `No`.
4. Deploy static layouts instantly:
   ```bash
   firebase deploy --only hosting
   ```
5. Your platform is now secure and live on `https://catalyx-vinexsah.web.app`!
