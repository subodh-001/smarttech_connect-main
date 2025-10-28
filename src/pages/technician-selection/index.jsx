import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/ui/Header';
import TechnicianMap from './components/TechnicianMap';
import TechnicianList from './components/TechnicianList';
import FilterControls from './components/FilterControls';
import ComparisonModal from './components/ComparisonModal';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const TechnicianSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeView, setActiveView] = useState('both'); // 'map', 'list', 'both'
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [selectedForComparison, setSelectedForComparison] = useState([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filteredTechnicians, setFilteredTechnicians] = useState([]);

  // Mock user data
  const mockUser = {
    id: 1,
    name: "Rajesh Kumar",
    email: "rajesh.kumar@email.com",
    phone: "+91 9876543210"
  };

  // Mock user location
  const userLocation = {
    lat: 28.6139,
    lng: 77.2090,
    address: "Connaught Place, New Delhi"
  };

  // Mock service request data (from previous page)
  const serviceRequest = location?.state?.serviceRequest || {
    category: "Electrical",
    subcategory: "Fan Installation",
    description: "Need to install 2 ceiling fans in bedroom",
    budget: 800,
    preferredTime: "Today, 2:00 PM - 6:00 PM",
    urgency: "medium"
  };

  // Mock technicians data
  const mockTechnicians = [
    {
      id: 1,
      name: "Amit Sharma",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      rating: 4.8,
      reviewCount: 127,
      experience: "8 years",
      specializations: ["Electrical", "Fan Installation", "Wiring", "Switch Repair"],
      distance: "0.8 km",
      eta: "15 mins",
      hourlyRate: 450,
      availability: "available",
      isVerified: true,
      badges: ["Top Rated", "Quick Response"],
      responseTime: "2 mins",
      recentReview: {
        rating: 5,
        customerName: "Priya M.",
        comment: "Excellent work! Fixed my ceiling fan quickly and professionally. Highly recommended for electrical work."
      },
      location: { lat: 28.6149, lng: 77.2100 }
    },
    {
      id: 2,
      name: "Vikram Singh",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      rating: 4.6,
      reviewCount: 89,
      experience: "5 years",
      specializations: ["Electrical", "AC Repair", "Appliance Installation"],
      distance: "1.2 km",
      eta: "20 mins",
      hourlyRate: 400,
      availability: "available",
      isVerified: true,
      badges: ["Verified Pro"],
      responseTime: "5 mins",
      recentReview: {
        rating: 4,
        customerName: "Rohit K.",
        comment: "Good service and reasonable pricing. Completed the fan installation on time."
      },
      location: { lat: 28.6129, lng: 77.2080 }
    },
    {
      id: 3,
      name: "Suresh Patel",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
      rating: 4.9,
      reviewCount: 203,
      experience: "12 years",
      specializations: ["Electrical", "Home Automation", "Smart Switches", "Wiring"],
      distance: "1.5 km",
      eta: "25 mins",
      hourlyRate: 600,
      availability: "busy",
      isVerified: true,
      badges: ["Expert", "Premium Service"],
      responseTime: "1 min",
      recentReview: {
        rating: 5,
        customerName: "Anjali S.",
        comment: "Outstanding expertise in electrical work. Installed smart switches perfectly. Worth every penny!"
      },
      location: { lat: 28.6159, lng: 77.2110 }
    },
    {
      id: 4,
      name: "Ravi Kumar",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
      rating: 4.4,
      reviewCount: 56,
      experience: "3 years",
      specializations: ["Electrical", "Basic Repairs", "Fan Service"],
      distance: "2.1 km",
      eta: "30 mins",
      hourlyRate: 300,
      availability: "available",
      isVerified: false,
      badges: [],
      responseTime: "10 mins",
      recentReview: {
        rating: 4,
        customerName: "Deepak T.",
        comment: "Affordable and reliable service. Good for basic electrical work."
      },
      location: { lat: 28.6119, lng: 77.2070 }
    },
    {
      id: 5,
      name: "Manoj Gupta",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      rating: 4.7,
      reviewCount: 145,
      experience: "7 years",
      specializations: ["Electrical", "Industrial Wiring", "Motor Repair"],
      distance: "1.8 km",
      eta: "28 mins",
      hourlyRate: 500,
      availability: "available",
      isVerified: true,
      badges: ["Industrial Expert"],
      responseTime: "3 mins",
      recentReview: {
        rating: 5,
        customerName: "Sanjay R.",
        comment: "Professional approach and quality work. Fixed complex wiring issues efficiently."
      },
      location: { lat: 28.6169, lng: 77.2120 }
    },
    {
      id: 6,
      name: "Ashok Yadav",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
      rating: 4.2,
      reviewCount: 34,
      experience: "4 years",
      specializations: ["Electrical", "Home Repairs", "Switch Installation"],
      distance: "2.5 km",
      eta: "35 mins",
      hourlyRate: 350,
      availability: "offline",
      isVerified: true,
      badges: [],
      responseTime: "15 mins",
      recentReview: {
        rating: 4,
        customerName: "Meera P.",
        comment: "Decent work quality. Completed the job as requested."
      },
      location: { lat: 28.6109, lng: 77.2060 }
    }
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setFilteredTechnicians(mockTechnicians);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleFilterChange = (filters) => {
    let filtered = [...mockTechnicians];

    // Apply availability filter
    if (filters?.availability !== 'all') {
      filtered = filtered?.filter(tech => tech?.availability === filters?.availability);
    }

    // Apply rating filter
    if (filters?.rating !== 'all') {
      const minRating = parseFloat(filters?.rating);
      filtered = filtered?.filter(tech => tech?.rating >= minRating);
    }

    // Apply price range filter
    if (filters?.priceRange !== 'all') {
      const [min, max] = filters?.priceRange?.split('-')?.map(p => p?.replace('+', ''));
      if (max) {
        filtered = filtered?.filter(tech => tech?.hourlyRate >= parseInt(min) && tech?.hourlyRate <= parseInt(max));
      } else {
        filtered = filtered?.filter(tech => tech?.hourlyRate >= parseInt(min));
      }
    }

    // Apply experience filter
    if (filters?.experience !== 'all') {
      const [minExp, maxExp] = filters?.experience?.split('-')?.map(e => e?.replace('+', ''));
      if (maxExp) {
        filtered = filtered?.filter(tech => {
          const exp = parseInt(tech?.experience);
          return exp >= parseInt(minExp) && exp <= parseInt(maxExp);
        });
      } else {
        filtered = filtered?.filter(tech => parseInt(tech?.experience) >= parseInt(minExp));
      }
    }

    // Apply verified filter
    if (filters?.verified) {
      filtered = filtered?.filter(tech => tech?.isVerified);
    }

    setFilteredTechnicians(filtered);
  };

  const handleSortChange = (sortBy) => {
    let sorted = [...filteredTechnicians];

    switch (sortBy) {
      case 'distance':
        sorted?.sort((a, b) => parseFloat(a?.distance) - parseFloat(b?.distance));
        break;
      case 'rating':
        sorted?.sort((a, b) => b?.rating - a?.rating);
        break;
      case 'price-low':
        sorted?.sort((a, b) => a?.hourlyRate - b?.hourlyRate);
        break;
      case 'price-high':
        sorted?.sort((a, b) => b?.hourlyRate - a?.hourlyRate);
        break;
      case 'experience':
        sorted?.sort((a, b) => parseInt(b?.experience) - parseInt(a?.experience));
        break;
      case 'response-time':
        sorted?.sort((a, b) => parseInt(a?.responseTime) - parseInt(b?.responseTime));
        break;
      default:
        break;
    }

    setFilteredTechnicians(sorted);
  };

  const handleTechnicianSelect = (technician) => {
    setSelectedTechnician(technician);
  };

  const handleViewProfile = (technician) => {
    console.log('View profile for:', technician?.name);
    // Navigate to technician profile page
  };

  const handleSendMessage = (technician) => {
    console.log('Send message to:', technician?.name);
    // Open chat/message modal
  };

  const handleBookNow = (technician) => {
    console.log('Book technician:', technician?.name);
    // Navigate to booking confirmation with technician and service details
    navigate('/live-tracking', {
      state: {
        technician,
        serviceRequest,
        bookingDetails: {
          scheduledTime: serviceRequest?.preferredTime,
          estimatedCost: technician?.hourlyRate * 2, // Assuming 2 hours
          bookingId: `BK${Date.now()}`,
          status: 'confirmed'
        }
      }
    });
  };

  const handleCompare = (technician) => {
    const isSelected = selectedForComparison?.some(selected => selected?.id === technician?.id);
    
    if (isSelected) {
      setSelectedForComparison(prev => prev?.filter(selected => selected?.id !== technician?.id));
    } else {
      if (selectedForComparison?.length < 3) {
        setSelectedForComparison(prev => [...prev, technician]);
      }
    }
  };

  const handleShowComparison = () => {
    if (selectedForComparison?.length > 0) {
      setShowComparisonModal(true);
    }
  };

  const handleCloseComparison = () => {
    setShowComparisonModal(false);
  };

  const handleBookFromComparison = (technician) => {
    setShowComparisonModal(false);
    handleBookNow(technician);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={mockUser} 
        location={userLocation?.address}
        activeService={null}
      />
      <main className="pt-16">
        {/* Service Request Summary */}
        <div className="bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/service-request-creation')}
                  className="p-2 hover:bg-muted rounded-md trust-transition"
                >
                  <Icon name="ArrowLeft" size={20} />
                </button>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">
                    {serviceRequest?.category} - {serviceRequest?.subcategory}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Budget: ₹{serviceRequest?.budget} • {serviceRequest?.preferredTime}
                  </p>
                </div>
              </div>
              
              {/* View Toggle (Mobile) */}
              <div className="flex items-center space-x-2 lg:hidden">
                <Button
                  variant={activeView === 'map' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('map')}
                  iconName="Map"
                >
                  Map
                </Button>
                <Button
                  variant={activeView === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveView('list')}
                  iconName="List"
                >
                  List
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Filter Controls */}
          <div className="mb-6">
            <FilterControls
              onFilterChange={handleFilterChange}
              onSortChange={handleSortChange}
              totalResults={filteredTechnicians?.length}
              activeFilters={{}}
            />
          </div>

          {/* Comparison Bar */}
          {selectedForComparison?.length > 0 && (
            <div className="mb-6 bg-primary/10 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon name="GitCompare" size={18} className="text-primary" />
                  <span className="text-sm font-medium text-primary">
                    {selectedForComparison?.length} technician{selectedForComparison?.length > 1 ? 's' : ''} selected for comparison
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShowComparison}
                    disabled={selectedForComparison?.length === 0}
                  >
                    Compare ({selectedForComparison?.length})
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedForComparison([])}
                    iconName="X"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Map Section */}
            <div className={`${activeView === 'list' ? 'hidden lg:block' : ''}`}>
              <div className="bg-card border border-border rounded-lg p-4 trust-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Nearby Technicians</h2>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Icon name="MapPin" size={16} />
                    <span>Within 5 km</span>
                  </div>
                </div>
                <div className="h-96 lg:h-[600px]">
                  <TechnicianMap
                    technicians={filteredTechnicians}
                    selectedTechnician={selectedTechnician}
                    onTechnicianSelect={handleTechnicianSelect}
                    userLocation={userLocation}
                  />
                </div>
              </div>
            </div>

            {/* List Section */}
            <div className={`${activeView === 'map' ? 'hidden lg:block' : ''}`}>
              <div className="bg-card border border-border rounded-lg p-4 trust-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Available Technicians</h2>
                  <span className="text-sm text-muted-foreground">
                    {filteredTechnicians?.length} found
                  </span>
                </div>
                <div className="max-h-[600px] overflow-y-auto">
                  <TechnicianList
                    technicians={filteredTechnicians}
                    loading={loading}
                    onViewProfile={handleViewProfile}
                    onSendMessage={handleSendMessage}
                    onBookNow={handleBookNow}
                    onCompare={handleCompare}
                    selectedForComparison={selectedForComparison}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Comparison Modal */}
      {showComparisonModal && (
        <ComparisonModal
          technicians={selectedForComparison}
          onClose={handleCloseComparison}
          onBookTechnician={handleBookFromComparison}
          onViewProfile={handleViewProfile}
        />
      )}
    </div>
  );
};

export default TechnicianSelection;