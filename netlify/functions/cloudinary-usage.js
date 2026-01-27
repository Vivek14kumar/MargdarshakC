import { v2 as cloudinary } from "cloudinary";

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
};

const getFolderSize = async (folder) => {
  let totalBytes = 0;
  let nextCursor = null;

  do {
    const res = await cloudinary.api.resources({
      type: "upload",
      prefix: folder,   // 🔥 folder name
      max_results: 500,
      next_cursor: nextCursor,
    });

    res.resources.forEach(file => {
      totalBytes += file.bytes || 0;
    });

    nextCursor = res.next_cursor;
  } while (nextCursor);

  return totalBytes;
};

export const handler = async () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // ✅ MATCH CLOUDINARY FOLDER STRUCTURE
    const galleryBytes = await getFolderSize("Assets/gallery", "image");
    const pdfBytes = await getFolderSize("Assets/pdfs", "raw");
    const resultsBytes = await getFolderSize("Assets/results", "raw");

    const totalBytes = galleryBytes + pdfBytes + resultsBytes;

    return {
      statusCode: 200,
      body: JSON.stringify({
        gallery: formatSize(galleryBytes),
        pdf: formatSize(pdfBytes),
        results: formatSize(resultsBytes),
        total: formatSize(totalBytes),
      }),
    };
  } catch (error) {
    console.error("Folder usage error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to calculate folder usage" }),
    };
  }
};
