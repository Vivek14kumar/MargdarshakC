// server/services/courseService.js
/*import { sheets } from "../config/googleAuth.js";

// Your Google Sheet ID
const SPREADSHEET_ID = "19Vies158F8OM2pUIPcP8pdPI3TR9F3UWsJAQ3vDjAco";
const RANGE = "Courses!A:E"; // Columns: name | description | fees | duration | createdAt

// Add a new course
export async function addCourse({ name, desc, fees, duration }) {
  try {
    const createdAt = new Date().toISOString();

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [[name, desc, fees, duration, createdAt]],
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error adding course:", error.message || error);
    return { success: false, error: error.message };
  }
}

// Get all courses
export async function getCourses() {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    // Map each row to an object for easy use
    const rows = res.data.values || [];
    return rows.map((row) => ({
      name: row[0],
      desc: row[1],
      fees: row[2],
      duration: row[3],
      createdAt: row[4],
    }));
  } catch (error) {
    console.error("Error fetching courses:", error.message || error);
    return [];
  }
}

// Optional: Get course by name
export async function getCourseByName(name) {
  const courses = await getCourses();
  return courses.find((c) => c.name === name);
}
*/