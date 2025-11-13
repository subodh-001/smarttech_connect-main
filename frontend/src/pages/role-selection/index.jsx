import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const RoleSelectionPage = () => {
  const navigate = useNavigate();

  const handleUserSelection = () => {
    // Store selected role
    localStorage.setItem('selectedRole', 'user');
    // Navigate to user login
    navigate('/user-login');
  };

  const handleTechnicianSelection = () => {
    // Store selected role
    localStorage.setItem('selectedRole', 'technician');
    // Navigate to technician onboarding
    navigate('/technician-onboarding');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Simple Header for Welcome Page */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Icon name="Zap" size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-text-primary">SmartTech Connect</span>
            </Link>

            {/* Sign In Link */}
            <Link
              to="/user-login"
              className="text-sm font-medium text-text-secondary hover:text-primary transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4 py-12">
        <div className="w-full max-w-4xl">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <Icon name="Zap" size={40} color="var(--color-primary)" />
            </div>
            <h1 className="text-4xl font-bold text-text-primary mb-4">
              Welcome to SmartTech Connect
            </h1>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              How would you like to use our platform? Choose the option that best describes you.
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* User Card */}
            <div className="bg-card border-2 border-border rounded-2xl p-8 shadow-elevated hover:shadow-lg transition-all hover:border-primary/30 group cursor-pointer" onClick={handleUserSelection}>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <Icon name="User" size={32} color="var(--color-primary)" />
                </div>
                <h2 className="text-2xl font-semibold text-text-primary mb-3">
                  I'm a Customer
                </h2>
                <p className="text-text-secondary mb-6 leading-relaxed">
                  Find and book trusted technicians for your home service needs. Get quality service at your convenience.
                </p>
                <div className="space-y-2 mb-6 text-left w-full">
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <Icon name="CheckCircle" size={16} className="text-success" />
                    <span>Find qualified technicians</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <Icon name="CheckCircle" size={16} className="text-success" />
                    <span>Book services instantly</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <Icon name="CheckCircle" size={16} className="text-success" />
                    <span>Track service progress</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <Icon name="CheckCircle" size={16} className="text-success" />
                    <span>Secure payments</span>
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUserSelection();
                  }}
                >
                  Continue as Customer
                </Button>
              </div>
            </div>

            {/* Technician Card */}
            <div className="bg-card border-2 border-border rounded-2xl p-8 shadow-elevated hover:shadow-lg transition-all hover:border-primary/30 group cursor-pointer" onClick={handleTechnicianSelection}>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <Icon name="Wrench" size={32} color="var(--color-primary)" />
                </div>
                <h2 className="text-2xl font-semibold text-text-primary mb-3">
                  I'm a Technician
                </h2>
                <p className="text-text-secondary mb-6 leading-relaxed">
                  Join our network of professionals. Accept jobs, manage your schedule, and earn money on your terms.
                </p>
                <div className="space-y-2 mb-6 text-left w-full">
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <Icon name="CheckCircle" size={16} className="text-success" />
                    <span>Accept service requests</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <Icon name="CheckCircle" size={16} className="text-success" />
                    <span>Manage your schedule</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <Icon name="CheckCircle" size={16} className="text-success" />
                    <span>Track earnings</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <Icon name="CheckCircle" size={16} className="text-success" />
                    <span>Withdraw funds easily</span>
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTechnicianSelection();
                  }}
                >
                  Continue as Technician
                </Button>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center">
            <p className="text-sm text-text-secondary">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/user-login')}
                className="text-primary hover:text-primary/80 font-medium"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RoleSelectionPage;

