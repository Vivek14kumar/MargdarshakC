import React, { useEffect, useMemo, useState } from "react";

const DEFAULT_VIDEOS = [
  { id: "Bvz3h9HwwDw" },
  { id: "WkkEWDoqalc" },
  { id: "LIeL12jKa3M" },
];

export default function YouTubeGallery({ videos }) {
  const videoList = useMemo(() => videos || DEFAULT_VIDEOS, [videos]);
  const [activeVideo, setActiveVideo] = useState(null);
  const [videoMeta, setVideoMeta] = useState({});

  // Fetch YouTube video metadata
  useEffect(() => {
    videoList.forEach((video) => {
      if (videoMeta[video.id]) return; // Already fetched

      fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${video.id}&format=json`
      )
        .then((res) => res.json())
        .then((data) => {
          setVideoMeta((prev) => ({
            ...prev,
            [video.id]: { title: data.title, channel: data.author_name },
          }));
        })
        .catch(() => {
          setVideoMeta((prev) => ({
            ...prev,
            [video.id]: { title: "YouTube Video", channel: "YouTube Channel" },
          }));
        });
    });
  }, [videoList, videoMeta]);

  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Heading */}
        <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">
          Watch Our <span className="text-red-600">Videos</span>
        </h2>

        {/* Video Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {videoList.map((video, idx) => {
            const meta = videoMeta[video.id];
            return (
              <div
                key={video.id}
                onClick={() => setActiveVideo(video.id)}
                className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition"
              >
                {/* Thumbnail */}
                <div className="relative">
                  <img
                    src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                    alt={meta?.title || "YouTube video"}
                    className="w-full aspect-video object-cover group-hover:scale-105 transition duration-300"
                  />
                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-red-600 text-white w-16 h-10 rounded-lg flex items-center justify-center text-2xl shadow-xl group-hover:scale-110 transition">
                      ▶
                    </div>
                  </div>
                </div>

                {/* Title & Channel */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 line-clamp-2">
                    {meta?.title || "Loading title..."}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {meta?.channel || "Loading channel..."}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Player */}
      {activeVideo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="relative w-full max-w-4xl top-4">
            {/* Close Button */}
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute -top-10 right-0 text-white text-3xl"
            >
              ✕
            </button>
            {/* Video iframe */}
            <div className="relative w-full h-0 pb-[56.25%] bg-black rounded-xl overflow-hidden">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1&rel=0`}
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
