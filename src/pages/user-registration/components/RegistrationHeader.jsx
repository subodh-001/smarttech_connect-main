import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const RegistrationHeader = () => {
  return (
    <div className="text-center space-y-4">
      {/* Logo */}
      <Link to="/" className="inline-flex items-center space-x-2">
        <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-xl">
          <Icon name="Zap" size={24} color="white" />
        </div>
        <span className="text-2xl font-bold text-foreground">SmartTech Connect</span>
      </Link>

      {/* Welcome Message */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Create Your Account</h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Join thousands of users connecting with verified technicians in your area
        </p>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
          <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
            <Icon name="Shield" size={16} className="text-green-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-green-900">Verified Technicians</p>
            <p className="text-xs text-green-700">KYC verified professionals</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
            <Icon name="MapPin" size={16} className="text-blue-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-blue-900">Hyperlocal Matching</p>
            <p className="text-xs text-blue-700">Find nearby services</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
          <div className="flex items-center justify-center w-8 h-8 bg-orange-100 rounded-full">
            <Icon name="Clock" size={16} className="text-orange-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-orange-900">Real-time Tracking</p>
            <p className="text-xs text-orange-700">Live service updates</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationHeader;