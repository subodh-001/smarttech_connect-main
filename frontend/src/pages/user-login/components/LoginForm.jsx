import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/NewAuthContext'
import Button from '../../../components/ui/Button'
import Input from '../../../components/ui/Input'
import { Checkbox } from '../../../components/ui/Checkbox'
import Icon from '../../../components/AppIcon'

const LoginForm = () => {
  const navigate = useNavigate()
  const { signIn, user } = useAuth()
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
    rememberMe: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const newErrors = {}
    if (!formData?.emailOrPhone?.trim()) {
      newErrors.emailOrPhone = 'Email is required'
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex?.test(formData?.emailOrPhone)) {
        newErrors.emailOrPhone = 'Please enter a valid email address'
      }
    }
    if (!formData?.password?.trim()) {
      newErrors.password = 'Password is required'
    } else if (formData?.password?.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    setErrors(newErrors)
    return Object.keys(newErrors)?.length === 0
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e?.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    if (errors?.[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!validateForm()) return
    setIsLoading(true)
    try {
      const { emailOrPhone, password } = formData
      const result = await signIn(emailOrPhone, password)
      const authUser = result?.user || user
      const roleRaw = authUser?.role || authUser?.type
      const role = roleRaw === 'customer' ? 'user' : roleRaw
      switch (role) {
        case 'technician':
          navigate('/technician-dashboard')
          break
        case 'admin':
          navigate('/admin-dashboard')
          break
        default:
          navigate('/user-dashboard')
      }
    } catch (error) {
      setErrors({ general: error?.response?.data?.error || 'Login failed. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotPassword = () => {
    navigate('/forgot-password')
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors?.general && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <div className="flex items-start space-x-2">
              <Icon name="AlertCircle" size={16} className="text-destructive mt-0.5 flex-shrink-0" />
              <div className="text-sm text-destructive whitespace-pre-line">{errors?.general}</div>
            </div>
          </div>
        )}
        <Input
          label="Email"
          type="text"
          name="emailOrPhone"
          placeholder="Enter your email"
          value={formData?.emailOrPhone}
          onChange={handleInputChange}
          error={errors?.emailOrPhone}
          required
        />
        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Enter your password"
            value={formData?.password}
            onChange={handleInputChange}
            error={errors?.password}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-muted-foreground hover:text-foreground trust-transition"
          >
            <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <Checkbox
            label="Remember me"
            name="rememberMe"
            checked={formData?.rememberMe}
            onChange={handleInputChange}
          />
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-sm text-primary hover:text-primary/80 trust-transition"
          >
            Forgot password?
          </button>
        </div>
        <Button
          type="submit"
          fullWidth
          disabled={isLoading}
          iconName="LogIn"
          iconPosition="left"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </div>
  )
}

export default LoginForm