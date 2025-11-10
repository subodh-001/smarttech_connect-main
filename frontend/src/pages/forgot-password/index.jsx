import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [devOtp, setDevOtp] = useState(null);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleSendCode = async (e) => {
    e?.preventDefault();
    if (!email) {
      setError('Enter the email you use for SmartTech Connect.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setMessage(null);
    setDevOtp(null);

    try {
      const { data } = await axios.post('/api/auth/send-otp', {
        email,
        purpose: 'password_reset',
      });

      setCodeSent(true);
      setMessage(data?.message || 'If the email is registered, we emailed a reset code.');
      if (data?.devOtp) {
        setDevOtp(data.devOtp);
      }
    } catch (err) {
      console.error('Failed to send reset code:', err);
      setError(err?.response?.data?.error || 'Unable to send reset code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e?.preventDefault();
    if (!codeSent) {
      setError('Request a reset code first.');
      return;
    }
    if (!otp || otp.length < 4) {
      setError('Enter the reset code sent to your email.');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const { data } = await axios.post('/api/auth/password-reset/confirm', {
        email,
        otp,
        newPassword,
      });
      setMessage(data?.message || 'Password updated! Redirecting to login...');
      setTimeout(() => navigate('/user-login'), 2000);
    } catch (err) {
      console.error('Failed to reset password:', err);
      setError(err?.response?.data?.error || 'Unable to reset password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card rounded-lg trust-shadow-lg p-8 space-y-6">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon name="ShieldCheck" size={24} className="text-primary" />
              </div>
              <h1 className="text-2xl font-semibold text-foreground">Reset your password</h1>
              <p className="text-sm text-muted-foreground">
                Enter the email linked to your account and we&apos;ll send a verification code.
              </p>
            </div>

            {error ? (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
                {error}
              </div>
            ) : null}

            {message ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/60 rounded-md text-sm text-emerald-700 dark:text-emerald-200">
                {message}
              </div>
            ) : null}

            {devOtp ? (
              <div className="p-3 bg-slate-100 dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-slate-700 rounded-md text-xs text-slate-600 dark:text-slate-300">
                Development mode OTP: <span className="font-semibold">{devOtp}</span>
              </div>
            ) : null}

            <form className="space-y-4" onSubmit={codeSent ? handleResetPassword : handleSendCode}>
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />

              {codeSent ? (
                <>
                  <Input
                    label="Verification code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(event) => setOtp(event.target.value)}
                    required
                  />
                  <Input
                    label="New password"
                    type="password"
                    placeholder="Enter a new password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    required
                  />
                  <Input
                    label="Confirm password"
                    type="password"
                    placeholder="Re-enter the new password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                  />
                </>
              ) : null}

              <Button type="submit" className="w-full" loading={isSubmitting} disabled={isSubmitting}>
                {codeSent ? 'Update password' : 'Send reset code'}
              </Button>
            </form>

            <div className="text-sm text-muted-foreground text-center">
              Remembered your password?{' '}
              <Link to="/user-login" className="text-primary hover:text-primary/80 font-medium">
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

