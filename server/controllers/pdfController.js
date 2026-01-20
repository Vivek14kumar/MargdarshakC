import { deletePdfService } from "../services/pdfService.js";

export const deletePdfController = async (req, res) => {
  try {
    const { id } = req.params;

    await deletePdfService(id);

    res.json({ message: "PDF deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || "Delete failed" });
  }
};
