import admin from "../_lib/firebaseAdmin.js";
import cloudinary from "cloudinary";

const db = admin.firestore();

// ✅ Cloudinary v2 config
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { pdfId } = JSON.parse(event.body || "{}");

    if (!pdfId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "pdfId is required" }),
      };
    }

    // 1️⃣ Get Firestore document
    const docRef = db.collection("pdfs").doc(pdfId);
    const snap = await docRef.get();

    if (!snap.exists) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "PDF not found" }),
      };
    }

    const pdf = snap.data();

    // 2️⃣ Delete from Cloudinary
    if (pdf.publicId) {
      const cloudRes = await cloudinary.v2.uploader.destroy(
        pdf.publicId,
        { resource_type: "raw" } // PDFs are raw
      );

      console.log("Cloudinary delete:", cloudRes);
    }

    // 3️⃣ Delete Firestore doc
    await docRef.delete();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "PDF deleted successfully" }),
    };
  } catch (err) {
    console.error("DELETE PDF ERROR:", err);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message || "Internal Server Error",
      }),
    };
  }
}
