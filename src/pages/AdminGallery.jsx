import React, { useState, useEffect } from "react";
import axios from "axios";
import "./AdminGallery.css";

const backendURL =
  process.env.REACT_APP_API_URL ||
  process.env.REACT_APP_BACKEND_URL ||
  "https://blast-gear-backend.onrender.com";

function AdminGallery() {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);

  // Load gallery images
  const fetchImages = async () => {
    try {
      const res = await axios.get(`${backendURL}/api/gallery`);
      setImages(res.data);
    } catch (err) {
      console.error("Failed to fetch gallery", err);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  // Upload new image
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      await axios.post(`${backendURL}/api/upload/gallery`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      fetchImages(); // reload
    } catch (err) {
      console.error("Upload failed:", err);
    }

    setUploading(false);
  };

  // Delete image
  const deleteImage = async (id) => {
    if (!window.confirm("Delete this image?")) return;

    try {
      await axios.delete(`${backendURL}/api/gallery/${id}`);
      fetchImages();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  // Drag & Drop reorder — Step 1: drag start
  const handleDragStart = (index) => {
    setDragIndex(index);
  };

  // Step 2: drag over target
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Step 3: drop on target
  const handleDrop = (dropIndex) => {
    const updated = [...images];
    const draggedItem = updated[dragIndex];

    updated.splice(dragIndex, 1);
    updated.splice(dropIndex, 0, draggedItem);

    setImages(updated);
    setDragIndex(null);
  };

  // Save new order to backend
  const saveOrder = async () => {
    const ordered = images.map((img, index) => ({
      id: img.id,
      order: index,
    }));

    try {
      await axios.put(`${backendURL}/api/gallery/reorder`, { ordered });
      alert("Gallery order saved!");
    } catch (err) {
      console.error("Order save failed", err);
      alert("Failed to save order.");
    }
  };

  return (
    <div className="admin-gallery-page">
      <h1>Gallery Manager</h1>

      {/* Upload Section */}
      <div className="upload-section">
        <label className="upload-label">
          Upload Image
          <input type="file" onChange={handleImageUpload} hidden />
        </label>
        {uploading && <p>Uploading...</p>}
      </div>

      {/* Image List */}
      <div className="gallery-list">
        {images.map((img, index) => (
          <div
            key={img.id}
            className="gallery-item"
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(index)}
          >
            <img src={img.url} alt={img.alt || ""} />

            <div className="gallery-actions">
              <button onClick={() => deleteImage(img.id)}>Delete</button>
            </div>

            <div className="order-number">#{index + 1}</div>
          </div>
        ))}
      </div>

      {/* Save Order Button */}
      <button className="save-order-btn" onClick={saveOrder}>
        Save Gallery Order
      </button>
    </div>
  );
}

export default AdminGallery;
