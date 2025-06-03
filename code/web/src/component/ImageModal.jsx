import React from 'react';
import ReactDOM from 'react-dom';

const ImageModal = ({ imageUrl, onClose }) => {
  if (!imageUrl) return null;

  return ReactDOM.createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#fff',
          padding: '20px',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: '90vw',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
      >
        <img
          src={imageUrl}
          alt="포트홀 이미지"
          style={{
            maxWidth: '100%',
            maxHeight: '60vh',
            borderRadius: '4px',
            marginBottom: '16px',
          }}
        />
        <button
          onClick={onClose}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          닫기
        </button>
      </div>
    </div>,
    document.body
  );
};

export default ImageModal;