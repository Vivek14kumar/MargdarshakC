import admin from "../_lib/firebaseAdmin.js";

const db = admin.firestore();

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { name, email, password, mobile } = JSON.parse(event.body);

    if (!email || !password || !mobile) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "All fields required" }),
      };
    }

    // 🔍 Check if admin already exists
    const adminSnap = await db.collection("admins").limit(1).get();
    if (!adminSnap.empty) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          message: "Admin already exists. Signup disabled.",
        }),
      };
    }

    // 🔐 Create admin in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      phoneNumber: `+91${mobile}`,
      displayName: name,
    });

    // 📄 Save admin profile
    await db.collection("admins").doc(userRecord.uid).set({
      name,
      email,
      mobile,
      role: "ADMIN",
      createdAt: new Date(),
    });

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "Admin created successfully",
        uid: userRecord.uid,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
