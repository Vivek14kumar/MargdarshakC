import { sheets } from "../config/googleAuth.js";

/*export async function createSheet(title) {
  const res = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title },
    },
  });

  return res.data.spreadsheetId;
}

export async function addRow(sheetId, range, values) {
  await sheets.spreadsheets.values.append({
  spreadsheetId: process.env.ADMIN_SHEET_ID,
  range: "Sheet1!A:E",
  valueInputOption: "RAW",
  requestBody: {
    values: [["test@email.com", "hash"]],
  },
});

}
*/