import { useEffect, useState } from "react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ResultsList() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchResults = async () => {
    const res = await fetch(`${BASE_URL}/api/results`);
    const data = await res.json();
    if (data.success) setResults(data.results);
    setLoading(false);
  };

  const deleteResult = async (id) => {
    if (!confirm("Delete this result?")) return;

    await fetch(`${BASE_URL}/api/results/${id}`, {
      method: "DELETE",
    });

    setResults(results.filter(r => r.id !== id));
  };

  useEffect(() => {
    fetchResults();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Results PDFs</h2>

      {results.length === 0 && (
        <p className="text-gray-500">No results uploaded</p>
      )}

      <ul className="space-y-3">
        {results.map(r => (
          <li
            key={r.id}
            className="flex items-center justify-between border p-3 rounded-lg"
          >
            <div>
              <p className="font-medium">{r.title}</p>
              <p className="text-sm text-gray-500">
                {new Date(r.createdAt?.seconds * 1000).toLocaleDateString()}
              </p>
            </div>

            <div className="flex gap-2">
              <a
                href={r.url}
                target="_blank"
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded"
              >
                Preview
              </a>

              <button
                onClick={() => deleteResult(r.id)}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
