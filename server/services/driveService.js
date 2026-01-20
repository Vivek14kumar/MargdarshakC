import fs from "fs";
import { drive } from "../config/driveAuth.js";

export const uploadToDrive = async (file) => {
  const response = await drive.files.create({
    requestBody: {
      name: file.originalname,
    },
    media: {
      mimeType: file.mimetype,
      body: fs.createReadStream(file.path),
    },
    fields: "id",
  });

  const fileId = response.data.id;

  await drive.permissions.create({
    fileId,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
  });

  fs.unlinkSync(file.path);

  return `https://drive.google.com/uc?id=${fileId}`;
};
