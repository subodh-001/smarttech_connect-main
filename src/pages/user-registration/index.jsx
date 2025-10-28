import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegistrationHeader from './components/RegistrationHeader';
import GoogleSignIn from './components/GoogleSignIn';
import RegistrationForm from './components/RegistrationForm';
import OTPVerificationModal from './components/OTPVerificationModal';

const UserRegistration = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);

  const handleFormSubmit = async (formData) => {
    setIsLoading(true);
    setRegistrationData(formData);
    
    try {
      // Mock API call for registration
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show OTP verification modal
      setShowOTPModal(true);
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async (googleUserData) => {
    setIsLoading(true);
    
    try {
      // Mock Google sign-in process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For Google sign-in, we might skip OTP verification
      // and go directly to dashboard or role-specific onboarding
      console.log('Google sign-in successful:', googleUserData);
      
      if (googleUserData?.userType === 'technician') {
        navigate('/technician-onboarding');
      } else {
        navigate('/user-dashboard');
      }
    } catch (error) {
      console.error('Google sign-in failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerification = async (otp) => {
    setIsLoading(true);
    
    try {
      // Mock OTP verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('OTP verified successfully:', otp);
      console.log('User registered:', registrationData);
      
      setShowOTPModal(false);
      
      // Navigate based on user type
      if (registrationData?.userType === 'technician') {
        navigate('/technician-onboarding');
      } else {
        navigate('/user-dashboard');
      }
    } catch (error) {
      console.error('OTP verification failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseOTPModal = () => {
    setShowOTPModal(false);
    setRegistrationData(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main Content */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Side - Hero Section (Hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 text-white p-12 items-center justify-center">
          <div className="max-w-md space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold">
                Connect with Trusted Technicians
              </h2>
              <p className="text-xl text-primary-foreground/90">
                Join India's fastest-growing hyperlocal service marketplace
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full">
                  <span className="text-lg font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Create Account</h3>
                  <p className="text-primary-foreground/80">
                    Sign up with your phone number and get verified instantly
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full">
                  <span className="text-lg font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Find Technicians</h3>
                  <p className="text-primary-foreground/80">
                    Browse verified professionals in your area with ratings
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full">
                  <span className="text-lg font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Track Service</h3>
                  <p className="text-primary-foreground/80">
                    Get real-time updates and track your service progress
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/20">
              <div className="flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold">50K+</div>
                  <div className="text-primary-foreground/80">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">5K+</div>
                  <div className="text-primary-foreground/80">Technicians</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">4.8★</div>
                  <div className="text-primary-foreground/80">Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md space-y-8">
            <RegistrationHeader />
            
            <div className="space-y-6">
              <GoogleSignIn 
                onGoogleSignIn={handleGoogleSignIn}
                isLoading={isLoading}
              />
              
              <RegistrationForm 
                onSubmit={handleFormSubmit}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      <OTPVerificationModal
        isOpen={showOTPModal}
        onClose={handleCloseOTPModal}
        phoneNumber={registrationData?.phone}
        onVerify={handleOTPVerification}
        isLoading={isLoading}
      />
    </div>
  );
};

export default UserRegistration;