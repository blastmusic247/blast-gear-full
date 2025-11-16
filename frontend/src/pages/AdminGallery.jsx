import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import AdminNavbar from "../components/AdminNavbar";
import { toast } from "../components/ui/sonner";

const API_BASE =
  process.env.REACT_APP_BACKEND_URL ||
  "https://blast-gear-backend.onrender.com";

export default function AdminGallery() {
  const [images, setImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [defaultAlt, setDefaultAlt] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // ----------------------------------------------------
  // LOAD GALLERY IMAGES
  // ----------------------------------------------------
  const fetchImages = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/gallery-images`);
      setImages(res.data || []);
    } catch (err) {
      toast.error("Failed to load gallery images.");
    }
  }, []);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // ----------------------------------------------------
  // FILE SELECTION
  // ----------------------------------------------------
  const handleFilesSelected = (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    const allowed = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif"
    ];

    const filtered = files.filter((file) => allowed.includes(file.type));
    if (!filtered.length) {
      toast.error("Only JPG, PNG, WEBP, GIF formats allowed.");
      return;
    }

    setSelectedFiles((prev) => [...prev, ...filtered]);
  };

  // ----------------------------------------------------
  // DRAG + DROP (SAFE — stops browser override)
  // ----------------------------------------------------
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const dropped = e.dataTransfer.files;
    if (dropped?.length) {
      handleFilesSelected(dropped);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // ----------------------------------------------------
  // BULK UPLOAD
  // ----------------------------------------------------
  const handleBulkUpload = async () => {
    if (!selectedFiles.length) {
      toast.error("Please select images first.");
      return;
    }

    const token = localStorage.getItem("admin_token");
    if (!token) {
      toast.error("Session expired.");
      window.location.href = "/admin";
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files", file));
    formData.append("default_alt", defaultAlt || "");

    setIsUploading(true);
    setUploadProgress(0);

    try {
      await axios.post(
        `${API_BASE}/api/admin/gallery-images/bulk-upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          onUploadProgress: (e) => {
            if (e.total) {
              setUploadProgress(Math.round((e.loaded / e.total) * 100));
            }
          }
        }
      );

      toast.success("Upload complete!");

      setSelectedFiles([]);
      setDefaultAlt("");
      setUploadProgress(0);
      fetchImages();
    } catch (err) {
      toast.error("Upload failed. Try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // ----------------------------------------------------
  // DELETE IMAGE
  // ----------------------------------------------------
  const handleDelete = async (id) => {
    const token = localStorage.getItem("admin_token");

    if (!window.confirm("Delete this image?")) return;

    try {
      await axios.delete(`${API_BASE}/api/admin/gallery-images/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Image deleted.");
      fetchImages();
    } catch (err) {
      toast.error("Failed to delete image.");
    }
  };

  // ----------------------------------------------------
  // UI
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-dark-bg text-white pb-16">
      <AdminNavbar />

      <div className="max-w-5xl mx-auto pt-24 px-6">
        <h1 className="text-4xl font-serif mb-6">Gallery Manager</h1>

        {/* Upload Section */}
        <div className="bg-card-dark border border-soft-gray rounded-xl p-8 mb-10">
          <h2 className="text-2xl font-semibold mb-4">Upload Images</h2>

          <label
            className="flex flex-col items-center justify-center border-2 border-dashed border-soft-gray/70 rounded-xl py-10 cursor-pointer bg-black/20 hover:border-warm-sage transition"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFilesSelected(e.target.files)}
            />
            <p className="text-lg">Drag & Drop or Click to Upload</p>
          </label>

          {selectedFiles.length > 0 && (
            <>
              <p className="mt-4 text-sm text-warm-gray">
                {selectedFiles.length} file(s) selected
              </p>

              <input
                className="mt-3 w-full bg-black/40 border border-soft-gray rounded px-3 py-2 text-sm text-white"
                placeholder="Default ALT text (optional)"
                value={defaultAlt}
                onChange={(e) => setDefaultAlt(e.target.value)}
              />

              {isUploading && (
                <div className="w-full bg-black/40 border border-soft-gray mt-4 rounded overflow-hidden">
                  <div
                    className="bg-warm-sage text-black text-xs py-1 text-center"
                    style={{ width: `${uploadProgress}%` }}
                  >
                    {uploadProgress}%
                  </div>
                </div>
              )}

              <button
                onClick={handleBulkUpload}
                disabled={isUploading}
                className="mt-5 px-6 py-3 bg-warm-sage text-black font-bold rounded-md uppercase text-xs hover:bg-warm-sage/90"
              >
                {isUploading ? "Uploading..." : "Upload Images"}
              </button>
            </>
          )}
        </div>

        {/* Current Images */}
        <h2 className="text-2xl font-semibold mb-4">Current Gallery Images</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {images.map((img) => (
            <div
              key={img.id}
              className="bg-card-dark border border-soft-gray rounded-xl overflow-hidden"
            >
              <img
                src={img.url}
                className="w-full h-40 object-cover"
                alt={img.alt || "Gallery"}
              />

              <div className="p-4">
                <p className="text-sm truncate">{img.alt || "No description"}</p>

                <button
                  onClick={() => handleDelete(img.id)}
                  className="mt-3 w-full py-2 text-xs bg-red-600 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
