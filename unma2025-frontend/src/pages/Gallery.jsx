import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  PhotoIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import galleryApi from "../api/galleryApi";

// Skeleton component for loading images
const ImageSkeleton = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="w-full h-64 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl animate-pulse flex items-center justify-center"
  >
    <PhotoIcon className="w-12 h-12 text-gray-400" />
  </motion.div>
);

// Optimized Image component with intersection observer
const LazyImage = ({ image, index, onLoad, onClick, isVisible }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    onLoad(index);
  }, [index, onLoad]);

  const handleImageError = useCallback(() => {
    setImageError(true);
    console.error(`Failed to load image: ${image.fileName}`);
  }, [image.fileName]);

  if (!isVisible) {
    return <ImageSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.5 }}
      className="group cursor-pointer"
      onClick={() => onClick(image, index)}
      whileHover={{
        scale: 1.05,
        y: -10,
        transition: {
          duration: 0.3,
          ease: "easeOut",
        },
      }}
    >
      <div className="relative overflow-hidden rounded-2xl shadow-lg bg-white">
        <div className="aspect-w-4 aspect-h-3 relative">
          {!imageLoaded && !imageError && <ImageSkeleton />}

          {!imageError && (
            <img
              src={image.src}
              alt={image.title}
              onLoad={handleImageLoad}
              onError={handleImageError}
              className={`w-full h-64 object-cover transition-all duration-500 group-hover:scale-110 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              loading="lazy"
              decoding="async"
            />
          )}

          {imageError && (
            <div className="w-full h-64 bg-gray-200 rounded-2xl flex items-center justify-center">
              <div className="text-center text-gray-500">
                <PhotoIcon className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">Image unavailable</p>
              </div>
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Loading indicator */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
              />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Intersection Observer Hook
const useIntersectionObserver = (options = {}) => {
  const [entries, setEntries] = useState(new Map());
  const [observer, setObserver] = useState(null);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (observedEntries) => {
        setEntries((prev) => {
          const newEntries = new Map(prev);
          observedEntries.forEach((entry) => {
            newEntries.set(entry.target, entry);
          });
          return newEntries;
        });
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
        ...options,
      }
    );

    setObserver(obs);

    return () => obs.disconnect();
  }, []);

  const observe = useCallback(
    (element) => {
      if (observer && element) {
        observer.observe(element);
      }
    },
    [observer]
  );

  const unobserve = useCallback(
    (element) => {
      if (observer && element) {
        observer.unobserve(element);
      }
    },
    [observer]
  );

  return { entries, observe, unobserve };
};

// Pagination Hook
const usePagination = (items, itemsPerPage = 20) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return {
    currentItems,
    currentPage,
    totalPages,
    goToPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
};

// Separate component for gallery item to handle refs properly
const GalleryItem = ({ image, index, onLoad, onClick, observe, entries }) => {
  const elementRef = useRef();
  const entry = entries.get(elementRef.current);
  const isVisible = entry?.isIntersecting ?? false;

  useEffect(() => {
    const element = elementRef.current;
    if (element && observe) {
      observe(element);
    }
  }, [observe]);

  return (
    <div key={`${image.id}-${index}`} ref={elementRef}>
      <LazyImage
        image={image}
        index={index}
        onLoad={onLoad}
        onClick={onClick}
        isVisible={isVisible}
      />
    </div>
  );
};

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [allImages, setAllImages] = useState([]);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch gallery images from S3 on component mount
  useEffect(() => {
    const fetchImages = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await galleryApi.getImages();
        if (response.success && response.images) {
          setAllImages(response.images);
        } else {
          setError("No images found");
          setAllImages([]);
        }
      } catch (err) {
        console.error("Error fetching gallery images:", err);
        setError(err.message || "Failed to load gallery images");
        setAllImages([]);
        toast.error("Failed to load gallery images. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, []);

  // Filter images based on search
  const filteredImages = useMemo(() => {
    if (!searchTerm) return allImages;
    return allImages.filter(
      (image) =>
        image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allImages, searchTerm]);

  // Pagination
  const {
    currentItems: paginatedImages,
    currentPage,
    totalPages,
    goToPage,
    hasNextPage,
    hasPrevPage,
  } = usePagination(filteredImages, 20);

  // Intersection Observer
  const { entries, observe } = useIntersectionObserver();


  const handleImageLoad = useCallback((index) => {
    setLoadedImages((prev) => new Set([...prev, index]));
  }, []);

  const openLightbox = useCallback(
    (image, index) => {
      setSelectedImage(image);
      // Find the actual index in the full filtered array
      const actualIndex = filteredImages.findIndex(
        (img) => img.id === image.id
      );
      setCurrentImageIndex(actualIndex);
      document.body.style.overflow = "hidden";
    },
    [filteredImages]
  );

  const closeLightbox = useCallback(() => {
    setSelectedImage(null);
    document.body.style.overflow = "auto";
  }, []);

  const navigateImage = useCallback(
    (direction) => {
      const newIndex =
        direction === "next"
          ? (currentImageIndex + 1) % filteredImages.length
          : (currentImageIndex - 1 + filteredImages.length) %
            filteredImages.length;

      setCurrentImageIndex(newIndex);
      setSelectedImage(filteredImages[newIndex]);
    },
    [currentImageIndex, filteredImages]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") navigateImage("prev");
      if (e.key === "ArrowRight") navigateImage("next");
    },
    [closeLightbox, navigateImage]
  );

  useEffect(() => {
    if (selectedImage) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [selectedImage, handleKeyDown]);

  // Preload next images for better UX
  useEffect(() => {
    if (hasNextPage && paginatedImages.length > 0) {
      const nextPageStart = currentPage * 20;
      const nextPageImages = filteredImages.slice(
        nextPageStart,
        nextPageStart + 5
      );

      nextPageImages.forEach((image) => {
        const img = new Image();
        img.src = image.src;
      });
    }
  }, [currentPage, hasNextPage, filteredImages, paginatedImages]);

  // Handle file upload
  const handleFileSelect = useCallback((event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Only images (JPEG, PNG, GIF, WEBP) are allowed.");
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("File size too large. Maximum size is 10MB.");
      return;
    }

    uploadFile(file);
  }, []);

  const uploadFile = useCallback(async (file) => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const response = await galleryApi.uploadPhoto(file, (progress) => {
        setUploadProgress(progress);
      });

      if (response.success) {
        toast.success("Photo uploaded successfully!");
        setShowUploadModal(false);
        setUploadProgress(0);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        // Refresh gallery images
        const refreshResponse = await galleryApi.getImages();
        if (refreshResponse.success && refreshResponse.images) {
          setAllImages(refreshResponse.images);
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload photo. Please try again.");
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
        <p className="mt-4 text-gray-600">Loading gallery images...</p>
      </div>
    );
  }

  if (error && allImages.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4">
        <div className="text-center">
          <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to Load Gallery</h2>
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

          {/* Upload Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="max-w-md mx-auto"
          >
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <CloudArrowUpIcon className="w-5 h-5" />
              Want to upload Summit 2025 photos?
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats Bar
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="px-4 py-6"
      >
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-blue-600">
                {allImages.length}
              </p>
              <p className="text-gray-600">Total Images</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-600">
                {filteredImages.length}
              </p>
              <p className="text-gray-600">Filtered Results</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-pink-600">
                {loadedImages.size}
              </p>
              <p className="text-gray-600">Loaded Images</p>
            </div>
          </div>
        </div>
      </motion.div> */}

      {/* Gallery Grid */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="px-4 py-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedImages.map((image, index) => {
              const actualIndex = (currentPage - 1) * 20 + index;

              return (
                <GalleryItem
                  key={`${image.id}-${currentPage}`}
                  image={image}
                  index={actualIndex}
                  onLoad={handleImageLoad}
                  onClick={openLightbox}
                  observe={observe}
                  entries={entries}
                />
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * 20 + 1} to{" "}
                {Math.min(currentPage * 20, filteredImages.length)} of{" "}
                {filteredImages.length} images
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={!hasPrevPage}
                  className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`w-10 h-10 rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? "bg-blue-600 text-white"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={!hasNextPage}
                  className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
            onClick={closeLightbox}
          >
            <div className="absolute inset-0 flex items-center justify-center p-4">
              {/* Close Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors"
                onClick={closeLightbox}
              >
                <XMarkIcon className="w-6 h-6 text-white" />
              </motion.button>

              {/* Navigation Buttons */}
              <motion.button
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage("prev");
                }}
              >
                <ChevronLeftIcon className="w-6 h-6 text-white" />
              </motion.button>

              <motion.button
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateImage("next");
                }}
              >
                <ChevronRightIcon className="w-6 h-6 text-white" />
              </motion.button>

              {/* Image Counter */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 z-10 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm"
              >
                {currentImageIndex + 1} of {filteredImages.length}
              </motion.div>

              {/* Image and Content */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 50 }}
                className="max-w-5xl max-h-full flex flex-col items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={selectedImage.src}
                  alt={selectedImage.title}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl"
                />

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-6 text-center text-white max-w-2xl"
                >
                  <h3 className="text-2xl font-bold mb-2">
                    {selectedImage.title}
                  </h3>
                  <p className="text-lg opacity-90 mb-4">
                    {selectedImage.description}
                  </p>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
          )}
        </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => !isUploading && setShowUploadModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-800">
                  Upload Summit 2025 Photo
                </h3>
                <button
                  onClick={() => !isUploading && setShowUploadModal(false)}
                  disabled={isUploading}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                >
                  <XMarkIcon className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Photo
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleFileSelect}
                    disabled={isUploading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Supported formats: JPEG, PNG, GIF, WEBP (Max 10MB)
                  </p>
                </div>

                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <motion.div
                        className="bg-blue-600 h-2.5 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      setUploadProgress(0);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    disabled={isUploading}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
