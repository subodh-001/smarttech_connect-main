import React, { useState } from 'react';
import Button from '../../../components/ui/Button';


const GoogleSignIn = ({ onGoogleSignIn, isLoading }) => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      // Mock Google Sign-in process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock user data from Google
      const mockGoogleUser = {
        fullName: "John Doe",
        email: "john.doe@gmail.com",
        phone: "",
        userType: "seeker",
        provider: "google",
        providerId: "google_123456789",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg"
      };
      
      onGoogleSignIn(mockGoogleUser);
    } catch (error) {
      console.error('Google sign-in failed:', error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-card text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        fullWidth
        onClick={handleGoogleSignIn}
        loading={isGoogleLoading}
        disabled={isLoading || isGoogleLoading}
        iconName="Chrome"
        iconPosition="left"
        iconSize={20}
      >
        Continue with Google
      </Button>

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          By signing up with Google, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default GoogleSignIn;