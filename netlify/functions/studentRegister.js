import admin from "../_lib/firebaseAdmin.js";

const db = admin.firestore();

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { uid, name, email, mobile, course } = JSON.parse(event.body);

    // 🔍 Duplicate checks (SECURE)
    const emailSnap = await db
      .collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (!emailSnap.empty) {
      return {
        statusCode: 409,
        body: JSON.stringify({ message: "Email already registered" }),
      };
    }

    const mobileSnap = await db
      .collection("users")
      .where("mobile", "==", mobile)
      .limit(1)
      .get();

    if (!mobileSnap.empty) {
      return {
        statusCode: 409,
        body: JSON.stringify({ message: "Mobile already registered" }),
      };
    }

    // 📄 Save student profile
    await db.collection("users").doc(uid).set({
      name,
      email,
      mobile,
      role: "student",
      enrolledCourses: course ? [course] : [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Student registered" }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
