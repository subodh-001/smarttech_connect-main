import React, { useState } from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProfileHeader = ({ userProfile, onProfilePhotoUpdate }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handlePhotoUpload = async (event) => {
    const file = event?.target?.files?.[0];
    if (!file) return;

    setIsUploading(true);
    // Mock upload delay
    setTimeout(() => {
      const newPhotoUrl = `https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face`;
      onProfilePhotoUpdate(newPhotoUrl);
      setIsUploading(false);
    }, 2000);
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-6 mb-6">
      <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
        {/* Profile Photo */}
        <div className="relative">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-primary/20">
            <Image
              src={userProfile?.profilePhoto}
              alt={`${userProfile?.name}'s profile`}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Upload Button */}
          <div className="absolute -bottom-2 -right-2">
            <label htmlFor="photo-upload" className="cursor-pointer">
              <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-elevated hover:bg-primary/90 transition-smooth">
                {isUploading ? (
                  <Icon name="Loader2" size={16} className="animate-spin" />
                ) : (
                  <Icon name="Camera" size={16} />
                )}
              </div>
            </label>
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              disabled={isUploading}
            />
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-text-primary mb-1">
                {userProfile?.name}
              </h1>
              <p className="text-text-secondary mb-2">{userProfile?.email}</p>
              <p className="text-sm text-text-secondary">{userProfile?.phone}</p>
            </div>
            
            {/* Verification Status */}
            <div className="flex items-center space-x-2 mt-3 md:mt-0">
              {userProfile?.isVerified ? (
                <div className="flex items-center space-x-1 bg-success/10 text-success px-3 py-1 rounded-full">
                  <Icon name="CheckCircle" size={16} />
                  <span className="text-sm font-medium">Verified</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 bg-warning/10 text-warning px-3 py-1 rounded-full">
                  <Icon name="AlertCircle" size={16} />
                  <span className="text-sm font-medium">Pending Verification</span>
                </div>
              )}
            </div>
          </div>

          {/* Account Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <div className="text-center">
              <div className="text-lg font-semibold text-text-primary">
                {userProfile?.stats?.totalBookings}
              </div>
              <div className="text-sm text-text-secondary">Total Bookings</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-text-primary">
                ${userProfile?.stats?.totalSpent}
              </div>
              <div className="text-sm text-text-secondary">Total Spent</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-text-primary">
                {userProfile?.stats?.memberSince}
              </div>
              <div className="text-sm text-text-secondary">Member Since</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;