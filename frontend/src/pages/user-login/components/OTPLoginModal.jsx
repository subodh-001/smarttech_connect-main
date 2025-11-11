import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const OTPLoginModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Mock OTP for testing
  const mockOTP = '123456';

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const validatePhone = () => {
    const phoneRegex = /^[+]?[91]?[0-9]{10}$/;
    if (!phoneNumber?.trim()) {
      setErrors({ phone: 'Phone number is required' });
      return false;
    }
    if (!phoneRegex?.test(phoneNumber?.replace(/\s/g, ''))) {
      setErrors({ phone: 'Please enter a valid 10-digit phone number' });
      return false;
    }
    setErrors({});
    return true;
  };

  const validateOTP = () => {
    if (!otp?.trim()) {
      setErrors({ otp: 'OTP is required' });
      return false;
    }
    if (otp?.length !== 6) {
      setErrors({ otp: 'OTP must be 6 digits' });
      return false;
    }
    if (otp !== mockOTP) {
      setErrors({ otp: `Invalid OTP. Use ${mockOTP} for testing` });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSendOTP = async (e) => {
    e?.preventDefault();
    
    if (!validatePhone()) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStep('otp');
      setCountdown(30);
      setErrors({});
    } catch (error) {
      setErrors({ phone: 'Failed to send OTP. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e?.preventDefault();
    
    if (!validateOTP()) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store user data
      const userData = {
        id: Math.random()?.toString(36)?.substr(2, 9),
        name: 'John Doe',
        phone: phoneNumber,
        type: 'user',
        loginTime: new Date()?.toISOString(),
        loginMethod: 'otp'
      };
      
      localStorage.setItem('smarttech_user', JSON.stringify(userData));
      
      // Close modal and navigate
      onClose();
      navigate('/user-dashboard');
      
    } catch (error) {
      setErrors({ otp: 'Verification failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCountdown(30);
      setErrors({});
    } catch (error) {
      setErrors({ otp: 'Failed to resend OTP. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setStep('phone');
    setOtp('');
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md bg-card rounded-lg trust-shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-2">
            {step === 'otp' && (
              <button
                onClick={handleBack}
                className="p-1 hover:bg-muted rounded-md trust-transition"
              >
                <Icon name="ArrowLeft" size={16} />
              </button>
            )}
            <h2 className="text-lg font-semibold text-foreground">
              {step === 'phone' ? 'Login with OTP' : 'Verify OTP'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-md trust-transition"
          >
            <Icon name="X" size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'phone' ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">
                  Enter your phone number to receive a verification code
                </p>
              </div>

              <Input
                label="Phone Number"
                type="tel"
                placeholder="Enter your 10-digit phone number"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e?.target?.value);
                  if (errors?.phone) setErrors({});
                }}
                error={errors?.phone}
                required
              />

              <Button
                type="submit"
                fullWidth
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">
                  Enter the 6-digit code sent to
                </p>
                <p className="text-sm font-medium text-foreground">{phoneNumber}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Use <span className="font-mono font-medium">{mockOTP}</span> for testing
                </p>
              </div>

              <Input
                label="Verification Code"
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => {
                  const value = e?.target?.value?.replace(/\D/g, '')?.slice(0, 6);
                  setOtp(value);
                  if (errors?.otp) setErrors({});
                }}
                error={errors?.otp}
                maxLength={6}
                required
              />

              <Button
                type="submit"
                fullWidth
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </Button>

              {/* Resend OTP */}
              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Resend OTP in {countdown}s
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isLoading}
                    className="text-sm text-primary hover:text-primary/80 trust-transition disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default OTPLoginModal;