import React, { useState } from 'react';
import { X } from 'lucide-react';

const ImageGallery = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  return (
    <>
      {/* Scrolling Gallery */}
      <div className='w-full overflow-hidden py-8'>
        <div 
          className='flex gap-4 px-4'
          style={{
            animation: 'scroll 40s linear infinite'
          }}
          onMouseEnter={(e) => e.currentTarget.style.animationPlayState = 'paused'}
          onMouseLeave={(e) => e.currentTarget.style.animationPlayState = 'running'}
        >
          {/* Duplicate images for seamless loop */}
          {[...images, ...images].map((image, index) => (
            <div
              key={index}
              onClick={() => handleImageClick(image)}
              className='flex-shrink-0 cursor-pointer group relative overflow-hidden rounded-lg'
              style={{ width: '300px', height: '300px' }}
            >
              <img
                src={image.url}
                alt={image.alt}
                className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110'
              />
              <div className='absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center'>
                <span className='text-white opacity-0 group-hover:opacity-100 text-sm font-medium tracking-wide uppercase'>
                  View Image
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className='fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6'
          onClick={closeModal}
        >
          <button
            onClick={closeModal}
            className='absolute top-6 right-6 text-white hover:text-warm-sage transition-colors z-10'
          >
            <X className='w-8 h-8' />
          </button>
          
          <div
            className='relative max-w-7xl max-h-[90vh] flex items-center justify-center'
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.url}
              alt={selectedImage.alt}
              className='max-w-full max-h-[90vh] object-contain rounded-lg'
            />
          </div>
          
          <div className='absolute bottom-6 left-1/2 transform -translate-x-1/2 text-warm-gray text-sm'>
            Click anywhere to close
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;
