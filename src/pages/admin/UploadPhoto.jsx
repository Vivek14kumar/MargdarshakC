// src/pages/admin/UploadPhotos.jsx
import { useDropzone } from "react-dropzone";
import { useEffect, useState } from "react";
import { firestore } from "../../firebaseConfig"; // Your Firebase config
import { collection, addDoc, getDocs, orderBy, query, doc } from "firebase/firestore";

const BASE = import.meta.env.VITE_API_URL || "/.netlify/functions";

export default function UploadPhotos() {
  const [files, setFiles] = useState([]); // local dropzone previews
  const [uploadedPhotos, setUploadedPhotos] = useState([]); // photos from Firebase
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({});
  const [success, setSuccess] = useState(false);
  const [deletingId, setDeletingId] = useState(null); // track deletion

  // Load previously uploaded photos from Firebase
  const loadPhotos = async () => {
    try {
      const q = query(collection(firestore, "photos"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUploadedPhotos(list);
    } catch (err) {
      console.error("Failed to load photos:", err);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  // Upload a single file to Cloudinary + save metadata in Firebase
  const uploadFile = async (file) => {
    const sign = await fetch(`/.netlify/functions/sign?folder=gallery`).then((r) => r.json());

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", sign.api_key);
    formData.append("timestamp", sign.timestamp);
    formData.append("signature", sign.signature);
    formData.append("folder", "gallery");

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `https://api.cloudinary.com/v1_1/${sign.cloud_name}/image/upload`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress((prev) => ({
            ...prev,
            [file.name]: Math.round((e.loaded / e.total) * 100),
          }));
        }
      };

      xhr.onload = async () => {
        const data = JSON.parse(xhr.responseText);
        if (!data.public_id) return reject("Upload failed");

        // Save metadata in Firestore
        await addDoc(collection(firestore, "photos"), {
          title: file.name,
          url: data.secure_url,
          publicId: data.public_id,
          createdAt: new Date(),
        });

        resolve();
      };

      xhr.onerror = () => reject("Upload failed");
      xhr.send(formData);
    });
  };

  // Handle files from dropzone
  const onDrop = async (acceptedFiles) => {
    const mappedFiles = acceptedFiles.map((file) =>
      Object.assign(file, { preview: URL.createObjectURL(file) })
    );
    setFiles((prev) => [...prev, ...mappedFiles]);
    setUploading(true);

    try {
      await Promise.all(mappedFiles.map(uploadFile));
      setSuccess(true);
      setFiles([]);
      setProgress({});
      loadPhotos(); // reload all uploaded photos
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert("❌ Some files failed to upload");
    }

    setUploading(false);
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    multiple: true,
    onDrop,
  });

  // Delete photo from Cloudinary + Firestore
  const deletePhoto = async (photo) => {
    if (!window.confirm("Delete this photo permanently?")) return;

    setDeletingId(photo.id);

    try {
      const res = await fetch(`${BASE}/delete-photo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photoId: photo.id,
          publicId: photo.publicId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");

      // Firestore onSnapshot or reload
      setUploadedPhotos((prev) => prev.filter((p) => p.id !== photo.id));
      console.log("Deleted photo:", photo.title);
    } catch (err) {
      console.error(err);
      alert("Failed to delete photo");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Upload Photos
      </h2>

      {success && (
        <div className="bg-green-50 p-3 rounded-lg mb-4 text-center text-green-600 font-medium">
          ✅ All photos uploaded successfully!
        </div>
      )}

      {/* Drag & Drop */}
      <div
        {...getRootProps()}
        className="border-4 border-dashed border-blue-300 rounded-xl p-10 text-center cursor-pointer hover:border-blue-500 transition"
      >
        <input {...getInputProps()} />
        <p className="text-gray-500 text-lg">
          Drag & drop images here, or click to select files
        </p>
      </div>

      {/* Local Previews */}
      {files.length > 0 && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {files.map((file) => (
            <div
              key={file.name}
              className="relative border rounded-lg overflow-hidden shadow-sm"
            >
              <img src={file.preview} alt={file.name} className="h-32 w-full object-cover" />
              <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-40 text-white text-xs p-1 text-center truncate">
                {file.name}
              </div>
              {uploading && progress[file.name] && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gray-200">
                  <div className="h-1 bg-blue-500" style={{ width: `${progress[file.name]}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Photos Gallery */}
      {uploadedPhotos.length > 0 && (
        <>
          <h3 className="text-xl font-semibold mt-8 mb-4 text-gray-700">Uploaded Photos</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {uploadedPhotos.map((photo) => (
              <div key={photo.id} className="relative border rounded-lg overflow-hidden shadow-sm">
                <img src={photo.url} alt={photo.title} className="h-32 w-full object-cover" />
                <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-40 text-white text-xs p-1 text-center truncate">
                  {photo.title}
                </div>
                <button
                  onClick={() => deletePhoto(photo)}
                  disabled={deletingId === photo.id}
                  className={`absolute top-1 right-1 text-xs px-2 py-1 rounded font-medium text-white ${
                    deletingId === photo.id ? "bg-gray-500 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {deletingId === photo.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
