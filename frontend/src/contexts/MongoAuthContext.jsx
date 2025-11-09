import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const MongoAuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(MongoAuthContext);
  if (!context) {
    throw new Error('useAuth must be used within MongoAuthProvider');
  }
  return context;
};

export const MongoAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          // Set default authorization header for all requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Get current user from API
          const response = await axios.get('/api/auth/me');
          if (response.data) {
            setUser(response.data.user);
            await fetchUserProfile();
          } else {
            // Invalid or expired token
            localStorage.removeItem('authToken');
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
            setUserProfile(null);
          }
        }
      } catch (err) {
        console.error('Auth check error:', err);
        localStorage.removeItem('authToken');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        setUserProfile(null);
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      // Get user profile from API
      const userResponse = await axios.get('/api/users/me', {
        validateStatus: (status) => (status >= 200 && status < 300) || status === 304,
        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      });

      if (userResponse.status === 304 && userProfile) {
        return userProfile;
      }

      if (!userResponse.data || Object.keys(userResponse.data).length === 0) {
        return null;
      }

      // Create profile object
      const profile = {
        id: userResponse.data._id,
        email: userResponse.data.email,
        full_name: userResponse.data.fullName,
        phone: userResponse.data.phone,
        avatar_url: userResponse.data.avatarUrl,
        role: userResponse.data.role,
        is_active: userResponse.data.isActive,
        address: userResponse.data.address,
        city: userResponse.data.city,
        postal_code: userResponse.data.postalCode,
        created_at: userResponse.data.createdAt,
        updated_at: userResponse.data.updatedAt
      };

      // Fetch technician profile if user is a technician
      if (userResponse.data.role === 'technician') {
        try {
          // Find technician profile by user ID
          const techResponse = await axios.get(`/api/technicians?userId=${userResponse.data._id}`);
          if (techResponse.data && techResponse.data.length > 0) {
            const technicianData = techResponse.data[0];
            profile.technician_profiles = {
              id: technicianData._id,
              user_id: technicianData.userId,
              specialties: technicianData.specialties,
              years_of_experience: technicianData.yearsOfExperience,
              hourly_rate: technicianData.hourlyRate,
              average_rating: technicianData.averageRating,
              total_jobs: technicianData.totalJobs,
              bio: technicianData.bio,
              certifications: technicianData.certifications,
              service_radius: technicianData.serviceRadius,
              current_status: technicianData.currentStatus,
              last_location: technicianData.lastLocation,
              kyc_status: technicianData.kycStatus,
              has_government_id: Boolean(technicianData.kycGovernmentDocumentPath),
              has_selfie: Boolean(technicianData.kycSelfieDocumentPath),
              created_at: technicianData.createdAt,
              updated_at: technicianData.updatedAt
            };
          }
        } catch (techError) {
          console.error('Error fetching technician profile:', techError);
        }
      }

      // Fetch user settings
      try {
        const settingsResponse = await axios.get('/api/users/me/settings');
        if (settingsResponse.data) {
          profile.user_settings = {
            id: settingsResponse.data._id,
            user_id: settingsResponse.data.userId,
            notifications_enabled: settingsResponse.data.notificationsEnabled,
            email_notifications: settingsResponse.data.emailNotifications,
            sms_notifications: settingsResponse.data.smsNotifications,
            push_notifications: settingsResponse.data.pushNotifications,
            language_preference: settingsResponse.data.languagePreference,
            timezone: settingsResponse.data.timezone,
            privacy_level: settingsResponse.data.privacyLevel,
            created_at: settingsResponse.data.createdAt,
            updated_at: settingsResponse.data.updatedAt
          };
        }
      } catch (settingsError) {
        console.error('Error fetching user settings:', settingsError);
      }

      setUserProfile(profile);
      return profile;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setError(error.message);
      return null;
    }
  };

  // Sign in with email and password
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      
      // Call login API endpoint
      const response = await axios.post('/api/auth/login', { email, password });
      const { user: authUser, token } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('authToken', token);
      
      // Set default authorization header for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set user state
      setUser(authUser);
      
      // Fetch user profile
      await fetchUserProfile();
      
      return { user: authUser };
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email and password
  const signUp = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Call register API endpoint
      const response = await axios.post('/api/auth/register', userData);
      const { user: authUser, token } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('authToken', token);
      
      // Set default authorization header for all requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set user state
      setUser(authUser);
      
      // Fetch user profile
      await fetchUserProfile();
      
      return { user: authUser };
    } catch (err) {
      console.error('Sign up error:', err);
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      // Call logout API endpoint if needed
      try {
        await axios.post('/api/auth/logout');
      } catch (logoutErr) {
        console.error('Logout API error:', logoutErr);
        // Continue with local logout even if API call fails
      }
      
      // Remove token from localStorage
      localStorage.removeItem('authToken');
      
      // Remove authorization header
      delete axios.defaults.headers.common['Authorization'];
      
      // Clear user state
      setUser(null);
      setUserProfile(null);
      
      return { error: null };
    } catch (err) {
      console.error('Sign out error:', err);
      setError(err.message);
      throw err;
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    error,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    fetchUserProfile
  };

  return <MongoAuthContext.Provider value={value}>{children}</MongoAuthContext.Provider>;
};

export default MongoAuthContext;