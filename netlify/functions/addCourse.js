import admin from "../_lib/firebaseAdmin.js";

const db = admin.firestore();

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const {
      title,
      desc,
      duration,
      highlight,
      features,
      uid,
    } = JSON.parse(event.body);

    if (!title || !desc || !duration || !uid) {
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

    /* 📘 CREATE COURSE */
    const courseRef = await db.collection("courses").add({
      title,
      desc,
      duration,
      highlight: highlight || "",
      slug,
      features: (features || []).filter(f => f.text?.trim()),
      uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    /* 🔔 NOTIFY STUDENTS */
    const studentsSnap = await db
      .collection("users")
      .where("role", "==", "student")
      .get();

    const batch = db.batch();

    studentsSnap.forEach((doc) => {
      const ref = db.collection("notifications").doc();
      batch.set(ref, {
        uid: doc.id,
        type: "course",
        title: "New Course Available",
        message: `${title} course is now live`,
        courseTitle: title,
        courseSlug: slug,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "Course created successfully",
        courseId: courseRef.id,
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
