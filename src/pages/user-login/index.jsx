import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/NewAuthContext'
import LoginHeader from './components/LoginHeader'
import LoginForm from './components/LoginForm'
import LoginFooter from './components/LoginFooter'

const UserLogin = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Check if user is already logged in
  useEffect(() => {
    if (user) {
      const roleRaw = user?.role || user?.type
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
    }
  }, [navigate, user])

  return (
    <div className="min-h-screen bg-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
      {/* Content */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="bg-card rounded-lg trust-shadow-lg p-8">
            <LoginHeader />
            <LoginForm />
            <LoginFooter />
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserLogin