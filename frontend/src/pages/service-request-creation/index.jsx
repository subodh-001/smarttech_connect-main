import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import ServiceCategorySelector from './components/ServiceCategorySelector';
import LocationSelector from './components/LocationSelector';
import ServiceDescription from './components/ServiceDescription';
import BudgetSelector from './components/BudgetSelector';
import SchedulingOptions from './components/SchedulingOptions';
import PhotoUpload from './components/PhotoUpload';
import RequestSummary from './components/RequestSummary';

const ServiceRequestCreation = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Form state
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [location, setLocation] = useState('123 MG Road, Bangalore, Karnataka 560001');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [photos, setPhotos] = useState([]);

  // Mock user data
  const mockUser = {
    name: "Rajesh Kumar",
    email: "rajesh.kumar@email.com",
    phone: "+91 9876543210"
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(''); // Reset subcategory when category changes
  };

  const handleSubcategorySelect = (subcategoryId) => {
    setSelectedSubcategory(subcategoryId);
  };

  const handleLocationChange = (newLocation) => {
    setLocation(newLocation);
  };

  const handleDescriptionChange = (newDescription) => {
    setDescription(newDescription);
  };

  const handleBudgetChange = (newBudget) => {
    setBudget(newBudget);
  };

  const handleScheduleChange = (newSchedule) => {
    setSchedule(newSchedule);
  };

  const handlePhotosChange = (newPhotos) => {
    setPhotos(newPhotos);
  };

  const isFormValid = () => {
    return selectedCategory && 
           selectedSubcategory && 
           location && 
           description?.trim()?.length >= 10 && 
           budget && 
           schedule;
  };

  const handleFindTechnicians = async () => {
    if (!isFormValid()) {
      alert('Please complete all required fields before proceeding.');
      return;
    }

    setLoading(true);

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to technician selection with request data
      navigate('/technician-selection', {
        state: {
          requestData: {
            category: selectedCategory,
            subcategory: selectedSubcategory,
            location,
            description,
            budget,
            schedule,
            photos: photos?.length,
            timestamp: new Date()?.toISOString()
          }
        }
      });
    } catch (error) {
      console.error('Error creating service request:', error);
      alert('Failed to create service request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    const draftData = {
      selectedCategory,
      selectedSubcategory,
      location,
      description,
      budget,
      schedule,
      photos: photos?.length,
      savedAt: new Date()?.toISOString()
    };
    
    localStorage.setItem('serviceRequestDraft', JSON.stringify(draftData));
    alert('Draft saved successfully!');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={mockUser} 
        location="Bangalore, Karnataka"
        activeService={null}
      />
      
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
              <button 
                onClick={() => navigate('/user-dashboard')}
                className="hover:text-foreground trust-transition"
              >
                Dashboard
              </button>
              <Icon name="ChevronRight" size={16} />
              <span>Create Service Request</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Request a Service</h1>
            <p className="text-muted-foreground mt-2">
              Tell us what you need help with and we'll connect you with verified technicians in your area.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Service Category Selection */}
              <div className="bg-card border border-border rounded-lg p-6">
                <ServiceCategorySelector
                  selectedCategory={selectedCategory}
                  onCategorySelect={handleCategorySelect}
                  selectedSubcategory={selectedSubcategory}
                  onSubcategorySelect={handleSubcategorySelect}
                />
              </div>

              {/* Location Selection */}
              <div className="bg-card border border-border rounded-lg p-6">
                <LocationSelector
                  currentLocation={location}
                  onLocationChange={handleLocationChange}
                />
              </div>

              {/* Service Description */}
              <div className="bg-card border border-border rounded-lg p-6">
                <ServiceDescription
                  description={description}
                  onDescriptionChange={handleDescriptionChange}
                />
              </div>

              {/* Budget Selection */}
              <div className="bg-card border border-border rounded-lg p-6">
                <BudgetSelector
                  budget={budget}
                  onBudgetChange={handleBudgetChange}
                  selectedCategory={selectedCategory}
                  selectedSubcategory={selectedSubcategory}
                />
              </div>

              {/* Scheduling Options */}
              <div className="bg-card border border-border rounded-lg p-6">
                <SchedulingOptions
                  schedule={schedule}
                  onScheduleChange={handleScheduleChange}
                />
              </div>

              {/* Photo Upload */}
              <div className="bg-card border border-border rounded-lg p-6">
                <PhotoUpload
                  photos={photos}
                  onPhotosChange={handlePhotosChange}
                />
              </div>
            </div>

            {/* Sidebar - Request Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <RequestSummary
                  selectedCategory={selectedCategory}
                  selectedSubcategory={selectedSubcategory}
                  location={location}
                  description={description}
                  budget={budget}
                  schedule={schedule}
                  photos={photos}
                />

                {/* Action Buttons */}
                <div className="mt-6 space-y-3">
                  <Button
                    onClick={handleFindTechnicians}
                    disabled={!isFormValid() || loading}
                    loading={loading}
                    iconName="Search"
                    iconPosition="left"
                    className="w-full"
                    size="lg"
                  >
                    {loading ? 'Finding Technicians...' : 'Find Technicians'}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleSaveDraft}
                    iconName="Save"
                    iconPosition="left"
                    className="w-full"
                  >
                    Save as Draft
                  </Button>
                </div>

                {/* Help Section */}
                <div className="mt-6 bg-muted/50 border border-border rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon name="HelpCircle" size={16} className="text-primary" />
                    <span className="text-sm font-medium text-foreground">Need Help?</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    Our support team is here to assist you with your service request.
                  </p>
                  <div className="space-y-2">
                    <button className="flex items-center space-x-2 text-xs text-primary hover:text-primary/80 trust-transition">
                      <Icon name="Phone" size={12} />
                      <span>Call Support: 1800-123-4567</span>
                    </button>
                    <button className="flex items-center space-x-2 text-xs text-primary hover:text-primary/80 trust-transition">
                      <Icon name="MessageCircle" size={12} />
                      <span>Live Chat Support</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ServiceRequestCreation;