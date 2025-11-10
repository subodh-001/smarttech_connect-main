import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RegistrationHeader from './components/RegistrationHeader';
import GoogleSignIn from './components/GoogleSignIn';
import RegistrationForm from './components/RegistrationForm';
import OTPVerificationModal from './components/OTPVerificationModal';

const UserRegistration = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const [otpInfo, setOtpInfo] = useState(null);

  const sendOtp = async (data) => {
    const response = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: data.email, fullName: data.fullName, purpose: 'registration' }),
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || 'Failed to send verification code.');
    }
    return result;
  };

  const handleFormSubmit = async (formData) => {
    setIsLoading(true);
    setRegistrationData(formData);

    try {
      const result = await sendOtp(formData);
      if (result?.devOtp) {
        setOtpInfo(`Development OTP (email service disabled): ${result.devOtp}`);
      } else if (result?.message) {
        setOtpInfo(result.message);
      } else {
        setOtpInfo(null);
      }
      setShowOTPModal(true);
    } catch (error) {
      console.error('Registration failed:', error);
      alert(error.message || 'Failed to send verification code. Please try again.');
      setRegistrationData(null);
      setOtpInfo(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async ({ code, mockProfile }) => {
    if (!code && !mockProfile) {
      alert('Google sign-in failed to provide authentication details. Please try again.');
      return;
    }

    setIsLoading(true);
    
    try {
      const payload = mockProfile ? { mockProfile } : { code };
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || 'Failed to sign in with Google.');
      }

      if (result?.token) {
        localStorage.setItem('authToken', result.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${result.token}`;
      }
      
      if (result?.user?.role === 'technician') {
        navigate('/technician-onboarding');
      } else {
        navigate('/user-dashboard');
      }
    } catch (error) {
      console.error('Google sign-in failed:', error);
      alert(error?.message || 'We could not complete Google sign-in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerification = async (otp) => {
    if (!registrationData) {
      throw new Error('Registration details were lost. Please restart the registration process.');
    }

    setIsLoading(true);

    try {
      const verifyResponse = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registrationData.email, otp, purpose: 'registration' }),
      });
      const verifyResult = await verifyResponse.json();
      if (!verifyResponse.ok) {
        throw new Error(verifyResult.error || 'Failed to verify OTP.');
      }

      const registerPayload = {
        email: registrationData.email,
        password: registrationData.password,
        fullName: registrationData.fullName,
        phone: registrationData.phone,
        role: registrationData.userType === 'technician' ? 'technician' : 'user',
        address: registrationData.address || '',
        city: registrationData.city || '',
        state: registrationData.state || '',
        postalCode: registrationData.postalCode || '',
      };

      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerPayload),
      });
      const registerResult = await registerResponse.json();
      if (!registerResponse.ok) {
        throw new Error(registerResult.error || 'Registration failed.');
      }

      if (registerResult.token) {
        localStorage.setItem('authToken', registerResult.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${registerResult.token}`;
      }

      setShowOTPModal(false);

      if (registerPayload.role === 'technician') {
        navigate('/technician-onboarding');
      } else {
        navigate('/user-dashboard');
      }

      return registerResult;
    } catch (error) {
      console.error('OTP verification failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!registrationData) {
      throw new Error('Registration details were lost. Please restart the registration process.');
    }
    const result = await sendOtp(registrationData);
    if (result?.devOtp) {
      setOtpInfo(`Development OTP (email service disabled): ${result.devOtp}`);
    } else if (result?.message) {
      setOtpInfo(result.message);
    }
    return result;
  };

  const handleCloseOTPModal = () => {
    setShowOTPModal(false);
    setRegistrationData(null);
    setOtpInfo(null);
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
        email={registrationData?.email}
        onVerify={handleOTPVerification}
        onResend={handleResendOTP}
        isLoading={isLoading}
        infoMessage={otpInfo}
      />
    </div>
  );
};

export default UserRegistration;