import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  PhotoIcon,
  ArrowRightIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import galleryApi from "../api/galleryApi";

const GalleryLanding = () => {
  const [galleries, setGalleries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGalleries = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await galleryApi.getGalleries();
        if (response.success && response.galleries) {
          setGalleries(response.galleries);
        } else {
          setError("No galleries found");
          setGalleries([]);
        }
      } catch (err) {
        console.error("Error fetching galleries:", err);
        setError(err.message || "Failed to load galleries");
        setGalleries([]);
        toast.error("Failed to load galleries. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGalleries();
  }, []);

  const handleGalleryClick = (folderName) => {
    navigate(`/gallery/${folderName}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
        <p className="mt-4 text-gray-600">Loading galleries...</p>
      </div>
    );
  }

  if (error && galleries.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4">
        <div className="text-center">
          <FolderIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Unable to Load Galleries
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative py-20 px-4 text-center overflow-hidden"
      >
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20"
          />
          <motion.div
            animate={{ x: [0, -100, 0], y: [0, 100, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-10 right-10 w-32 h-32 bg-purple-200 rounded-full opacity-20"
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6"
          >
            UNMA Gallery
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed"
          >
            Capturing Moments, Preserving Memories
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-lg text-gray-600 max-w-3xl mx-auto mb-8"
          >
            Journey through the inspiring moments of our United Navodaya
            Malayali Association community. From heartwarming reunions to
            impactful initiatives, every image tells a story of excellence,
            unity, and the enduring spirit of Navodaya values.
          </motion.div>
        </div>
      </motion.section>

      {/* Gallery Cards Grid */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="px-4 py-8 pb-20"
      >
        <div className="max-w-7xl mx-auto">
          {galleries.length === 0 ? (
            <div className="text-center py-20">
              <PhotoIcon className="w-24 h-24 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-700 mb-2">
                No Galleries Available
              </h3>
              <p className="text-gray-500">
                Check back later for gallery updates.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-6">
              {galleries.map((gallery, index) => (
                <motion.div
                  key={gallery.name}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                  whileHover={{ scale: 1.05, y: -10 }}
                  className="group cursor-pointer w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] xl:w-[calc(25%-1.125rem)]"
                  onClick={() => handleGalleryClick(gallery.name)}
                >
                  <div className="relative overflow-hidden rounded-2xl shadow-lg bg-white h-full flex flex-col">
                    {/* Thumbnail Image */}
                    <div className="relative aspect-w-4 aspect-h-3 w-full h-64 bg-gradient-to-br from-gray-200 to-gray-300">
                      {gallery.thumbnail ? (
                        <img
                          src={gallery.thumbnail}
                          alt={gallery.displayName}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <PhotoIcon className="w-16 h-16 text-gray-400" />
                        </div>
                      )}

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      {/* Image Count Badge */}
                      <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-gray-800">
                        {gallery.imageCount} {gallery.imageCount === 1 ? "photo" : "photos"}
                      </div>
                    </div>

                    {/* Gallery Info */}
                    <div className="p-6 flex-grow flex flex-col">
                      <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                        {gallery.displayName}
                      </h3>
                      <div className="mt-auto flex items-center text-blue-600 font-semibold">
                        <span>View Gallery</span>
                        <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.section>
    </div>
  );
};

export default GalleryLanding;
