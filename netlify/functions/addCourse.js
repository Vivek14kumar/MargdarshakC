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

    /* ---------------- VALIDATION ---------------- */
    if (!title || !desc || !duration || !uid) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing required fields" }),
      };
    }

    /* ---------------- ADMIN CHECK ---------------- */
    const adminSnap = await db.collection("users").doc(uid).get();
    if (!adminSnap.exists || !adminSnap.data().isAdmin) {
      return {
        statusCode: 403,
        body: JSON.stringify({ message: "Unauthorized" }),
      };
    }

    /* ---------------- SLUG ---------------- */
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const year = new Date().getFullYear();

    /* ---------------- COURSE ID (YOUR FORMAT) ---------------- */
    const courseId = `COU-${year}-${slug}`;

    /* ---------------- PREVENT DUPLICATE SAME YEAR ---------------- */
    const existing = await db
      .collection("courses")
      .where("courseId", "==", courseId)
      .limit(1)
      .get();

    if (!existing.empty) {
      return {
        statusCode: 409,
        body: JSON.stringify({
          message: "Course with same title already exists for this year",
        }),
      };
    }

    /* ---------------- CREATE COURSE ---------------- */
    const courseRef = await db.collection("courses").add({
      courseId,              // 🔥 readable ID
      title,
      slug,
      batchYear: year,
      status: "active",

      desc,
      duration,
      highlight: highlight || "",
      features: (features || []).filter(
        (f) => f?.text && f.text.trim()
      ),

      createdBy: uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    /* ---------------- NOTIFY STUDENTS ---------------- */
    const studentsSnap = await db
      .collection("users")
      .where("role", "==", "student")
      .get();

    const batch = db.batch();

    studentsSnap.forEach((doc) => {
      const notifyRef = db.collection("notifications").doc();
      batch.set(notifyRef, {
        uid: doc.id,
        type: "course",
        title: "New Course Available",
        message: `${title} (${year}) course is now live`,
        courseId,        // ✅ use this everywhere
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
        courseId,
        docId: courseRef.id,
      }),
    };

  } catch (error) {
    console.error("Add course error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal server error",
        error: error.message,
      }),
    };
  }
}
