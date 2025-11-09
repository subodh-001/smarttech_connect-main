import React from 'react';
import { Link } from 'react-router-dom';

const LoginFooter = () => {
  return (
    <div className="mt-8 text-center space-y-4">
      {/* Sign Up Link */}
      <div className="text-sm">
        <span className="text-muted-foreground">Don't have an account? </span>
        <Link 
          to="/user-registration" 
          className="text-primary hover:text-primary/80 font-medium trust-transition"
        >
          Sign up for free
        </Link>
      </div>
      {/* Help Links */}
      <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
        <Link to="/help" className="hover:text-foreground trust-transition">
          Help Center
        </Link>
        <span>•</span>
        <Link to="/privacy" className="hover:text-foreground trust-transition">
          Privacy Policy
        </Link>
        <span>•</span>
        <Link to="/terms" className="hover:text-foreground trust-transition">
          Terms of Service
        </Link>
      </div>
      {/* Copyright */}
      <div className="text-xs text-muted-foreground">
        © {new Date()?.getFullYear()} SmartTech Connect. All rights reserved.
      </div>
    </div>
  );
};

export default LoginFooter;