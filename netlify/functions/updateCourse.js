import admin from "../_lib/firebaseAdmin.js";

const db = admin.firestore();

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const {
      courseId,
      title,
      desc,
      duration,
      highlight,
      uid,
    } = JSON.parse(event.body);

    if (!courseId || !title || !desc || !duration || !uid) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing required fields" }),
      };
    }

    /* 🔐 VERIFY ADMIN */
    const adminDoc = await db.collection("users").doc(uid).get();
    if (!adminDoc.exists || !adminDoc.data().isAdmin) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: "Unauthorized" }),
      };
    }

    /* 🔗 SLUG */
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    /* ✏️ UPDATE COURSE */
    await db.collection("courses").doc(courseId).update({
      title,
      desc,
      duration,
      highlight: highlight || "",
      slug,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Course updated successfully" }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
