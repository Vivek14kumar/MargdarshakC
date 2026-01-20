// server/services/resultsService.js
import { sheets } from "../config/googleAuth.js";

const SPREADSHEET_ID = "19Vies158F8OM2pUIPcP8pdPI3TR9F3UWsJAQ3vDjAco";

/**
 * Add a result
 * type: "manual" or "pdf"
 */
export async function addResult(type, data) {
  try {
    const createdAt = new Date().toISOString();
    let RANGE;
    let values;

    if (type === "manual") {
      RANGE = "Results!A:D"; // Columns: studentName | subject | marks | createdAt
      values = [data.studentName, data.subject, data.marks, createdAt];
    } else if (type === "pdf") {
      RANGE = "Results!F:H"; // Columns: title | url | createdAt (PDFs stored separately)
      values = [data.title, data.url, createdAt];
    } else {
      throw new Error("Invalid result type");
    }

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [values],
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error adding result:", error.message || error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all manual results
 */
export async function getManualResults() {
  try {
    const RANGE = "Results!A:D";
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const rows = res.data.values || [];
    return rows.map((row) => ({
      studentName: row[0],
      subject: row[1],
      marks: row[2],
      createdAt: row[3],
    }));
  } catch (error) {
    console.error("Error fetching manual results:", error.message || error);
    return [];
  }
}

/**
 * Get all PDF results
 */
export async function getPDFResults() {
  try {
    const RANGE = "Results!F:H";
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const rows = res.data.values || [];
    return rows.map((row) => ({
      title: row[0],
      url: row[1],
      createdAt: row[2],
    }));
  } catch (error) {
    console.error("Error fetching PDF results:", error.message || error);
    return [];
  }
}
