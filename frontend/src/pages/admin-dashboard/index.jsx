import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'overview');
  
  // Update activeTab when URL query parameter changes
  useEffect(() => {
    const tab = searchParams.get('tab') || 'overview';
    setActiveTab(tab);
  }, [searchParams]);
  
  // Function to handle tab changes
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setSearchParams({ tab: tabKey });
  };
  
  // Mock data for admin dashboard
  const stats = {
    totalUsers: 1248,
    totalTechnicians: 156,
    activeServices: 42,
    pendingApprovals: 8,
    totalRevenue: 125680,
    recentSignups: 24
  };

  const recentUsers = [
    { id: 'USR001', name: 'John Doe', email: 'john.doe@example.com', role: 'customer', status: 'active', joinedDate: '2023-09-15' },
    { id: 'USR002', name: 'Jane Smith', email: 'jane.smith@example.com', role: 'customer', status: 'active', joinedDate: '2023-09-14' },
    { id: 'TEC001', name: 'Mike Wilson', email: 'mike.wilson@example.com', role: 'technician', status: 'pending', joinedDate: '2023-09-13' },
    { id: 'USR003', name: 'Sarah Johnson', email: 'sarah.j@example.com', role: 'customer', status: 'active', joinedDate: '2023-09-12' },
  ];

  const recentServices = [
    { id: 'SRV001', customer: 'John Doe', technician: 'Mike Wilson', service: 'Plumbing Repair', status: 'completed', date: '2023-09-15', amount: 120 },
    { id: 'SRV002', customer: 'Jane Smith', technician: 'Alex Rodriguez', service: 'Electrical Installation', status: 'in_progress', date: '2023-09-15', amount: 250 },
    { id: 'SRV003', customer: 'Sarah Johnson', technician: 'David Lee', service: 'HVAC Maintenance', status: 'scheduled', date: '2023-09-16', amount: 180 },
    { id: 'SRV004', customer: 'Robert Brown', technician: 'Mike Wilson', service: 'Appliance Repair', status: 'cancelled', date: '2023-09-14', amount: 95 },
  ];

  const pendingApprovals = [
    { id: 'TEC001', name: 'Mike Wilson', email: 'mike.wilson@example.com', services: ['Plumbing', 'Handyman'], documents: 3, submittedDate: '2023-09-13' },
    { id: 'TEC002', name: 'David Lee', email: 'david.lee@example.com', services: ['HVAC', 'Electrical'], documents: 4, submittedDate: '2023-09-12' },
    { id: 'TEC003', name: 'Sarah Connor', email: 'sarah.c@example.com', services: ['Cleaning', 'Gardening'], documents: 2, submittedDate: '2023-09-10' },
  ];

  // Tab configuration - used for labels in placeholder sections
  const tabs = [
    { key: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
    { key: 'users', label: 'Users', icon: 'Users' },
    { key: 'technicians', label: 'Technicians', icon: 'Wrench' },
    { key: 'services', label: 'Services', icon: 'Briefcase' },
    { key: 'approvals', label: 'Approvals', icon: 'CheckCircle', badge: stats.pendingApprovals },
    { key: 'reports', label: 'Reports', icon: 'BarChart' },
    { key: 'settings', label: 'Settings', icon: 'Settings' }
  ];

  // Handler functions
  const handleUserDetails = (userId) => {
    console.log('View user details:', userId);
  };

  const handleServiceDetails = (serviceId) => {
    console.log('View service details:', serviceId);
  };

  const handleApproval = (technicianId, approved) => {
    console.log('Technician approval:', technicianId, approved ? 'approved' : 'rejected');
  };

  const handleViewDocuments = (technicianId) => {
    console.log('View documents for:', technicianId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Admin Dashboard</h1>
              <p className="text-text-secondary mt-1">
                Manage users, technicians, and services
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                iconName="Download"
                iconPosition="left"
              >
                Export Data
              </Button>
              <Button
                variant="default"
                iconName="Settings"
                iconPosition="left"
              >
                System Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation is now handled by the Header component */}

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-card rounded-lg border border-border p-4 shadow-subtle">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-secondary text-sm">Total Users</p>
                      <h3 className="text-2xl font-bold text-text-primary mt-1">{stats.totalUsers}</h3>
                    </div>
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon name="Users" size={20} className="text-primary" />
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-success flex items-center">
                    <Icon name="TrendingUp" size={14} />
                    <span className="ml-1">+{stats.recentSignups} new this week</span>
                  </div>
                </div>

                <div className="bg-card rounded-lg border border-border p-4 shadow-subtle">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-secondary text-sm">Technicians</p>
                      <h3 className="text-2xl font-bold text-text-primary mt-1">{stats.totalTechnicians}</h3>
                    </div>
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon name="Wrench" size={20} className="text-primary" />
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-warning flex items-center">
                    <Icon name="Clock" size={14} />
                    <span className="ml-1">{stats.pendingApprovals} pending approvals</span>
                  </div>
                </div>

                <div className="bg-card rounded-lg border border-border p-4 shadow-subtle">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-secondary text-sm">Active Services</p>
                      <h3 className="text-2xl font-bold text-text-primary mt-1">{stats.activeServices}</h3>
                    </div>
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon name="Activity" size={20} className="text-primary" />
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-success flex items-center">
                    <Icon name="CheckCircle" size={14} />
                    <span className="ml-1">All systems operational</span>
                  </div>
                </div>

                <div className="bg-card rounded-lg border border-border p-4 shadow-subtle">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-text-secondary text-sm">Total Revenue</p>
                      <h3 className="text-2xl font-bold text-text-primary mt-1">${(stats.totalRevenue / 1000).toFixed(1)}k</h3>
                    </div>
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon name="DollarSign" size={20} className="text-primary" />
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-success flex items-center">
                    <Icon name="TrendingUp" size={14} />
                    <span className="ml-1">+12% from last month</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Users */}
                <div className="bg-card rounded-lg border border-border shadow-subtle">
                  <div className="p-4 border-b border-border">
                    <h3 className="text-lg font-semibold text-text-primary">Recent Users</h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      {recentUsers.map(user => (
                        <div key={user.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                              <Icon name={user.role === 'technician' ? 'Wrench' : 'User'} size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-text-primary">{user.name}</p>
                              <p className="text-xs text-text-secondary">{user.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              user.status === 'active' ? 'bg-success/10 text-success' :
                              user.status === 'pending' ? 'bg-warning/10 text-warning' :
                              'bg-muted text-text-secondary'
                            }`}>
                              {user.status}
                            </span>
                            <button 
                              onClick={() => handleUserDetails(user.id)}
                              className="text-text-secondary hover:text-text-primary"
                            >
                              <Icon name="MoreVertical" size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-border">
                      <Button variant="ghost" className="w-full" onClick={() => navigate('/admin-dashboard?tab=users')}>
                        View All Users
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Recent Services */}
                <div className="bg-card rounded-lg border border-border shadow-subtle">
                  <div className="p-4 border-b border-border">
                    <h3 className="text-lg font-semibold text-text-primary">Recent Services</h3>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      {recentServices.map(service => (
                        <div key={service.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                              <Icon name="Tool" size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-text-primary">{service.service}</p>
                              <p className="text-xs text-text-secondary">{service.customer} • ${service.amount}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              service.status === 'completed' ? 'bg-success/10 text-success' :
                              service.status === 'in_progress' ? 'bg-primary/10 text-primary' :
                              service.status === 'scheduled' ? 'bg-info/10 text-info' :
                              service.status === 'cancelled' ? 'bg-error/10 text-error' :
                              'bg-muted text-text-secondary'
                            }`}>
                              {service.status}
                            </span>
                            <button 
                              onClick={() => handleServiceDetails(service.id)}
                              className="text-text-secondary hover:text-text-primary"
                            >
                              <Icon name="MoreVertical" size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-border">
                      <Button variant="ghost" className="w-full" onClick={() => navigate('/admin-dashboard?tab=services')}>
                        View All Services
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pending Approvals */}
              {stats.pendingApprovals > 0 && (
                <div className="bg-card rounded-lg border border-border shadow-subtle">
                  <div className="p-4 border-b border-border flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-text-primary">Pending Technician Approvals</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/admin-dashboard?tab=approvals')}
                    >
                      View All
                    </Button>
                  </div>
                  <div className="p-4">
                    <div className="space-y-4">
                      {pendingApprovals.map(tech => (
                        <div key={tech.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                              <Icon name="User" size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-text-primary">{tech.name}</p>
                              <div className="flex items-center space-x-2">
                                <p className="text-xs text-text-secondary">{tech.email}</p>
                                <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{tech.services.join(', ')}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewDocuments(tech.id)}
                            >
                              <Icon name="FileText" size={14} className="mr-1" />
                              <span>{tech.documents} docs</span>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleApproval(tech.id, false)}
                              className="text-error border-error/20 hover:bg-error/10"
                            >
                              Reject
                            </Button>
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handleApproval(tech.id, true)}
                            >
                              Approve
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Placeholder for other tabs */}
          {activeTab !== 'overview' && (
            <div className="bg-card rounded-lg border border-border p-8 text-center">
              <Icon name="Construction" size={48} className="mx-auto text-text-secondary mb-4" />
              <h3 className="text-xl font-semibold text-text-primary mb-2">{tabs.find(t => t.key === activeTab)?.label} Section</h3>
              <p className="text-text-secondary max-w-md mx-auto">
                This section is under construction. The {tabs.find(t => t.key === activeTab)?.label.toLowerCase()} management functionality will be implemented in the next phase.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => navigate('/admin-dashboard?tab=overview')}
              >
                Return to Overview
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;