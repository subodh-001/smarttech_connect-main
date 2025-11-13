import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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
import TechnicianMap from '../technician-selection/components/TechnicianMap';
import { useAuth } from '../../contexts/MongoAuthContext';

const DEFAULT_LOCATION_LABEL = '123 MG Road, Bangalore, Karnataka 560001';
const DEFAULT_COORDINATES = { lat: 12.9716, lng: 77.5946 };
const DEFAULT_RADIUS_KM = 12;

const MIN_DESCRIPTION_LENGTH = 30;

const ServiceRequestCreation = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);

  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedCategoryInfo, setSelectedCategoryInfo] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [location, setLocation] = useState(DEFAULT_LOCATION_LABEL);
  const [coordinates, setCoordinates] = useState(DEFAULT_COORDINATES);
  const [addressDetails, setAddressDetails] = useState(null); // Store full address details
  const [userSavedAddress, setUserSavedAddress] = useState(null); // User's saved address from profile
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [photos, setPhotos] = useState([]);

  const [availability, setAvailability] = useState({ loading: false, technicians: [], summary: null });
  const [availabilityError, setAvailabilityError] = useState(null);
  const [highlightedTechnician, setHighlightedTechnician] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/user-login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Load user's saved addresses on mount
  useEffect(() => {
    const loadUserAddresses = async () => {
      if (!isAuthenticated) return;
      try {
        const { data } = await axios.get('/api/users/me');
        if (data?.addresses && Array.isArray(data.addresses) && data.addresses.length > 0) {
          // Get default address or first address
          const defaultAddress = data.addresses.find(addr => addr.isDefault) || data.addresses[0];
          if (defaultAddress) {
            setUserSavedAddress({
              street: defaultAddress.street || '',
              city: defaultAddress.city || '',
              state: defaultAddress.state || '',
              postalCode: defaultAddress.zipCode || '',
              label: defaultAddress.label || 'Home',
            });
          }
        }
      } catch (error) {
        console.error('Failed to load user addresses:', error);
      }
    };
    loadUserAddresses();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!('geolocation' in navigator)) return;
    let cancelled = false;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (cancelled) return;
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCoordinates(coords);
        const wasDefault = location === DEFAULT_LOCATION_LABEL;
        if (wasDefault) {
          setLocation('Current location');
          // Prefer user's saved address if available, otherwise reverse geocode
          if (userSavedAddress && !cancelled) {
            setAddressDetails(userSavedAddress);
          } else {
            // Reverse geocode to get address details for "Current location"
            const addressData = await reverseGeocode(coords.lat, coords.lng);
            if (addressData && !cancelled) {
              setAddressDetails({
                street: addressData.street,
                city: addressData.city,
                state: addressData.state,
                postalCode: addressData.postalCode,
              });
            }
          }
        }
      },
      () => {},
      { enableHighAccuracy: true, timeout: 6000 }
    );
    return () => {
      cancelled = true;
    };
  }, [userSavedAddress]); // Include userSavedAddress in dependencies

  const handleCategorySelect = (category) => {
    setSelectedCategoryId(category?.id || '');
    setSelectedCategoryInfo(category || null);
    setSelectedSubcategory('');
  };

  const handleSubcategorySelect = (subcategoryId) => {
    setSelectedSubcategory(subcategoryId);
  };

  // Reverse geocode function to get address from coordinates
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'SmartTechConnect/1.0'
          }
        }
      );
      const data = await response.json();
      if (data && data.address) {
        const addr = data.address;
        const street = addr.road || addr.house_number || '';
        const city = addr.city || addr.town || addr.village || addr.suburb || '';
        const state = addr.state || '';
        const postalCode = addr.postal_code || '';
        
        const addressParts = [street, city, state, postalCode].filter(Boolean);
        const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : 'Current location';
        
        return {
          street: street || 'Current location',
          city,
          state,
          postalCode,
          fullAddress,
        };
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    }
    return null;
  };

  const handleUseCurrentLocation = async () => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCoordinates(coords);
        setLocation('Current location');
        
        // Prefer user's saved address if available, otherwise reverse geocode
        if (userSavedAddress) {
          setAddressDetails(userSavedAddress);
        } else {
          // Reverse geocode to get address details
          const addressData = await reverseGeocode(coords.lat, coords.lng);
          if (addressData) {
            setAddressDetails({
              street: addressData.street,
              city: addressData.city,
              state: addressData.state,
              postalCode: addressData.postalCode,
            });
          }
        }
        // Keep location as "Current location" but we have address details for display
        // The address will be shown to technicians while "Current location" badge indicates it's GPS-based
      },
      (error) => {
        console.warn('Unable to fetch location', error);
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  const fetchAvailability = useCallback(async () => {
    if (!selectedCategoryId) {
      setAvailability({ loading: false, technicians: [], summary: null });
      return;
    }
    setAvailability((prev) => ({ ...prev, loading: true }));
    setAvailabilityError(null);
    try {
      const params = {
        category: selectedCategoryId,
        radius: DEFAULT_RADIUS_KM,
      };
      if (Number.isFinite(coordinates.lat) && Number.isFinite(coordinates.lng)) {
        params.lat = coordinates.lat;
        params.lng = coordinates.lng;
      }
      const { data } = await axios.get('/api/technicians/available', { params });
      setAvailability({
        loading: false,
        technicians: data?.technicians || [],
        summary: data?.summary || null,
      });
    } catch (error) {
      console.error('Failed to load available technicians:', error);
      setAvailability({
        loading: false,
        technicians: [],
        summary: null,
      });
      setAvailabilityError('Unable to load nearby technicians right now.');
    }
  }, [selectedCategoryId, coordinates.lat, coordinates.lng]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const handleDescriptionChange = (newDescription) => setDescription(newDescription);
  const handleBudgetChange = (newBudget) => setBudget(newBudget);
  const handleScheduleChange = (newSchedule) => setSchedule(newSchedule);
  const handlePhotosChange = (newPhotos) => setPhotos(newPhotos);

  const subcategoryInfo = useMemo(() => {
    if (!selectedCategoryInfo || !selectedSubcategory) return null;
    return selectedCategoryInfo.subcategories?.find((item) => item.id === selectedSubcategory) || null;
  }, [selectedCategoryInfo, selectedSubcategory]);

  const isFormValid = () => {
    const trimmedDescription = description?.trim() || '';
    return (
    selectedCategoryId &&
    selectedSubcategory &&
    location &&
      trimmedDescription.length >= MIN_DESCRIPTION_LENGTH &&
    budget &&
      schedule
    );
  };

  const determinePriority = (option) => {
    if (!option) return 'medium';
    if (option.id === 'now') return 'urgent';
    if (option.id === 'within-2h') return 'high';
    if (option.id === 'today') return 'medium';
    return 'low';
  };

  const computeScheduledDate = (option) => {
    if (!option) return undefined;
    if (option.id === 'custom' && option.customDate && option.customTime) {
      return new Date(`${option.customDate}T${option.customTime}:00`);
    }
    if (option.id === 'now') {
      return new Date();
    }
    if (option.id === 'within-2h') {
      return new Date(Date.now() + 2 * 60 * 60 * 1000);
    }
    if (option.id === 'today') {
      const today = new Date();
      today.setHours(18, 0, 0, 0);
      return today;
    }
    return undefined;
  };

  const getSurgeMultiplier = (priorityKey) => {
    if (priorityKey === 'urgent') return 1.2;
    if (priorityKey === 'high') return 1.1;
    return 1;
  };

  const buildRequestPayload = () => {
    const scheduledDate = computeScheduledDate(schedule);
    const priority = determinePriority(schedule);
    const surgeMultiplier = getSurgeMultiplier(priority);
    const adjustedBudgetMin =
      budget?.min != null ? Math.round(budget.min * surgeMultiplier) : null;
    const adjustedBudgetMax =
      budget?.max != null ? Math.round(budget.max * surgeMultiplier) : null;
    return {
      category: selectedCategoryId,
      title: `${selectedCategoryInfo?.name || 'Service'}${subcategoryInfo ? ` - ${subcategoryInfo.name}` : ''}`,
      description,
      priority,
      scheduledDate: scheduledDate ? scheduledDate.toISOString() : undefined,
      locationAddress: location,
      locationCoordinates: coordinates,
      budgetMin: adjustedBudgetMin,
      budgetMax: adjustedBudgetMax,
      requirements: {
        subcategory: selectedSubcategory,
        schedule,
        budget: budget?.label,
        photosCount: photos?.length || 0,
        surgeMultiplier,
        baseBudget: {
          min: budget?.min ?? null,
          max: budget?.max ?? null,
        },
        // Include full address details for technicians
        city: addressDetails?.city || null,
        state: addressDetails?.state || null,
        postalCode: addressDetails?.postalCode || null,
      },
      radiusInKm: DEFAULT_RADIUS_KM,
    };
  };

  const handleFindTechnicians = async () => {
    setSubmissionError(null);
    if (!isFormValid()) {
      const trimmedDescription = description?.trim() || '';
      if (trimmedDescription.length < MIN_DESCRIPTION_LENGTH) {
        setSubmissionError(
          `Please add a bit more detail to the description (minimum ${MIN_DESCRIPTION_LENGTH} characters).`
        );
      } else {
      setSubmissionError('Please complete all required fields before proceeding.');
      }
      return;
    }
    setLoading(true);
    try {
      const payload = buildRequestPayload();
      const { data } = await axios.post('/api/service-requests', payload);
      navigate('/technician-selection', {
        state: {
          serviceRequest: data?.request,
          technicians: data?.matchingTechnicians,
          matchingSummary: data?.matchingSummary,
        },
      });
    } catch (error) {
      console.error('Failed to create service request:', error);
      setSubmissionError(
        error?.response?.data?.error || 'Failed to create service request. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    const draftData = {
      selectedCategory: selectedCategoryId,
      selectedSubcategory,
      location,
      coordinates,
      description,
      budget,
      schedule,
      photos: photos?.length,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem('serviceRequestDraft', JSON.stringify(draftData));
    setSubmissionError('Draft saved locally.');
  };

  const mapUserLocation = useMemo(
    () => ({
      lat: coordinates.lat,
      lng: coordinates.lng,
      address: location,
    }),
    [coordinates, location]
  );

  const availabilitySummaryText = useMemo(() => {
    if (availability.loading) return 'Checking live availability...';
    if (!availability.summary) return 'No technicians found nearby yet.';
    const nearby = availability.summary.withinRadius ?? availability.summary.total ?? 0;
    const total = availability.summary.total ?? nearby;
    if (total === 0) return 'No technicians are online right now.';
    if (nearby === total) {
      return `${nearby} technician${nearby > 1 ? 's are' : ' is'} available near you.`;
    }
    return `${nearby} nearby • ${total} citywide technicians online.`;
  }, [availability]);

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} location={location} activeService={null} />

      <main className="pt-16 relative z-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              Tell us what you need help with and we&apos;ll connect you with verified technicians in your area.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-card border border-border rounded-lg p-6">
                <ServiceCategorySelector
                  selectedCategory={selectedCategoryId}
                  onCategorySelect={handleCategorySelect}
                  selectedSubcategory={selectedSubcategory}
                  onSubcategorySelect={handleSubcategorySelect}
                />
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <LocationSelector
                  currentLocation={location}
                  coordinates={coordinates}
                  onLocationChange={setLocation}
                  onCoordinatesChange={setCoordinates}
                  onUseCurrentLocation={handleUseCurrentLocation}
                  onAddressDetailsChange={setAddressDetails}
                />
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <ServiceDescription
                  description={description}
                  onDescriptionChange={handleDescriptionChange}
                  minLength={MIN_DESCRIPTION_LENGTH}
                />
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <BudgetSelector
                  budget={budget}
                  onBudgetChange={handleBudgetChange}
                  selectedCategory={selectedCategoryId}
                  selectedSubcategory={selectedSubcategory}
                />
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <SchedulingOptions schedule={schedule} onScheduleChange={handleScheduleChange} />
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <PhotoUpload photos={photos} onPhotosChange={handlePhotosChange} />
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Live Technician Availability</p>
                      <p className="text-xs text-muted-foreground mt-1">{availabilitySummaryText}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={fetchAvailability}
                      disabled={!selectedCategoryId || availability.loading}
                      title="Refresh availability"
                    >
                      <Icon name="RefreshCcw" size={16} />
                    </Button>
                  </div>
                  {availabilityError ? (
                    <p className="text-xs text-warning mt-3">{availabilityError}</p>
                  ) : null}
                  {availability.loading ? (
                    <div className="h-56 flex items-center justify-center">
                      <div className="text-center text-xs text-muted-foreground">
                        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                        Checking technicians online...
                      </div>
                    </div>
                  ) : availability.technicians?.length ? (
                    <div className="h-56 mt-4">
                      <TechnicianMap
                        technicians={availability.technicians.slice(0, 6)}
                        selectedTechnician={highlightedTechnician}
                        onTechnicianSelect={setHighlightedTechnician}
                        userLocation={mapUserLocation}
                      />
                    </div>
                  ) : (
                    <div className="h-40 flex items-center justify-center text-xs text-muted-foreground mt-4">
                      No technicians are currently visible near this location.
                    </div>
                  )}
                </div>

                <RequestSummary
                  selectedCategory={selectedCategoryId}
                  selectedSubcategory={selectedSubcategory}
                  location={location}
                  description={description}
                  budget={budget}
                  schedule={schedule}
                  photos={photos}
                  descriptionMinLength={MIN_DESCRIPTION_LENGTH}
                />

                <div className="space-y-3">
                  {submissionError ? (
                    <div className="text-xs text-warning bg-warning/10 border border-warning/20 rounded-md px-3 py-2">
                      {submissionError}
                    </div>
                  ) : null}
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

                <div className="bg-muted/50 border border-border rounded-lg p-4">
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