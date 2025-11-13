import React, { useState, useEffect } from 'react';
import { Camera, Upload, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../../contexts/NewAuthContext';

const ProfileImageUpload = ({ currentImage, onImageUpdate }) => {
  const { userProfile, fetchUserProfile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => {}, []);

  const handleFileSelect = async (event) => {
    const file = event?.target?.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file?.type?.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file?.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Upload image to backend
      const publicUrl = previewUrl;
      onImageUpdate?.(publicUrl);
      const stored = localStorage.getItem('smarttech_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        localStorage.setItem('smarttech_user', JSON.stringify({ ...parsed, avatar: publicUrl }));
      }
      await axios.put('/api/users/me', { avatarUrl: publicUrl });
      await fetchUserProfile();
      onImageUpdate?.(publicUrl);

    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = async () => {
    setPreview(null);
    try {
      await axios.put('/api/users/me', { avatarUrl: '' });
      await fetchUserProfile();
      onImageUpdate?.('');
    } catch (error) {
      console.error('Error removing image:', error);
      alert('Error removing image. Please try again.');
    }
  };

   const displayImage = preview || currentImage;

   return (
     <div className="relative">
       <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center relative">
         {displayImage ? (
           <img
             src={displayImage}
             alt="Profile"
             className="w-full h-full object-cover"
             onError={(e) => {
               e.target.style.display = 'none';
               e.target.nextSibling.style.display = 'flex';
             }}
           />
         ) : (
           <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
-            {user?.email?.charAt(0)?.toUpperCase() || 'U'}
+            {userProfile?.full_name?.charAt(0)?.toUpperCase() || userProfile?.email?.charAt(0)?.toUpperCase() || 'U'}
           </div>
         )}
         
         {uploading && (
           <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
             <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
           </div>
         )}
       </div>

       <div className="absolute -bottom-2 -right-2 flex space-x-1">
         {displayImage && (
           <button
             onClick={removeImage}
             disabled={uploading}
             className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-lg transition-colors disabled:opacity-50"
             title="Remove image"
           >
             <X className="h-3 w-3" />
           </button>
         )}
         
         <label className="bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded-full shadow-lg transition-colors cursor-pointer disabled:opacity-50">
           <Camera className="h-3 w-3" />
           <input
             type="file"
             accept="image/*"
             onChange={handleFileSelect}
             disabled={uploading}
             className="hidden"
           />
         </label>
       </div>
     </div>
   );
};

 export default ProfileImageUpload;