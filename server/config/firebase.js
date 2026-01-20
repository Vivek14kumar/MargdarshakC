/*mport admin from "firebase-admin";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const serviceAccount = path.join(process.cwd(), "firebase-adminsdk.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_BUCKET_URL, // e.g., your-bucket.appspot.com
});

export const bucket = admin.storage().bucket();
export const firestore = admin.firestore();
export const auth = admin.auth();*/
