import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import axios from 'axios';
import { useAuth } from '../../../contexts/NewAuthContext';

const ChangePhotoModal = ({ isOpen, onClose, currentPhoto, onSave, userName }) => {
  const { fetchUserProfile } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const previewRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setPreview(currentPhoto || null);
      setSelectedFile(null);
      setZoom(1);
      setRotation(0);
    }
  }, [isOpen, currentPhoto]);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const handleFileSelect = (event) => {
    const file = event?.target?.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, etc.)');
      return;
    }

    // Validate file size (1.5MB max raw file to account for base64 encoding overhead)
    // Base64 encoding increases size by ~33%, so 1.5MB raw = ~2MB base64, which is safe
    const maxFileSize = 1.5 * 1024 * 1024; // 1.5MB
    if (file.size > maxFileSize) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      alert(`Image size (${fileSizeMB}MB) is too large. Please use an image smaller than 1.5MB.`);
      event.target.value = '';
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      setZoom(1);
      setRotation(0);
    };
    reader.readAsDataURL(file);
  };

  const handleChangePhoto = () => {
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setPreview(null);
    setZoom(1);
    setRotation(0);
  };

  const handleZoomChange = (delta) => {
    setZoom((prev) => Math.max(0.5, Math.min(3, prev + delta)));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleSave = async () => {
    if (!selectedFile && preview === null) {
      // Remove photo
      setIsUploading(true);
      try {
        await axios.put('/api/users/me', { avatarUrl: '' });
        
        // Refresh user profile to get the latest data
        if (fetchUserProfile) {
          await fetchUserProfile();
        }
        
        if (typeof onSave === 'function') {
          onSave('');
        }
        onClose();
      } catch (error) {
        console.error('Failed to remove photo:', error);
        alert('Failed to remove photo. Please try again.');
      } finally {
        setIsUploading(false);
      }
      return;
    }

    if (!selectedFile && preview) {
      // No new file selected, just close
      onClose();
      return;
    }

    setIsUploading(true);
    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const base64DataUrl = reader.result;

          // Upload to backend
          const response = await axios.put('/api/users/me', {
            avatarUrl: base64DataUrl,
          });

          const uploadedUrl = response?.data?.avatarUrl || base64DataUrl;

          // Update localStorage
          try {
            const stored = localStorage.getItem('smarttech_user');
            if (stored) {
              const parsed = JSON.parse(stored);
              parsed.avatarUrl = uploadedUrl;
              localStorage.setItem('smarttech_user', JSON.stringify(parsed));
            }
          } catch (storageError) {
            console.warn('Failed to update localStorage:', storageError);
          }

          // Refresh user profile to get the latest data
          if (fetchUserProfile) {
            await fetchUserProfile();
          }

          if (typeof onSave === 'function') {
            onSave(uploadedUrl);
          }

          onClose();
        } catch (uploadError) {
          console.error('Failed to upload photo:', uploadError);
          const errorMessage = uploadError?.response?.data?.error || uploadError?.message || 'Failed to upload photo. Please try again.';
          alert(errorMessage);
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        alert('Failed to read image file. Please try again.');
        setIsUploading(false);
      };

      reader.readAsDataURL(selectedFile);
    } catch (error) {
      console.error('Failed to process photo:', error);
      alert('Failed to process photo. Please try again.');
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview(currentPhoto || null);
    setZoom(1);
    setRotation(0);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleCancel();
        }
      }}
      style={{ zIndex: 2000 }}
    >
      <div 
        className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Change photo</h2>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Preview Area */}
          <div className="flex justify-center mb-6">
            <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-border bg-primary/10 flex items-center justify-center">
              {preview ? (
                <img
                  ref={previewRef}
                  src={preview}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                  style={{
                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    transition: 'transform 0.2s ease',
                  }}
                />
              ) : (
                <div className="w-full h-full bg-primary text-primary-foreground flex items-center justify-center text-6xl font-semibold">
                  {getInitials(userName)}
                </div>
              )}
            </div>
          </div>

          {/* Zoom Controls */}
          {preview && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => handleZoomChange(-0.1)}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                  disabled={zoom <= 0.5}
                >
                  <Icon name="Minus" size={20} className="text-foreground" />
                </button>
                <div className="flex-1 mx-4">
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <button
                  onClick={() => handleZoomChange(0.1)}
                  className="p-2 rounded-full hover:bg-muted transition-colors"
                  disabled={zoom >= 3}
                >
                  <Icon name="Plus" size={20} className="text-foreground" />
                </button>
              </div>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => handleZoomChange(0.1)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm text-muted-foreground"
                >
                  <Icon name="ZoomIn" size={16} />
                  <span>Zoom</span>
                </button>
                <button
                  onClick={handleRotate}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-sm text-muted-foreground"
                >
                  <Icon name="RotateCw" size={16} />
                  <span>Rotate</span>
                </button>
              </div>
            </div>
          )}

          {/* Instructions */}
          {preview && (
            <p className="text-xs text-muted-foreground text-center mb-6">
              Edit your photo by adjusting the zoom and rotation. You can use the controls above or the slider.
            </p>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              variant="default"
              onClick={handleChangePhoto}
              className="w-full"
              iconName="Camera"
              iconPosition="left"
            >
              Change photo
            </Button>
            {preview && (
              <Button
                variant="outline"
                onClick={handleRemovePhoto}
                className="w-full"
                iconName="Trash2"
                iconPosition="left"
              >
                Remove photo
              </Button>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleSave}
            loading={isUploading}
            disabled={isUploading}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChangePhotoModal;

