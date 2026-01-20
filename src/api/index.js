const BASE_URL = import.meta.env.VITE_API_URL;

// count rows in a sheet
export async function getSheetCount(sheetName) {
  const res = await fetch(
    `${BASE_URL}/api/sheets/count/${sheetName}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch count");
  }

  const data = await res.json();
  return data.count || 0;
}
