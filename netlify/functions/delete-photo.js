// netlify/functions/delete-photo.js
import admin from "../_lib/firebaseAdmin"; // Firebase Admin SDK
import cloudinary from "cloudinary";

// Firestore instance
const db = admin.firestore();

// Configure Cloudinary
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
    const { photoId, publicId } = JSON.parse(event.body);

    if (!photoId || !publicId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "photoId and publicId are required" }),
      };
    }

    // 1️⃣ Delete Firestore document
    await db.collection("photos").doc(photoId).delete();

    // 2️⃣ Delete Cloudinary file
    await cloudinary.v2.uploader.destroy(publicId, { resource_type: "image" });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Photo deleted successfully" }),
    };
  } catch (err) {
    console.error("Delete failed:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || "Delete failed" }),
    };
  }
}
