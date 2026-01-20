import { v2 as cloudinary } from 'cloudinary';
import { sheets } from "../config/googleAuth.js"; 
import fs from "fs";

// Configuration
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

/**
 * Uploads a file (Photo or PDF) to Cloudinary and logs it to Google Sheets.
 */
export const uploadPhotoToDrive = async (file, title) => {
  try {
    // 1. Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "Margdarshak_Career", // This creates a folder in your Cloudinary account
      resource_type: "auto", // This allows both Images and PDFs
    });

    const fileUrl = result.secure_url; // This is your high-speed direct link

    // 2. Log to Google Sheets (AdminUsers)
    // We keep this because your Google Sheet connection is already working!
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Photos!A:C",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            title || "Unnamed",
            new Date().toLocaleString(),
            `=HYPERLINK("${fileUrl}", "View File")`
          ],
        ],
      },
    });

    // 3. Delete local temp file
    if (fs.existsSync(file.path)) fs.unlinkSync(file.path);

    return fileUrl;
  } catch (error) {
    if (file && fs.existsSync(file.path)) fs.unlinkSync(file.path);
    console.error("Cloudinary Error:", error);
    throw new Error("Upload failed during Cloudinary processing");
  }
};