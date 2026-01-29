import admin from "../_lib/firebaseAdmin.js";

const db = admin.firestore();

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { docId, uid } = JSON.parse(event.body);

    const adminDoc = await db.collection("users").doc(uid).get();
    if (!adminDoc.exists || !adminDoc.data().isAdmin) {
      return { statusCode: 403, body: "Unauthorized" };
    }

    await db.collection("courses").doc(docId).update({
      status: "archived",
      archivedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Course archived" }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
