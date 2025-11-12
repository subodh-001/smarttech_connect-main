import React, { useState } from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import ChangePhotoModal from './ChangePhotoModal';
import { useAuth } from '../../../contexts/NewAuthContext';

const ProfileHeader = ({ userProfile, onProfilePhotoUpdate }) => {
  const { user } = useAuth();
  const [imageError, setImageError] = useState(false);
  const [showChangePhotoModal, setShowChangePhotoModal] = useState(false);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const handlePhotoSave = (newPhotoUrl) => {
    if (typeof onProfilePhotoUpdate === 'function') {
      onProfilePhotoUpdate(newPhotoUrl);
    }
    setImageError(false);
  };

  const handleOpenModal = () => {
    setShowChangePhotoModal(true);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-sm sm:px-8 sm:py-7 mb-6">
      <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
        {/* Profile Photo */}
        <div className="relative group">
          <button
            onClick={handleOpenModal}
            className="cursor-pointer block w-full"
            type="button"
          >
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-primary/20 bg-primary/10 flex items-center justify-center relative group-hover:opacity-90 transition-opacity">
              {userProfile?.profilePhoto && !imageError ? (
                <img
                  src={userProfile.profilePhoto}
                  alt={`${userProfile?.name}'s profile`}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full bg-primary text-primary-foreground flex items-center justify-center text-3xl md:text-4xl font-semibold">
                  {getInitials(userProfile?.name)}
                </div>
              )}
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full pointer-events-none">
                <div className="bg-white/90 rounded-full p-2">
                  <Icon name="Camera" size={20} className="text-primary" />
                </div>
              </div>
            </div>
          </button>
          
          {/* Edit Button - Always visible */}
          <button
            onClick={handleOpenModal}
            className="absolute -bottom-2 -right-2 z-20 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 hover:scale-110 transition-all border-2 border-white"
            type="button"
            title="Change profile picture"
          >
            <Icon name="Edit" size={16} />
          </button>
        </div>

        {/* Change Photo Modal */}
        <ChangePhotoModal
          isOpen={showChangePhotoModal}
          onClose={() => setShowChangePhotoModal(false)}
          currentPhoto={userProfile?.profilePhoto}
          onSave={handlePhotoSave}
          userName={userProfile?.name}
        />

        {/* Profile Info */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 mb-1">
                {userProfile?.name}
              </h1>
              <p className="text-slate-500 mb-2 flex items-center gap-2">
                <Icon name="Mail" size={16} className="text-slate-400" />
                {userProfile?.email}
              </p>
              {userProfile?.phone && (
                <p className="text-sm text-slate-500 flex items-center gap-2">
                  <Icon name="Phone" size={16} className="text-slate-400" />
                  {userProfile?.phone}
                </p>
              )}
            </div>
            
            {/* Role and Verification Status */}
            <div className="flex items-center space-x-2 mt-3 md:mt-0 flex-wrap gap-2">
              {/* Role Badge */}
              {(user?.role === 'technician' || user?.type === 'technician') ? (
                <div className="flex items-center space-x-1 bg-primary/10 text-primary px-3 py-1 rounded-full">
                  <Icon name="UserCog" size={16} />
                  <span className="text-sm font-medium">Technician</span>
                </div>
              ) : user?.role === 'admin' || user?.type === 'admin' ? (
                <div className="flex items-center space-x-1 bg-purple-500/10 text-purple-600 px-3 py-1 rounded-full">
                  <Icon name="Shield" size={16} />
                  <span className="text-sm font-medium">Admin</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 bg-blue-500/10 text-blue-600 px-3 py-1 rounded-full">
                  <Icon name="User" size={16} />
                  <span className="text-sm font-medium">User</span>
                </div>
              )}
              
              {/* Verification Status */}
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="rounded-md bg-blue-100 p-2 text-blue-600">
                <Icon name="Activity" size={18} />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Active jobs</p>
                <p className="text-lg font-semibold text-slate-900">{userProfile?.stats?.activeJobs ?? 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="rounded-md bg-blue-100 p-2 text-blue-600">
                <Icon name="CheckCircle2" size={18} />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Completed</p>
                <p className="text-lg font-semibold text-slate-900">{userProfile?.stats?.completedServices ?? 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="rounded-md bg-blue-100 p-2 text-blue-600">
                <Icon name="Calendar" size={18} />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Total bookings</p>
                <p className="text-lg font-semibold text-slate-900">{userProfile?.stats?.totalBookings ?? 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="rounded-md bg-blue-100 p-2 text-blue-600">
                <Icon name="Clock" size={18} />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Member since</p>
                <p className="text-lg font-semibold text-slate-900">{userProfile?.stats?.memberSince || '—'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;