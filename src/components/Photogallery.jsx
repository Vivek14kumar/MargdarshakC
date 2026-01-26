import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  limit as fbLimit,
} from "firebase/firestore";
import { firestore } from "../firebaseConfig";
import { Link } from "react-router-dom";

export default function PhotoGallery({ limit }) {
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchGallery() {
      try {
        const baseQuery = query(
          collection(firestore, "photos"),
          orderBy("createdAt", "desc")
        );

        const finalQuery = limit
          ? query(
              collection(firestore, "photos"),
              orderBy("createdAt", "desc"),
              fbLimit(limit)
            )
          : baseQuery;

        const snap = await getDocs(finalQuery);

        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setGalleryImages(data);
      } catch (error) {
        console.error("Failed to load gallery:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchGallery();
  }, [limit]);

  return (
    <section className="bg-gradient-to-b from-slate-50 to-white py-16 px-4 mt-10">
      <div className="max-w-7xl mx-auto text-center">

        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
          Our <span className="text-red-600">Photo Gallery</span>
        </h2>

        <p className="max-w-2xl mx-auto mb-12">
          A glimpse of our classrooms, students, faculty & learning environment.
        </p>

        {/* Loading */}
        {loading && (
          <p className="text-gray-500 text-center">
            Loading gallery...
          </p>
        )}

        {/* Gallery Grid */}
        {!loading && galleryImages.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {galleryImages.map((img) => (
              <div
                key={img.id}
                className="group relative overflow-hidden rounded-xl shadow-xl bg-white"
              >
                <img
                  src={img.url}
                  alt={img.title || "Gallery image"}
                  loading="lazy"
                  className="w-full h-60 object-cover
                  transform group-hover:scale-110 transition duration-500"
                />

                {/* Overlay 
                {img.title && (
                  <div
                    className="absolute inset-0 bg-black/40
                    flex items-center justify-center
                    opacity-0 group-hover:opacity-100 transition"
                  >
                    <h3 className="text-white text-sm font-semibold px-4 text-center">
                      {img.title}
                    </h3>
                  </div>
                )}*/}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && galleryImages.length === 0 && (
          <p className="text-gray-500">No photos available</p>
        )}

        {/* View All Button (Home only) */}
        {limit && galleryImages.length > 0 && (
          <div className="mt-12">
            <Link
              to="/gallery"
              className="inline-block text-red-600 font-semibold hover:underline"
            >
              View Full Gallery →
            </Link>
          </div>
        )}

      </div>
    </section>
  );
}
