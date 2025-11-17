import React, { useEffect, useState, useRef } from "react";
import "./ImageGallery.css";

function ImageGallery({ images = [] }) {
  const scrollRef = useRef(null);

  // Scroll left
  const scrollLeft = () => {
    scrollRef.current.scrollBy({
      left: -300,
      behavior: "smooth",
    });
  };

  // Scroll right
  const scrollRight = () => {
    scrollRef.current.scrollBy({
      left: 300,
      behavior: "smooth",
    });
  };

  return (
    <div className="gallery-wrapper">
      <button className="gallery-arrow left" onClick={scrollLeft}>
        ❮
      </button>

      <div className="gallery-container" ref={scrollRef}>
        {images
          .sort((a, b) => a.order - b.order) // <-- SORT BY ORDER FIELD
          .map((img) => (
            <img key={img.id} src={img.url} alt={img.alt || ""} />
          ))}
      </div>

      <button className="gallery-arrow right" onClick={scrollRight}>
        ❯
      </button>
    </div>
  );
}

export default ImageGallery;
