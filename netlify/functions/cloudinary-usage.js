import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/* ================= HELPERS ================= */
  const FREE_STORAGE_LIMIT_GB = 5;
  const FREE_STORAGE_LIMIT_BYTES = FREE_STORAGE_LIMIT_GB * 1024 * 1024 * 1024;

async function getFolderBytes(folderPath) {
  let totalBytes = 0;
  let nextCursor = null;

  do {
    const res = await cloudinary.v2.search
      .expression(`folder:${folderPath}/*`)
      .max_results(500)
      .next_cursor(nextCursor)
      .execute();

    res.resources.forEach(r => {
      totalBytes += r.bytes || 0;
    });

    nextCursor = res.next_cursor;
  } while (nextCursor);

  return totalBytes;
}

async function getRecursiveFolderBytes(baseFolder) {
  let total = 0;

  // bytes in root folder
  total += await getFolderBytes(baseFolder);

  // subfolders
  const sub = await cloudinary.v2.api.sub_folders(baseFolder);

  for (const f of sub.folders) {
    total += await getRecursiveFolderBytes(f.path);
  }

  return total;
}

function format(bytes) {
  const mb = bytes / (1024 * 1024);
  const gb = bytes / (1024 * 1024 * 1024);

  return {
    bytes,
    mb: +mb.toFixed(2),
    gb: +gb.toFixed(4),
  };
}

/* ================= NETLIFY FUNCTION ================= */

export async function handler(event) {
  try {
    const galleryBytes = await getRecursiveFolderBytes("Gallery");
    const pdfBytes = await getRecursiveFolderBytes("pdfs");
    const resultsBytes = await getRecursiveFolderBytes("Results");

    const totalBytes = galleryBytes + pdfBytes + resultsBytes;

    // 🚫 BLOCK uploads if limit exceeded
    if (totalBytes >= FREE_STORAGE_LIMIT_BYTES) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          error: "Storage limit exceeded",
          limitGB: FREE_STORAGE_LIMIT_GB,
          usedGB: +(totalBytes / (1024 ** 3)).toFixed(2),
          message: "You have reached your 5 GB free storage limit. Please upgrade your plan.",
        }),
      };
    }

    // ✅ Only calculate & return usage if under limit
    const gallery = format(galleryBytes);
    const pdfs = format(pdfBytes);
    const results = format(resultsBytes);
    const total = format(totalBytes);

    return {
      statusCode: 200,
      body: JSON.stringify({
        gallery,
        pdfs,
        results,
        total,
        allowed: true,
      }),
    };
  } catch (err) {
    console.error("Cloudinary usage error:", err);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to calculate folder usage",
        message: err.message,
      }),
    };
  }
}

