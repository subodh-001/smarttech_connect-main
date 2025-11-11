import React, { useState, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const OTPVerificationModal = ({ isOpen, onClose, email, onVerify, onResend, isLoading, infoMessage }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (isOpen && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setCanResend(true);
    }
  }, [isOpen, timeLeft]);

  const handleOtpChange = (index, value) => {
    if (value?.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e?.key === 'Backspace' && !otp?.[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp?.join('');
    if (otpString?.length !== 6) {
      setError('Please enter complete OTP');
      return;
    }

    try {
      await onVerify(otpString);
    } catch (err) {
      setError(err?.message || 'Verification failed. Please try again.');
    }
  };

  const handleResend = async () => {
    setTimeLeft(60);
    setCanResend(false);
    setOtp(['', '', '', '', '', '']);
    setError('');
    if (!onResend) return;
    try {
      setIsResending(true);
      await onResend();
    } catch (err) {
      setError(err?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="text-center space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Verify Phone Number</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-muted rounded-full transition-colors"
            >
              <Icon name="X" size={20} className="text-muted-foreground" />
            </button>
          </div>

          {/* Phone Icon */}
          <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto">
            <Icon name="Smartphone" size={32} className="text-primary" />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <p className="text-muted-foreground">
              We've sent a 6-digit verification code to
            </p>
            <p className="font-medium text-foreground">{email}</p>
            <p className="text-sm text-muted-foreground">
              Enter the code below to verify your email address
            </p>
            {infoMessage && (
              <p className="text-xs text-muted-foreground bg-muted/70 px-3 py-2 rounded-md">
                {infoMessage}
              </p>
            )}
          </div>

          {/* OTP Input */}
          <div className="space-y-4">
            <div className="flex justify-center space-x-2">
              {otp?.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e?.target?.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-lg font-semibold border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              ))}
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          {/* Timer and Resend */}
          <div className="space-y-3">
            {!canResend ? (
              <p className="text-sm text-muted-foreground">
                Resend code in {timeLeft}s
              </p>
            ) : (
              <button
                onClick={handleResend}
                className="text-sm text-primary hover:underline font-medium disabled:opacity-60"
                disabled={isResending}
              >
                {isResending ? 'Resending...' : 'Resend verification code'}
              </button>
            )}
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            variant="default"
            size="lg"
            fullWidth
            loading={isLoading}
            disabled={isLoading || otp?.join('')?.length !== 6}
          >
            Verify & Continue
          </Button>

        </div>
      </div>
    </div>
  );
};

export default OTPVerificationModal;