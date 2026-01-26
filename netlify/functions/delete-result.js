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
    const { resultId } = JSON.parse(event.body);

    if (!resultId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "resultId is required" }),
      };
    }

    const docRef = db.collection("results").doc(resultId);
    const snap = await docRef.get();

    if (!snap.exists) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Result not found" }),
      };
    }

    const result = snap.data();

    // For Cloudinary raw (PDF) upload:
    if (result.publicId) {
      console.log(
        "Deleting Cloudinary file:",
        result.publicId,
        "resource_type raw"
      );

      await cloudinary.v2.uploader.destroy(result.publicId, {
        resource_type: "raw", // MUST be raw for PDFs/docs
      });
    }

    await docRef.delete();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Result deleted successfully" }),
    };
  } catch (err) {
    console.error("DELETE RESULT ERROR:", err);

    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || "Delete failed" }),
    };
  }
}
