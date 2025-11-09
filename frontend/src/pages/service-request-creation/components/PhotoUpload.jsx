import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';


const PhotoUpload = ({ photos, onPhotosChange }) => {
  const [dragActive, setDragActive] = useState(false);
  const maxPhotos = 5;

  const handleDrag = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (e?.type === "dragenter" || e?.type === "dragover") {
      setDragActive(true);
    } else if (e?.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setDragActive(false);
    
    if (e?.dataTransfer?.files && e?.dataTransfer?.files?.[0]) {
      handleFiles(e?.dataTransfer?.files);
    }
  };

  const handleChange = (e) => {
    e?.preventDefault();
    if (e?.target?.files && e?.target?.files?.[0]) {
      handleFiles(e?.target?.files);
    }
  };

  const handleFiles = (files) => {
    const fileArray = Array.from(files);
    const remainingSlots = maxPhotos - photos?.length;
    const filesToAdd = fileArray?.slice(0, remainingSlots);

    const newPhotos = filesToAdd?.map((file, index) => ({
      id: Date.now() + index,
      file,
      url: URL.createObjectURL(file),
      name: file?.name,
      size: file?.size
    }));

    onPhotosChange([...photos, ...newPhotos]);
  };

  const removePhoto = (photoId) => {
    const updatedPhotos = photos?.filter(photo => photo?.id !== photoId);
    onPhotosChange(updatedPhotos);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Add Photos (Optional)</h3>
        <span className="text-sm text-muted-foreground">{photos?.length}/{maxPhotos} photos</span>
      </div>
      <p className="text-sm text-muted-foreground">
        Photos help technicians understand the problem better and provide accurate estimates.
      </p>
      {photos?.length < maxPhotos && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 text-center trust-transition ${
            dragActive
              ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-muted/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <div className="space-y-3">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Icon name="ImagePlus" size={24} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Drop photos here or click to browse
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG up to 10MB each
              </p>
            </div>
          </div>
        </div>
      )}
      {photos?.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Uploaded Photos</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {photos?.map((photo) => (
              <div key={photo?.id} className="relative group">
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <img
                    src={photo?.url}
                    alt={photo?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => removePhoto(photo?.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 trust-transition"
                >
                  <Icon name="X" size={12} />
                </button>
                <div className="mt-1">
                  <p className="text-xs text-foreground truncate">{photo?.name}</p>
                  <p className="text-xs text-muted-foreground">{formatFileSize(photo?.size)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {photos?.length > 0 && (
        <div className="bg-muted/50 border border-border rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Icon name="Shield" size={16} className="text-primary" />
            <span className="text-sm text-foreground">Your photos are secure and only shared with matched technicians</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;