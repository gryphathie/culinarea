# Firebase Setup Guide for Culinarea App

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "culinarea")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## 2. Add a Web App to Your Project

1. In your Firebase project dashboard, click the web icon (`</>`)
2. Enter your app nickname (e.g., "culinarea-web")
3. Choose whether to set up Firebase Hosting (optional)
4. Click "Register app"
5. Copy the Firebase configuration object

## 3. Configure Environment Variables

1. Copy the `firebase.env.example` file to `.env.local`:
   ```bash
   cp firebase.env.example .env.local
   ```

2. Replace the placeholder values in `.env.local` with your actual Firebase config:
   ```env
   REACT_APP_FIREBASE_API_KEY=your_actual_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_actual_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
   REACT_APP_FIREBASE_APP_ID=your_actual_app_id
   REACT_APP_FIREBASE_MEASUREMENT_ID=your_actual_measurement_id
   ```

## 4. Enable Firebase Services

### Authentication
1. In Firebase Console, go to "Authentication" > "Sign-in method"
2. Enable "Email/Password" provider
3. Optionally enable "Google" provider for social login

### Firestore Database
1. Go to "Firestore Database" > "Create database"
2. Choose "Start in test mode" (for development)
3. Select a location for your database
4. Click "Done"

### Storage (Required for Image Uploads)
1. Go to "Storage" > "Get started"
2. Choose "Start in test mode" (for development)
3. Select a location for your storage
4. Click "Done"

**Important: Configure CORS for Storage**
Firebase Storage requires CORS configuration to allow image uploads from web browsers. You need to set up CORS rules for your storage bucket.

#### Option 1: Using gsutil (Recommended)
1. Install Google Cloud SDK if you haven't already:
   - Download from: https://cloud.google.com/sdk/docs/install
   - Or install via Homebrew (Mac): `brew install google-cloud-sdk`
   
2. Authenticate with Google Cloud:
   ```bash
   gcloud auth login
   ```

3. Create a CORS configuration file named `cors.json`:
   ```json
   [
     {
       "origin": ["http://localhost:3000", "http://localhost:3001", "https://your-production-domain.com"],
       "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
       "maxAgeSeconds": 3600,
       "responseHeader": ["Content-Type", "Authorization"]
     }
   ]
   ```

4. Apply the CORS configuration to your storage bucket:
   ```bash
   gsutil cors set cors.json gs://YOUR_STORAGE_BUCKET_NAME
   ```
   Replace `YOUR_STORAGE_BUCKET_NAME` with your actual bucket name (usually `your-project-id.appspot.com`)

#### Option 2: Using Firebase Console (Limited)
Unfortunately, Firebase Console doesn't provide a direct UI for CORS configuration. You'll need to use gsutil (Option 1) or the Google Cloud Console.

#### Option 3: Using Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Navigate to "Cloud Storage" > "Buckets"
4. Click on your storage bucket
5. Go to the "Configuration" tab
6. Scroll to "CORS configuration"
7. Click "Edit CORS configuration"
8. Add the following JSON:
   ```json
   [
     {
       "origin": ["http://localhost:3000", "http://localhost:3001", "https://your-production-domain.com"],
       "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
       "maxAgeSeconds": 3600,
       "responseHeader": ["Content-Type", "Authorization"]
     }
   ]
   ```
9. Click "Save"

**Note:** Make sure to add your production domain when you deploy your app!

## 5. Security Rules (Important!)

### Firestore Rules
Update your Firestore rules in "Firestore Database" > "Rules":
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to authenticated users
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Allow public read access to recipes
    match /recipes/{recipeId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Storage Rules
Update your Storage rules in "Storage" > "Rules":
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 6. Usage Examples

### Using Authentication
```javascript
import { authService } from './firebase/auth';

// Sign up a new user
const user = await authService.signUp('user@example.com', 'password123', 'John Doe');

// Sign in
const user = await authService.signIn('user@example.com', 'password123');

// Sign out
await authService.signOut();
```

### Using Firestore
```javascript
import { recipeService } from './firebase/services';

// Get all recipes
const recipes = await recipeService.getAllRecipes();

// Get recipes by type
const saltyRecipes = await recipeService.getRecipesByType('salty');

// Create a new recipe
const newRecipe = await recipeService.createRecipe({
  title: 'Pasta Carbonara',
  type: 'salty',
  difficulty: 'beginner',
  ingredients: ['pasta', 'eggs', 'cheese'],
  instructions: 'Cook pasta...'
});
```

## 7. Testing Your Setup

1. Start your React app: `npm start`
2. Check the browser console for any Firebase errors
3. Test authentication and database operations

## 8. Production Considerations

- Update security rules for production
- Set up proper environment variables
- Consider using Firebase Hosting for deployment
- Set up monitoring and analytics

## Troubleshooting

### Common Issues

#### CORS Errors When Uploading Images
If you see errors like "Access to XMLHttpRequest... blocked by CORS policy" when uploading images:
1. **Verify CORS is configured**: Make sure you've set up CORS rules for your storage bucket (see Storage setup above)
2. **Check your bucket name**: Ensure `REACT_APP_FIREBASE_STORAGE_BUCKET` in your `.env.local` matches your actual bucket name
3. **Verify origins**: Make sure your current origin (e.g., `http://localhost:3000`) is included in the CORS configuration
4. **Test CORS configuration**: You can verify your CORS setup by running:
   ```bash
   gsutil cors get gs://YOUR_STORAGE_BUCKET_NAME
   ```

#### Other Common Issues
- Make sure all environment variables are correctly set
- Check Firebase Console for any service errors
- Verify your Firebase project is properly configured
- Check browser console for detailed error messages
- Restart your development server after changing environment variables
