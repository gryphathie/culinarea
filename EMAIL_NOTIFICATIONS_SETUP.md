# Email Notifications Setup for Feedback

## Current Implementation

Feedback submissions are currently saved to Firestore in the `feedback` collection. To receive email notifications when users submit feedback, you have several options:

## Option 1: Firebase Cloud Functions (Recommended)

### Setup

1. **Install Firebase CLI** (if not already installed):

   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize Functions** in your project:

   ```bash
   cd culinarea
   firebase init functions
   ```

3. **Install Email Package**:

   ```bash
   cd functions
   npm install nodemailer
   ```

4. **Create Email Function** in `functions/index.js`:

   ```javascript
   const functions = require("firebase-functions");
   const admin = require("firebase-admin");
   const nodemailer = require("nodemailer");

   admin.initializeApp();

   const transporter = nodemailer.createTransport({
     service: "gmail",
     auth: {
       user: "your-email@gmail.com",
       pass: "your-app-password",
     },
   });

   exports.sendFeedbackEmail = functions.firestore
     .document("feedback/{feedbackId}")
     .onCreate(async (snap, context) => {
       const feedback = snap.data();

       const mailOptions = {
         from: "your-email@gmail.com",
         to: "dev-team@culinarea.com",
         subject: `Nuevo Feedback: ${feedback.subject}`,
         html: `
           <h2>Nuevo Feedback de ${feedback.name || "Usuario"}</h2>
           <p><strong>Email:</strong> ${
             feedback.email || "No proporcionado"
           }</p>
           <p><strong>Asunto:</strong> ${feedback.subject}</p>
           <p><strong>Mensaje:</strong></p>
           <p>${feedback.message}</p>
         `,
       };

       return transporter.sendMail(mailOptions);
     });
   ```

5. **Deploy Function**:
   ```bash
   firebase deploy --only functions
   ```

## Option 2: EmailJS (Easier, No Backend)

### Setup

1. **Install EmailJS**:

   ```bash
   npm install @emailjs/browser
   ```

2. **Sign up** at [EmailJS.com](https://www.emailjs.com)

3. **Create Email Template** in EmailJS dashboard

4. **Add to HelpPage.js**:

   ```javascript
   import emailjs from "@emailjs/browser";

   // In handleSubmit, before firestoreService.create:
   try {
     await emailjs.send(
       "YOUR_SERVICE_ID",
       "YOUR_TEMPLATE_ID",
       {
         from_name: formData.name,
         from_email: formData.email,
         subject: formData.subject,
         message: formData.message,
       },
       "YOUR_PUBLIC_KEY"
     );
   } catch (err) {
     console.error("EmailJS error:", err);
   }
   ```

## Option 3: Google Apps Script (Free)

Create a Google Apps Script that triggers on Firestore changes and sends emails.

## Option 4: Firestore Triggers with External Service

Use Zapier, Make.com, or similar services to trigger on Firestore document creation and send emails.

## Viewing Feedback Manually

Until email is set up, you can view feedback in Firebase Console:

1. Go to Firestore Database
2. Open the `feedback` collection
3. View new submissions
4. Mark as read/replied by updating the `status` field

## Firestore Collection Structure

Feedback documents are stored with this structure:

```javascript
{
  name: string,           // User's name (optional)
  email: string,          // User's email (optional)
  subject: string,        // Feedback subject
  message: string,        // Feedback message
  userId: string | null,  // Firebase Auth UID
  status: 'new',          // Status: 'new', 'read', 'replied'
  createdAt: timestamp,   // Auto-added by service
  updatedAt: timestamp    // Auto-added by service
}
```

## Next Steps

Choose one of the email notification options above and follow the setup instructions. EmailJS is the quickest to implement if you want a fast solution without backend code.
