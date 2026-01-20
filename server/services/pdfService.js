import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

export const deletePdf = async (pdfId, publicId) => {
  // 1️⃣ Delete from Cloudinary
  await cloudinary.v2.uploader.destroy(publicId, {
    resource_type: "raw", // IMPORTANT for PDF
  });

  // 2️⃣ Delete from Firestore
  await db.collection("pdfs").doc(pdfId).delete();
};
