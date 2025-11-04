# How to Add Admin Role in Firebase

## ⚠️ Important

The Google Cloud IAM roles dialog is NOT related to your app's admin system. Those roles control Firebase project permissions, not your application user roles.

## Quick Steps (Using Firebase Console)

### 1. Get the User's UID

1. Go to **Firebase Console** → **Authentication** → **Users**
2. Find the user you want to make admin
3. Click on them and copy their **User UID** (e.g., `abc123def456...`)

### 2. Create/Update in Firestore

1. Go to **Firebase Console** → **Firestore Database**
2. Click **"Start collection"** if needed, or go to **"users"** collection
3. Click **"Add document"** (or click on existing document to edit)
4. Set the **Document ID** to the UID from step 1
5. Add fields:
   - `userId` (string) = same as document ID
   - `role` (string) = `"admin"` or `"propietary"`
6. Click **"Save"**

### 3. Verify

- The user should now see "Create Recipe" option in the side menu
- They can access `/admin/create-recipe` page

## Example Firestore Document

```
Collection: users
Document ID: k7fL8mNp3qR4sT5uVw6xY7zA8bC9dE

Fields:
  userId     (string): "k7fL8mNp3qR4sT5uVw6xY7zA8bC9dE"
  role       (string): "admin"
  createdAt  (timestamp): auto-generated
  updatedAt  (timestamp): auto-generated
```

## Using Code

### Option 1: Use AdminHelper Component (Easiest)

Add the AdminHelper component to any page (e.g., HomePage.js):

```javascript
import AdminHelper from "./AdminHelper";

// In your component
<AdminHelper />;
```

Then:

1. Log in to your app
2. Click "Make Me Admin" button
3. Refresh the page
4. Check if "Create Recipe" appears in the menu

**⚠️ Remember to remove AdminHelper from production builds!**

### Option 2: Browser Console

Open browser console and run:

```javascript
// You need to import these or use them from your app context
const makeMeAdmin = async () => {
  const userId = firebase.auth().currentUser.uid;
  await firestore.collection("users").doc(userId).set(
    {
      userId: userId,
      role: "admin",
    },
    { merge: true }
  );
  console.log("Done! Refresh the page.");
};

makeMeAdmin();
```

### Option 3: Using userService Functions

```javascript
import { userService } from "./firebase/services";
import { auth } from "./firebase/auth";

// After user logs in
const userId = auth.currentUser.uid;

// Create or update their profile
await userService.createUserProfile(userId, { role: "admin" });

// Or update existing profile
await userService.updateUserProfile(userId, { role: "admin" });
```

## Troubleshooting

### ✅ Correct Setup

- Document ID = User's Firebase Auth UID
- `userId` field matches document ID
- `role` field is exactly `"admin"` or `"propietary"` (lowercase)

### ❌ Common Mistakes

- Using the Google Cloud IAM roles dialog ❌
- Document ID doesn't match UID ❌
- Missing `userId` field ❌
- Wrong case: `"Admin"` instead of `"admin"` ❌

## Available Admin Functions

```javascript
import { userService } from "./firebase/services";

// Check if user is admin OR propietary (both have admin access)
const hasAdminAccess = await userService.isAdmin(userId);

// Check if user is specifically admin (not propietary)
const isAdminOnly = await userService.isAdminOnly(userId);

// Check if user is specifically propietary
const isPropietary = await userService.isPropietary(userId);

// Get user's role
const role = await userService.getUserRole(userId); // 'admin', 'propietary', or null
```
