// server/services/adminService.js
/*import { sheets } from "../config/googleAuth.js";
import bcrypt from "bcrypt";

// Your Google Sheet ID
const SPREADSHEET_ID = "19Vies158F8OM2pUIPcP8pdPI3TR9F3UWsJAQ3vDjAco";
const RANGE = "AdminUsers!A:D"; // Columns: email | password | role | createdAt

// Add new admin
export async function addAdmin(email, password) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10); // hash the password
    const role = "admin";
    const createdAt = new Date().toISOString();

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [[email, hashedPassword, role, createdAt]],
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error adding admin:", error.message || error);
    return { success: false, error: error.message };
  }
}

// Get all admins
export async function getAdmins() {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    return res.data.values || []; // returns array of rows
  } catch (error) {
    console.error("Error fetching admins:", error.message || error);
    return [];
  }
}

// Verify admin login
export async function verifyAdmin(email, password) {
  const admins = await getAdmins();

  for (const row of admins) {
    const [savedEmail, savedHash] = row;

    if (savedEmail === email && (await bcrypt.compare(password, savedHash))) {
      return true;
    }
  }

  return false;
}
*/