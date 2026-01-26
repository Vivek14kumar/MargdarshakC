import crypto from "crypto";

export const handler = async (event) => {
  try {
    const { folder } = event.queryStringParameters;

    const timestamp = Math.round(Date.now() / 1000);
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    const signature = crypto
      .createHash("sha1")
      .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
      .digest("hex");

    return {
      statusCode: 200,
      body: JSON.stringify({
        timestamp,
        signature,
        api_key: process.env.CLOUDINARY_API_KEY,
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      }),
    };
  } catch (err) {
    return { statusCode: 500, body: "Signature error" };
  }
};
