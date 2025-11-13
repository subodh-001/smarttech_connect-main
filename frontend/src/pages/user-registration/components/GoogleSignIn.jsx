import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import Button from '../../../components/ui/Button';

const GoogleSignIn = ({ onGoogleSignIn, isLoading, showSeparator = true, compact = false }) => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const isGoogleConfigured = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);

  const startGoogleLogin = useGoogleLogin({
    flow: 'auth-code',
    scope: 'openid email profile',
    ux_mode: 'popup',
    onSuccess: async (codeResponse) => {
      try {
        if (!codeResponse?.code) {
          throw new Error('Google did not return an authorization code. Please try again.');
        }
        await onGoogleSignIn({
          code: codeResponse.code,
        });
        setError('');
      } catch (err) {
        console.error('Google sign-in failed:', err);
        setError(err?.message || 'We could not complete Google sign-in. Please try again.');
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: (err) => {
      console.error('Google login error:', err);
      setError('Google sign-in was interrupted. Please try again.');
      setIsGoogleLoading(false);
    },
  });

  const handleMockGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const mockProfile = {
        fullName: 'Google Demo User',
        email: 'demo.google.user@example.com',
        picture: 'https://www.gravatar.com/avatar/?d=identicon',
        googleId: 'mock-google-demo-user'
      };
      await onGoogleSignIn({
        mockProfile
      });
      setError('');
    } catch (err) {
      console.error('Mock Google sign-in failed:', err);
      setError('Unable to complete the simulated Google sign-in. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleClick = async () => {
    if (isLoading) return;

    setError('');

    if (!isGoogleConfigured) {
      await handleMockGoogleSignIn();
      return;
    }

    setIsGoogleLoading(true);

    try {
      startGoogleLogin();
    } catch (err) {
      console.error('Failed to launch Google sign-in:', err);
      setIsGoogleLoading(false);
      setError('Unable to open Google sign-in. Check your internet connection and try again.');
    }
  };

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>
      {showSeparator && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-background text-muted-foreground">Or continue with</span>
          </div>
        </div>
      )}

      <Button
        type="button"
        variant="outline"
        size="lg"
        fullWidth
        onClick={handleGoogleClick}
        loading={isGoogleLoading}
        disabled={isLoading || isGoogleLoading}
        iconName="Chrome"
        iconPosition="left"
        iconSize={20}
        className="w-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium"
      >
        Continue with Google
      </Button>

      {error && (
        <p className="text-xs text-destructive text-center">{error}</p>
      )}

      {!compact && (
        <>
          {(!isGoogleConfigured) && (
            <p className="text-xs text-muted-foreground text-center">
              Google OAuth isn't configured yet, so we'll simulate Google sign-in for local testing.
            </p>
          )}

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              By signing up with Google, you confirm that you accept our Terms of Service and Privacy Policy.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default GoogleSignIn;
