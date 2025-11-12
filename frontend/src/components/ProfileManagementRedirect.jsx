import ProfileManagement from '../pages/profile-management';

const ProfileManagementRedirect = () => {
  // Always render ProfileManagement component
  // It will handle tab parameter from URL automatically
  return <ProfileManagement />;
};

export default ProfileManagementRedirect;

