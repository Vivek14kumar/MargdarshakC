import admin from "../_lib/firebaseAdmin.js";
import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const db = admin.firestore();

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { pdfId } = JSON.parse(event.body);

    if (!pdfId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "pdfId is required" }),
      };
    }

    // 🔹 1. Get PDF document
    const docRef = db.collection("pdfs").doc(pdfId);
    const snap = await docRef.get();

    if (!snap.exists) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "PDF not found" }),
      };
    }

    const pdf = snap.data();

    // 🔹 2. Delete from Cloudinary
    if (pdf.publicId) {
      await cloudinary.uploader.destroy(pdf.publicId, {
  resource_type: pdf.resourceType || "raw",
});

    }

    // 🔹 3. Delete Firestore document
    await docRef.delete();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "PDF deleted successfully" }),
    };
  } catch (error) {
    console.error("DELETE PDF ERROR:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}
