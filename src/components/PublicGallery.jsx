import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Upload, X, GripVertical } from 'lucide-react';

export default function PythonScrollingGallery() {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file),
      name: file.name
    }));
    setUploadedImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (id) => {
    setUploadedImages(prev => prev.filter(img => img.id !== id));
    if (currentIndex >= uploadedImages.length - 1 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex(prev => 
      prev === 0 ? uploadedImages.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex(prev => 
      prev === uploadedImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...uploadedImages];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);
    
    setUploadedImages(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-yellow-700 to-blue-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-yellow-300 mb-2" style={{ fontFamily: 'Arial Black, sans-serif' }}>
            PYTHON GALLERY
          </h1>
          <p className="text-white text-lg">Upload, reorder, and scroll through your images</p>
        </div>

        {/* Scrolling Marquee with Controls */}
        <div className="bg-yellow-400 rounded-lg shadow-2xl p-6 mb-8">
          <div className="relative">
            {uploadedImages.length > 0 ? (
              <div className="flex items-center justify-center gap-4">
                {/* Left Arrow */}
                <button
                  onClick={handlePrevious}
                  className="bg-blue-800 hover:bg-blue-900 text-white p-3 rounded-full transition-all shadow-lg z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={32} />
                </button>

                {/* Image Display */}
                <div className="flex-1 flex justify-center items-center h-96 overflow-hidden">
                  <img
                    src={uploadedImages[currentIndex].url}
                    alt={uploadedImages[currentIndex].name}
                    className="max-h-full max-w-full object-contain rounded-lg shadow-xl"
                  />
                </div>

                {/* Right Arrow */}
                <button
                  onClick={handleNext}
                  className="bg-blue-800 hover:bg-blue-900 text-white p-3 rounded-full transition-all shadow-lg z-10"
                  aria-label="Next image"
                >
                  <ChevronRight size={32} />
                </button>
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center">
                <p className="text-blue-900 text-2xl font-bold">Upload images to get started!</p>
              </div>
            )}

            {/* Image Counter */}
            {uploadedImages.length > 0 && (
              <div className="text-center mt-4">
                <span className="bg-blue-900 text-white px-4 py-2 rounded-full font-bold">
                  {currentIndex + 1} / {uploadedImages.length}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Upload and Reorder Section */}
        <div className="bg-white rounded-lg shadow-2xl p-6">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">Manage Images</h2>
          
          {/* Upload Button */}
          <div className="mb-6">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-800 hover:bg-blue-900 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-bold transition-all"
            >
              <Upload size={20} />
              Upload Images
            </button>
          </div>

          {/* Image Reordering Grid */}
          {uploadedImages.length > 0 && (
            <div>
              <p className="text-gray-700 mb-3 font-semibold">
                Drag to reorder images (order affects gallery display):
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {uploadedImages.map((img, index) => (
                  <div
                    key={img.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`relative bg-gray-100 rounded-lg overflow-hidden cursor-move border-2 ${
                      draggedIndex === index ? 'border-blue-500 opacity-50' : 'border-transparent'
                    } hover:border-blue-300 transition-all`}
                  >
                    {/* Drag Handle */}
                    <div className="absolute top-2 left-2 bg-white rounded p-1 shadow-md z-10">
                      <GripVertical size={16} className="text-gray-600" />
                    </div>

                    {/* Order Number */}
                    <div className="absolute top-2 right-2 bg-blue-800 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-md z-10">
                      {index + 1}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeImage(img.id)}
                      className="absolute bottom-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-md z-10 transition-all"
                      aria-label="Remove image"
                    >
                      <X size={16} />
                    </button>

                    {/* Image */}
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-full h-32 object-cover"
                    />
                    
                    {/* Image Name */}
                    <div className="p-2 bg-white">
                      <p className="text-xs text-gray-600 truncate">{img.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}