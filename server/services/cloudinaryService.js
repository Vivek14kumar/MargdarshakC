import { v2 as cloudinary } from "cloudinary";

/* =====================================================
   CLOUDINARY CONFIG
===================================================== */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* =====================================================
   SIGNED UPLOAD (Browser → Cloudinary)
===================================================== */
export const getUploadSignature = (folder = "uploads") => {
  if (!process.env.CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary API secret missing");
  }

  const timestamp = Math.round(Date.now() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder,
    },
    process.env.CLOUDINARY_API_SECRET
  );

  return {
    timestamp,
    signature,
    api_key: process.env.CLOUDINARY_API_KEY,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  };
};

/* =====================================================
   DELETE FROM CLOUDINARY (Image + RAW fallback)
===================================================== */
export const deleteFromCloudinary = async (publicId) => {
  if (!publicId) {
    throw new Error("publicId is required to delete from Cloudinary");
  }

  // 1️⃣ Try deleting as IMAGE
  const imageResult = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });

  // 2️⃣ If not found, try RAW (for PDFs uploaded as raw)
  if (imageResult.result === "not found") {
    return await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw",
    });
  }

  return imageResult;
};
