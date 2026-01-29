import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
  onSnapshot,
  increment,
} from "firebase/firestore";
import { firestore } from "../../firebaseConfig";

export default function PDFList({ selectedClass, selectedSubject }) {
  const [pdfs, setPdfs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  /* ===============================
     REAL-TIME LOAD PDFs
  =============================== */
  useEffect(() => {
    if (!selectedClass || !selectedSubject) {
      setPdfs([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const q = query(
      collection(firestore, "pdfs"),
      where("class", "==", selectedClass),
      where("subject", "==", selectedSubject),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setPdfs(
        snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
      setLoading(false);
    });

    return () => unsub(); // cleanup
  }, [selectedClass, selectedSubject]);

  /* ===============================
     DOWNLOAD + COUNT
  =============================== */
  const downloadPDF = async (pdf) => {
    const ref = doc(firestore, "pdfs", pdf.id);

    await updateDoc(ref, {
      downloadCount: increment(1),
    });

    window.open(pdf.url, "_blank");
  };

  /* ===============================
     DELETE PDF
  =============================== */
  const deletePDF = async (pdf) => {
    if (!window.confirm("Delete this PDF permanently?")) return;

    await fetch("https://YOUR_BACKEND_URL/delete-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        publicId: pdf.publicId,
        docId: pdf.id,
      }),
    });

    // 🔥 onSnapshot auto refreshes UI
  };

  /* ===============================
     SEARCH FILTER
  =============================== */
  const filteredPDFs = pdfs.filter((pdf) =>
    pdf.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white shadow rounded-xl p-6 mt-6">
      <h3 className="text-lg font-semibold mb-4">
        Notes – {selectedClass} / {selectedSubject}
      </h3>

      {/* SEARCH */}
      <input
        placeholder="Search PDF..."
        className="border rounded px-3 py-2 w-full mb-4"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : filteredPDFs.length === 0 ? (
        <p className="text-center text-gray-500">No PDFs found</p>
      ) : (
        <div className="space-y-3">
          {filteredPDFs.map((pdf) => (
            <div
              key={pdf.id}
              className="flex justify-between items-center border p-3 rounded"
            >
              <div>
                <p className="font-medium">{pdf.title}</p>
                <p className="text-xs text-gray-500">
                  Downloads: {pdf.downloadCount || 0}
                </p>
              </div>

              <div className="flex gap-4 text-sm">
                <button
                  onClick={() => window.open(pdf.url, "_blank")}
                  className="text-blue-600"
                >
                  Preview
                </button>

                <button
                  onClick={() => downloadPDF(pdf)}
                  className="text-green-600"
                >
                  Download
                </button>

                <button
                  onClick={() => deletePDF(pdf)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
