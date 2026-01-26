import admin from "../_lib/firebaseAdmin.js";

const db = admin.firestore();

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { idToken } = JSON.parse(event.body);

    const decoded = await admin.auth().verifyIdToken(idToken);

    const adminDoc = await db.collection("admins").doc(decoded.uid).get();

    if (!adminDoc.exists) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: "Not an admin" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Admin login success",
        admin: adminDoc.data(),
      }),
    };
  } catch (error) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "Invalid token" }),
    };
  }
}
