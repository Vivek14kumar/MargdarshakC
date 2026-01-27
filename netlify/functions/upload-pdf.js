import cloudinary from "cloudinary";
import formidable from "formidable";
import fs from "fs";
import path from "path";

/* ---------------- CONFIG ---------------- */

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: { bodyParser: false },
};

const MAX_GB = 5;

/* ---------------- HELPERS ---------------- */

async function getUsedGB() {
  const usage = await cloudinary.v2.api.usage();
  const bytes = usage.storage.usage || 0;
  return bytes / (1024 * 1024 * 1024);
}

/* ---------------- HANDLER ---------------- */

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method not allowed" };
  }

  try {
    /* 🔒 STORAGE LIMIT CHECK */
    const usedGB = await getUsedGB();
    if (usedGB >= MAX_GB) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          error: "Storage limit exceeded",
          message: "5 GB free storage limit reached",
        }),
      };
    }

    /* 📥 PARSE FILE */
    const form = formidable({
      multiples: false,
      maxFileSize: 200 * 1024 * 1024, // 200 MB
      keepExtensions: true,
      uploadDir: "/tmp",
    });

    const [fields, files] = await form.parse(event);

    const file = files.file?.[0];
    const course = fields.course?.[0];

    if (!file || !course) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing file or course" }),
      };
    }

    /* ☁️ UPLOAD TO CLOUDINARY */
    const upload = await cloudinary.v2.uploader.upload(file.filepath, {
      folder: `pdfs/${course}`,
      resource_type: "raw",
      chunk_size: 6 * 1024 * 1024, // 6MB chunks
      use_filename: true,
    });

    fs.unlinkSync(file.filepath);

    return {
      statusCode: 200,
      body: JSON.stringify({
        url: upload.secure_url,
        publicId: upload.public_id,
        sizeMB: +(file.size / (1024 * 1024)).toFixed(2),
      }),
    };
  } catch (err) {
    console.error("PDF upload error:", err);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Upload failed",
        message: err.message,
      }),
    };
  }
}
