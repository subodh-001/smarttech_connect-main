import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';
import Select from '../../../components/ui/Select';

const RegistrationForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    password: '',
    confirmPassword: '',
    userType: '',
    agreeToTerms: false,
    agreeToPrivacy: false,
    allowLocationAccess: false
  });

  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex?.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex?.test(phone);
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password?.length >= 8) strength++;
    if (/[A-Z]/?.test(password)) strength++;
    if (/[a-z]/?.test(password)) strength++;
    if (/\d/?.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/?.test(password)) strength++;
    return strength;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e?.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Real-time validation
    const newErrors = { ...errors };
    
    if (name === 'email' && value) {
      if (!validateEmail(value)) {
        newErrors.email = 'Please enter a valid email address';
      } else {
        delete newErrors?.email;
      }
    }

    if (name === 'phone' && value) {
      if (!validatePhone(value)) {
        newErrors.phone = 'Please enter a valid 10-digit mobile number';
      } else {
        delete newErrors?.phone;
      }
    }

    if (name === 'address' && value) {
      if (value?.length < 5) {
        newErrors.address = 'Please enter your complete address';
      } else {
        delete newErrors?.address;
      }
    }

    if (name === 'city' && value) {
      if (value?.length < 2) {
        newErrors.city = 'City name looks too short';
      } else {
        delete newErrors?.city;
      }
    }

    if (name === 'postalCode' && value) {
      const pinRegex = /^\d{6}$/;
      if (!pinRegex?.test(value)) {
        newErrors.postalCode = 'Enter a valid 6-digit postal code';
      } else {
        delete newErrors?.postalCode;
      }
    }

    if (name === 'password') {
      let strength = calculatePasswordStrength(value);
      setPasswordStrength(strength);
      
      if (value?.length < 8) {
        newErrors.password = 'Password must be at least 8 characters long';
      } else {
        delete newErrors?.password;
      }

      if (formData?.confirmPassword && value !== formData?.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      } else if (formData?.confirmPassword) {
        delete newErrors?.confirmPassword;
      }
    }

    if (name === 'confirmPassword' && value) {
      if (value !== formData?.password) {
        newErrors.confirmPassword = 'Passwords do not match';
      } else {
        delete newErrors?.confirmPassword;
      }
    }

    if (name === 'fullName' && value) {
      if (value?.length < 2) {
        newErrors.fullName = 'Name must be at least 2 characters long';
      } else {
        delete newErrors?.fullName;
      }
    }

    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.fullName?.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData?.fullName?.length < 2) {
      newErrors.fullName = 'Name must be at least 2 characters long';
    }

    if (!formData?.email?.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!validateEmail(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData?.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData?.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number';
    }

    if (!formData?.address?.trim()) {
      newErrors.address = 'Your address helps us find local technicians';
    } else if (formData?.address?.length < 5) {
      newErrors.address = 'Please enter your complete address';
    }

    if (!formData?.city?.trim()) {
      newErrors.city = 'City is required';
    } else if (formData?.city?.length < 2) {
      newErrors.city = 'City name looks too short';
    }

    if (!formData?.postalCode?.trim()) {
      newErrors.postalCode = 'Postal code is required';
    } else if (!/^\d{6}$/.test(formData?.postalCode)) {
      newErrors.postalCode = 'Enter a valid 6-digit postal code';
    }

    if (!formData?.password) {
      newErrors.password = 'Password is required';
    } else if (formData?.password?.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (!formData?.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData?.password !== formData?.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData?.userType || !['user', 'technician']?.includes(formData?.userType)) {
      newErrors.userType = 'Please select account type';
    }

    if (!formData?.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms of service';
    }

    if (!formData?.agreeToPrivacy) {
      newErrors.agreeToPrivacy = 'You must agree to the privacy policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (validateForm()) {
      const sanitizedData = {
        ...formData,
        fullName: formData?.fullName?.trim(),
        email: formData?.email?.trim().toLowerCase(),
        phone: formData?.phone?.trim(),
        address: formData?.address?.trim(),
        city: formData?.city?.trim(),
        state: formData?.state?.trim() || '',
        postalCode: formData?.postalCode?.trim(),
      };
      onSubmit(sanitizedData);
    }
  };

  const handleUserTypeChange = (value) => {
    setFormData(prev => ({
      ...prev,
      userType: value
    }));

    setErrors(prevErrors => {
      const updatedErrors = { ...prevErrors };
      if (!value) {
        updatedErrors.userType = 'Please select account type';
      } else {
        delete updatedErrors?.userType;
      }
      return updatedErrors;
    });
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 2) return 'bg-orange-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    if (passwordStrength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 2) return 'Fair';
    if (passwordStrength <= 3) return 'Good';
    if (passwordStrength <= 4) return 'Strong';
    return 'Very Strong';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
        
        <Input
          label="Full Name"
          type="text"
          name="fullName"
          placeholder="Enter your full name"
          value={formData?.fullName}
          onChange={handleInputChange}
          error={errors?.fullName}
          required
          description="Match your government ID so technicians can verify they are meeting the right person."
        />

        <Input
          label="Email Address"
          type="email"
          name="email"
          placeholder="Enter your email address"
          value={formData?.email}
          onChange={handleInputChange}
          error={errors?.email}
          required
          description="We’ll send booking updates and verification emails here."
        />

        <div>
          <Input
            label="Phone Number"
            type="tel"
            name="phone"
            placeholder="Enter 10-digit mobile number"
            value={formData?.phone}
            onChange={handleInputChange}
            error={errors?.phone}
            required
            description="Use an active number to receive OTPs and technician calls."
          />
          <p className="text-xs text-muted-foreground mt-1">
            We'll send OTP to this number for verification
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Address"
            type="text"
            name="address"
            placeholder="House number, street and nearby landmark"
            value={formData?.address}
            onChange={handleInputChange}
            error={errors?.address}
            required
            description="Helps us suggest technicians who operate in your neighbourhood."
          />

          <Input
            label="City"
            type="text"
            name="city"
            placeholder="Enter your city"
            value={formData?.city}
            onChange={handleInputChange}
            error={errors?.city}
            required
          />

          <Input
            label="State"
            type="text"
            name="state"
            placeholder="Enter your state (optional)"
            value={formData?.state}
            onChange={handleInputChange}
            description="Optional but improves technician matching."
          />

          <Input
            label="Postal Code"
            type="text"
            name="postalCode"
            placeholder="6-digit postal code"
            value={formData?.postalCode}
            onChange={handleInputChange}
            error={errors?.postalCode}
            required
          />
        </div>

        {/* Account Type Selection */}
        <div>
          <Select
            label="Account Type"
            name="userType"
            value={formData?.userType}
            onChange={handleUserTypeChange}
            options={[
              { value: 'user', label: 'User - Seeking services' },
              { value: 'technician', label: 'Technician - Providing services' },
            ]}
            placeholder="Select account type"
            required
            error={errors?.userType}
            description="Choose 'User' if you want to book services or 'Technician' if you want to accept jobs."
          />
          <p className="text-xs text-muted-foreground mt-1">
            Choose whether you'll use SmartTech Connect as a customer or a technician.
          </p>
        </div>
      </div>

      {/* Passwords */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Security</h3>
        
        <div>
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Create a strong password"
              value={formData?.password}
              onChange={handleInputChange}
              error={errors?.password}
              required
              description="Use at least 8 characters with upper & lower case letters, a number, and a special symbol."
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-muted-foreground hover:text-foreground"
            >
              <Icon name={showPassword ? "EyeOff" : "Eye"} size={16} />
            </button>
          </div>
          
          {formData?.password && (
            <div className="mt-2">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  ></div>
                </div>
                <span className="text-xs text-muted-foreground">{getPasswordStrengthText()}</span>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <Input
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Re-enter your password"
            value={formData?.confirmPassword}
            onChange={handleInputChange}
            error={errors?.confirmPassword}
            required
            description="We double-check to make sure there are no typos in your password."
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-9 text-muted-foreground hover:text-foreground"
          >
            <Icon name={showConfirmPassword ? "EyeOff" : "Eye"} size={16} />
          </button>
        </div>
      </div>

      {/* Agreements */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Agreements</h3>
        
        <Checkbox
          label="I agree to the Terms of Service"
          name="agreeToTerms"
          checked={formData?.agreeToTerms}
          onChange={handleInputChange}
          error={errors?.agreeToTerms}
          description="Includes cancellation policies, technician etiquette, and payment terms."
        />
        
        <Checkbox
          label="I agree to the Privacy Policy"
          name="agreeToPrivacy"
          checked={formData?.agreeToPrivacy}
          onChange={handleInputChange}
          error={errors?.agreeToPrivacy}
          description="Explains how SmartTech Connect stores and protects your personal data."
        />

        <Checkbox
          label="Allow location access (optional)"
          name="allowLocationAccess"
          checked={formData?.allowLocationAccess}
          onChange={handleInputChange}
        />
      </div>

      {/* Submit */}
      <div className="space-y-2">
        <Button type="submit" fullWidth loading={isLoading} disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Already have an account? <Link to="/user-login" className="text-primary hover:text-primary/80">Sign in</Link>
        </p>
      </div>
    </form>
  );
};

export default RegistrationForm;