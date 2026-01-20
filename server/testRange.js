import { sheets } from "./config/googleAuth.js";

const SPREADSHEET_ID = "19Vies158F8OM2pUIPcP8pdPI3TR9F3UWsJAQ3vDjAco";

async function testRange() {
  try {
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "AdminUsers!A:D", // make sure tab name is exactly AdminUsers
    });
    console.log("Range found:", res.data.values);
  } catch (err) {
    console.error("Range error:", err.message);
  }
}

testRange();
