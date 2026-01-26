import admin from "../_lib/firebaseAdmin.js";

const db = admin.firestore();

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { uid, name, email, mobile } = JSON.parse(event.body);

    if (!uid || !email || !mobile) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing required fields" }),
      };
    }

    // 🔍 Check if admin already exists
    const snap = await db
      .collection("users")
      .where("isAdmin", "==", true)
      .limit(1)
      .get();

    if (!snap.empty) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          message: "Admin already exists. Signup disabled.",
        }),
      };
    }

    // 📄 Save admin profile
    await db.collection("users").doc(uid).set({
      name,
      email,
      mobile,
      role: "admin",
      isAdmin: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "Admin registered successfully",
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
