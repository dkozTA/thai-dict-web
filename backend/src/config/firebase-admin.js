const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID
});

const db = admin.firestore();

module.exports = { admin, db };