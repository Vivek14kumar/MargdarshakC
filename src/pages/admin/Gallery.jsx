// Gallery.jsx
import { useEffect, useState } from "react";
const BASE = import.meta.env.VITE_API_URL;

export default function Gallery() {
  const [photos, setPhotos] = useState([]);

  const load = async () => {
    const res = await fetch(`${BASE}/api/photos`);
    setPhotos(await res.json());
  };

  useEffect(() => { load(); }, []);

  const del = async (id) => {
    await fetch(`${BASE}/api/photos/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="grid grid-cols-3 gap-4">
      {photos.map(p => (
        <div key={p.id}>
          <img src={p.url} className="rounded" />
          <button onClick={() => del(p.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
