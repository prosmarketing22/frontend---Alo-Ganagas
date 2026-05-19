import { useState, useRef } from 'react';

export const QrUploader = ({ currentQr, onUpload, loading }) => {
  const [preview, setPreview] = useState(currentQr);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    if (onUpload) {
      await onUpload(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="qr-uploader">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        disabled={loading}
      />

      <div className="qr-uploader-preview" onClick={handleClick}>
        {preview ? (
          <img src={preview} alt="QR Preview" className="qr-uploader-image" />
        ) : (
          <div className="qr-uploader-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M4 16L8.586 11.414C9.367 10.633 10.633 10.633 11.414 11.414L16 16M14 14L15.586 12.414C16.367 11.633 17.633 11.633 18.414 12.414L20 14M14 8H14.01M6 20H18C19.105 20 20 19.105 20 18V6C20 4.895 19.105 4 18 4H6C4.895 4 4 4.895 4 6V18C4 19.105 4.895 20 6 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p>Click para subir QR</p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleClick}
        className="qr-uploader-button"
        disabled={loading}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M7 18C5.17595 18.4117 4 19.0443 4 19.7537C4 20.9943 7.58172 22 12 22C16.4183 22 20 20.9943 20 19.7537C20 19.0443 18.8241 18.4117 17 18M12 15V2M12 2L8 6M12 2L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {preview ? 'Cambiar imagen' : 'Subir imagen'}
      </button>

      <p className="qr-uploader-hint">Formatos: JPG, PNG. Máximo 5MB</p>
    </div>
  );
};
