import { auth, firestore } from "../config/firebase.js";

// Signup Admin or Student
export async function signupUser(email, password, role = "student") {
  try {
    // Create user in Firebase Auth
    const userRecord = await auth.createUser({ email, password });
    
    // Add role & metadata in Firestore
    await firestore.collection("users").doc(userRecord.uid).set({
      email,
      role,
      createdAt: new Date().toISOString(),
    });

    return { success: true, uid: userRecord.uid };
  } catch (err) {
    console.error("Signup Error:", err.message);
    return { success: false, error: err.message };
  }
}

// Login (returns Firebase ID token)
export async function loginUser(email, password) {
  try {
    // Firebase Auth doesn't allow server-side password login
    // So in production, login happens on frontend with firebase/auth SDK
    // Server can verify ID token for requests
    return { success: true, message: "Login via frontend Firebase SDK" };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Get user role
export async function getUserRole(uid) {
  const doc = await firestore.collection("users").doc(uid).get();
  if (!doc.exists) return null;
  return doc.data().role;
}
