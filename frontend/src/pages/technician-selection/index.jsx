import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/ui/Header';
import TechnicianMap from './components/TechnicianMap';
import TechnicianList from './components/TechnicianList';
import FilterControls from './components/FilterControls';
import ComparisonModal from './components/ComparisonModal';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/MongoAuthContext';

const DEFAULT_RADIUS_KM = 12;
const DEFAULT_COORDINATES = { lat: 12.9716, lng: 77.5946 };

const CATEGORY_LABELS = {
  electrical: 'Electrical',
  plumbing: 'Plumbing',
  hvac: 'AC Repair',
  appliance_repair: 'Appliance Repair',
  cleaning: 'Cleaning',
  handyman: 'Handyman',
  gardening: 'Gardening',
};

const defaultFilters = {
  sortBy: 'distance',
  availability: 'all',
  rating: 'all',
  priceRange: 'all',
  experience: 'all',
  verified: false,
  responseTime: 'all',
};

const responseThresholdMap = {
  '5min': 5,
  '15min': 15,
  '30min': 30,
  '1hr': 60,
};

const filterTechnicians = (source = [], filters = defaultFilters) => {
  let result = [...source];

      if (filters.availability !== 'all') {
        result = result.filter((tech) => tech.availability === filters.availability);
      }

      if (filters.rating !== 'all') {
        const minRating = parseFloat(filters.rating);
        result = result.filter((tech) => (tech.ratingValue ?? parseFloat(tech.rating)) >= minRating);
      }

      if (filters.priceRange !== 'all') {
        if (filters.priceRange.endsWith('+')) {
          const min = parseInt(filters.priceRange, 10);
      result = result.filter((tech) => {
        const rate = tech.priceWithSurge ?? tech.hourlyRate ?? 0;
        return rate >= min;
      });
        } else {
          const [minRaw, maxRaw] = filters.priceRange.split('-');
          const min = parseInt(minRaw, 10);
          const max = parseInt(maxRaw, 10);
      result = result.filter((tech) => {
        const rate = tech.priceWithSurge ?? tech.hourlyRate ?? 0;
        return rate >= min && rate <= max;
      });
        }
      }

      if (filters.experience !== 'all') {
        if (filters.experience.endsWith('+')) {
          const min = parseInt(filters.experience, 10);
          result = result.filter((tech) => (tech.yearsOfExperience || 0) >= min);
        } else {
          const [minRaw, maxRaw] = filters.experience.split('-');
          const min = parseInt(minRaw, 10);
          const max = parseInt(maxRaw, 10);
          result = result.filter((tech) => {
            const yrs = tech.yearsOfExperience || 0;
            return yrs >= min && yrs <= max;
          });
        }
      }

      if (filters.verified) {
        result = result.filter((tech) => tech.verified || tech.isVerified);
      }

      if (filters.responseTime !== 'all') {
        const threshold = responseThresholdMap[filters.responseTime];
        if (threshold) {
          result = result.filter((tech) => (tech.responseTimeMinutes || Infinity) <= threshold);
        }
      }

  const compareNumbers = (a, b, direction = 'asc') => {
    const safeA = Number.isFinite(a) ? a : Number.POSITIVE_INFINITY;
    const safeB = Number.isFinite(b) ? b : Number.POSITIVE_INFINITY;
    return direction === 'asc' ? safeA - safeB : safeB - safeA;
  };

      switch (filters.sortBy) {
        case 'distance':
          result.sort((a, b) => compareNumbers(a.distanceKm, b.distanceKm));
          break;
        case 'rating':
          result.sort(
            (a, b) => (b.ratingValue ?? parseFloat(b.rating)) - (a.ratingValue ?? parseFloat(a.rating))
          );
          break;
        case 'price-low':
      result.sort((a, b) =>
        compareNumbers(
          a.priceWithSurge ?? a.hourlyRate,
          b.priceWithSurge ?? b.hourlyRate
        )
      );
          break;
        case 'price-high':
      result.sort((a, b) =>
        compareNumbers(
          a.priceWithSurge ?? a.hourlyRate,
          b.priceWithSurge ?? b.hourlyRate,
          'desc'
        )
      );
          break;
        case 'experience':
          result.sort((a, b) => compareNumbers(a.yearsOfExperience, b.yearsOfExperience, 'desc'));
          break;
        case 'response-time':
          result.sort((a, b) => compareNumbers(a.responseTimeMinutes, b.responseTimeMinutes));
          break;
        default:
          break;
      }

      return result;
};

const formatDisplayName = (name) => {
  if (!name) return 'Technician';
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(' ');
};

const TechnicianSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const initialState = location.state || {};
  const initialRequest = initialState.serviceRequest || null;

  const [serviceRequest, setServiceRequest] = useState(initialRequest);
  const [activeView, setActiveView] = useState('both');
  const [technicians, setTechnicians] = useState(initialState.technicians || []);
  const [matchingSummary, setMatchingSummary] = useState(initialState.matchingSummary || null);
  const [filteredTechnicians, setFilteredTechnicians] = useState(initialState.technicians || []);
  const [activeFilters, setActiveFilters] = useState(defaultFilters);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [selectedForComparison, setSelectedForComparison] = useState([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [loading, setLoading] = useState(!initialState.technicians);
  const [error, setError] = useState(null);
  const filtersRef = useRef(activeFilters);
  const [profileTechnician, setProfileTechnician] = useState(null);
  const [bookingState, setBookingState] = useState({ submitting: false, technicianId: null });
  const [bootstrapAttempted, setBootstrapAttempted] = useState(Boolean(initialRequest));

  const fetchTechnicians = useCallback(
    async ({ silent = false } = {}) => {
      if (!serviceRequest) {
        if (!silent) {
          setTechnicians([]);
          setFilteredTechnicians([]);
        }
        return;
      }

      if (!silent) {
    setLoading(true);
    setError(null);
      }

    try {
      const params = {
        category: serviceRequest.category,
        radius: DEFAULT_RADIUS_KM,
      };

        const coords = serviceRequest.locationCoordinates;
        if (coords && typeof coords.lat === 'number' && typeof coords.lng === 'number') {
          params.lat = coords.lat;
          params.lng = coords.lng;
        } else {
          params.lat = DEFAULT_COORDINATES.lat;
          params.lng = DEFAULT_COORDINATES.lng;
        }

      const { data } = await axios.get('/api/technicians/available', { params });
        const surgeMultiplier =
          serviceRequest?.requirements?.surgeMultiplier ??
          (serviceRequest?.priority === 'urgent'
            ? 1.2
            : serviceRequest?.priority === 'high'
            ? 1.1
            : 1);

        const fetchedTechnicians = (data?.technicians || []).map((tech) => {
          const formattedName = formatDisplayName(tech?.name || tech?.fullName);
          const baseRate = Number(tech.hourlyRate || 0);
          const priceWithSurge = surgeMultiplier !== 1 ? Math.round(baseRate * surgeMultiplier) : baseRate;
          return {
            ...tech,
            name: formattedName,
            displayName: formattedName,
            priceWithSurge,
            surgeMultiplier,
          };
        });

        setTechnicians(fetchedTechnicians);
      setMatchingSummary(data?.summary || null);
        setFilteredTechnicians(filterTechnicians(fetchedTechnicians, filtersRef.current));
    } catch (err) {
      console.error('Failed to load technicians:', err);
        if (!silent) {
      setError('Unable to load technicians right now. Please try again later.');
        }
      setTechnicians([]);
      setFilteredTechnicians([]);
    } finally {
        if (!silent) {
      setLoading(false);
    }
      }
    },
    [serviceRequest],
  );

  useEffect(() => {
    filtersRef.current = activeFilters;
  }, [activeFilters]);

  useEffect(() => {
    if (initialState.technicians && initialState.technicians.length && serviceRequest) {
      const surgeMultiplier =
        serviceRequest?.requirements?.surgeMultiplier ??
        (serviceRequest?.priority === 'urgent'
          ? 1.2
          : serviceRequest?.priority === 'high'
          ? 1.1
          : 1);
      const mapped = initialState.technicians.map((tech) => ({
        ...tech,
        priceWithSurge: Math.round((tech.hourlyRate || 0) * surgeMultiplier),
        surgeMultiplier,
      }));
      setTechnicians(mapped);
      setFilteredTechnicians(filterTechnicians(mapped, defaultFilters));
    }
  }, [initialState.technicians, serviceRequest]);

  useEffect(() => {
    if (serviceRequest || bootstrapAttempted) return;
    let cancelled = false;

    const bootstrap = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get('/api/service-requests');
        const requests = Array.isArray(data) ? data : [];
        const candidate =
          requests.find((item) => ['pending', 'confirmed'].includes(item.status)) ||
          requests[0] ||
          null;

        if (!cancelled) {
          if (candidate) {
            setServiceRequest(candidate);
          } else {
            setError('Create a service request to see matching technicians in your area.');
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load service requests:', err);
          setError('We could not load your service requests. Create a new one to begin.');
        }
      } finally {
        if (!cancelled) {
          setBootstrapAttempted(true);
          setLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [serviceRequest, bootstrapAttempted]);

  useEffect(() => {
    fetchTechnicians();
  }, [fetchTechnicians]);

  useEffect(() => {
    setFilteredTechnicians(filterTechnicians(technicians, activeFilters));
  }, [technicians, activeFilters]);

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
    setFilteredTechnicians(filterTechnicians(technicians, filters));
  };

  const handleSortChange = (sortBy) => {
    const nextFilters = { ...activeFilters, sortBy };
    setActiveFilters(nextFilters);
    setFilteredTechnicians(filterTechnicians(technicians, nextFilters));
  };

  const handleTechnicianSelect = (technician) => {
    setSelectedTechnician(technician);
  };

  const handleViewProfile = (technician) => {
    setProfileTechnician(technician);
  };

  const handleSendMessage = (technician) => {
    navigate('/chat-communication', {
      state: {
        technician,
        serviceRequest,
      },
    });
  };

  const handleBookNow = async (technician) => {
    if (!serviceRequest?.id) return;
    try {
      setBookingState({ submitting: true, technicianId: technician?.id });
      await axios.patch(`/api/service-requests/${serviceRequest.id}/status`, {
        status: 'pending',
        technicianId: technician?.userId || technician?.id,
      });
      alert('Request sent! Waiting for the technician to confirm.');
      navigate('/user-dashboard?tab=services');
    } catch (err) {
      console.error('Failed to send booking request:', err);
      alert(err?.response?.data?.error || 'Unable to send booking request. Please try again.');
    } finally {
      setBookingState({ submitting: false, technicianId: null });
    }
  };

  const handleCompare = (technician) => {
    const isSelected = selectedForComparison.some((item) => item.id === technician.id);
    if (isSelected) {
      setSelectedForComparison((prev) => prev.filter((item) => item.id !== technician.id));
    } else if (selectedForComparison.length < 3) {
      setSelectedForComparison((prev) => [...prev, technician]);
    }
  };

  const handleBookFromComparison = (technician) => {
    setShowComparisonModal(false);
    handleBookNow(technician);
  };

  const categoryLabel = CATEGORY_LABELS[serviceRequest?.category] || serviceRequest?.category;

  const userLocation = useMemo(() => {
    // Validate and normalize coordinates
    let lat = DEFAULT_COORDINATES.lat;
    let lng = DEFAULT_COORDINATES.lng;
    
    if (serviceRequest?.locationCoordinates) {
      const rawLat = Number(serviceRequest.locationCoordinates.lat);
      const rawLng = Number(serviceRequest.locationCoordinates.lng);
      
      // Validate latitude (-90 to 90) and longitude (-180 to 180)
      if (!isNaN(rawLat) && isFinite(rawLat) && rawLat >= -90 && rawLat <= 90) {
        lat = rawLat;
      }
      if (!isNaN(rawLng) && isFinite(rawLng) && rawLng >= -180 && rawLng <= 180) {
        lng = rawLng;
      }
    }

    return {
      lat,
      lng,
      address: serviceRequest?.locationAddress || 'Search Technicians',
    };
  }, [serviceRequest]);

  const budgetLabel = useMemo(() => {
    if (typeof serviceRequest?.budgetMin === 'number' && typeof serviceRequest?.budgetMax === 'number') {
      return `₹${serviceRequest.budgetMin.toLocaleString('en-IN')} - ₹${serviceRequest.budgetMax.toLocaleString('en-IN')}`;
    }
    if (typeof serviceRequest?.budgetMin === 'number') {
      return `₹${serviceRequest.budgetMin.toLocaleString('en-IN')}+`;
    }
    return serviceRequest?.requirements?.budget || 'Flexible';
  }, [serviceRequest]);

  const availableCountText = useMemo(() => {
    if (matchingSummary) {
      const nearby = matchingSummary.withinRadius ?? matchingSummary.total ?? 0;
      const total = matchingSummary.total ?? nearby;
      return `${nearby} nearby • ${total} citywide`;
    }
    return `${filteredTechnicians.length} available`;
  }, [matchingSummary, filteredTechnicians]);

  if (!serviceRequest && !bootstrapAttempted) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} location="Search Technicians" activeService={null} />
        <main className="flex min-h-[70vh] items-center justify-center px-4">
          <div className="flex items-center space-x-3 text-muted-foreground">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary"></div>
            <p className="text-sm">Loading your latest service request…</p>
          </div>
        </main>
      </div>
    );
  }

  if (!serviceRequest && bootstrapAttempted) {
    return (
      <div className="min-h-screen bg-background">
        <Header user={user} location="Search Technicians" activeService={null} />
        <main className="pt-24 pb-12">
          <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card px-6 py-10 text-center shadow-subtle">
            <h1 className="text-3xl font-semibold text-foreground">Start by creating a service request</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Tell us what help you need and we’ll automatically shortlist certified technicians nearby.
            </p>
            {error ? (
              <p className="mt-4 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning">
                {error}
              </p>
            ) : null}
            <Button
              className="mt-6"
              size="lg"
              iconName="Plus"
              iconPosition="left"
              onClick={() => navigate('/service-request-creation')}
            >
              Create Service Request
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} location={userLocation.address} activeService={null} />
      <main className="pt-16 relative z-0">
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
                    {categoryLabel} {serviceRequest?.requirements?.subcategory ? `• ${serviceRequest.requirements.subcategory}` : ''}
                  </h1>
                  <p className="text-xs text-muted-foreground mt-1">
                    {serviceRequest?.locationAddress || 'Selected location'} • Budget: {budgetLabel}
                  </p>
                </div>
              </div>

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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {error ? (
            <div className="bg-warning/10 border border-warning/20 text-warning text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          ) : null}

          <FilterControls
            onFilterChange={handleFilterChange}
            onSortChange={handleSortChange}
            totalResults={filteredTechnicians.length}
            activeFilters={activeFilters}
          />

          {selectedForComparison.length > 0 && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon name="GitCompare" size={18} className="text-primary" />
                <span className="text-sm font-medium text-primary">
                  {selectedForComparison.length} technician{selectedForComparison.length > 1 ? 's' : ''} selected for comparison
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowComparisonModal(true)}
                  disabled={selectedForComparison.length === 0}
                >
                  Compare ({selectedForComparison.length})
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="X"
                  onClick={() => setSelectedForComparison([])}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`${activeView === 'list' ? 'hidden lg:block' : ''}`}>
              <div className="bg-card border border-border rounded-lg p-4 trust-shadow flex flex-col h-full min-h-[500px]">
                <div className="flex items-center justify-between mb-4 flex-shrink-0">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Nearby Technicians</h2>
                    <p className="text-xs text-muted-foreground mt-1">{availableCountText}</p>
                  </div>
                </div>
                <div className="flex-1 min-h-0 relative">
                  <TechnicianMap
                    technicians={filteredTechnicians}
                    selectedTechnician={selectedTechnician}
                    onTechnicianSelect={handleTechnicianSelect}
                    userLocation={userLocation}
                    isProfileOpen={Boolean(profileTechnician)}
                  />
                </div>
              </div>
            </div>

            <div className={`${activeView === 'map' ? 'hidden lg:block' : ''}`}>
              <div className="bg-card border border-border rounded-lg p-4 trust-shadow h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Available Technicians</h2>
                  <span className="text-sm text-muted-foreground">
                    {loading && filteredTechnicians.length === 0
                      ? 'Loading...'
                      : loading
                      ? `Refreshing • ${filteredTechnicians.length} found`
                      : `${filteredTechnicians.length} found`}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <TechnicianList
                    technicians={filteredTechnicians}
                    loading={loading}
                    onViewProfile={handleViewProfile}
                    onSendMessage={handleSendMessage}
                    onBookNow={handleBookNow}
                    onCompare={handleCompare}
                    selectedForComparison={selectedForComparison}
                    bookingState={bookingState}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showComparisonModal && (
        <ComparisonModal
          technicians={selectedForComparison}
          onClose={() => setShowComparisonModal(false)}
          onBookTechnician={handleBookFromComparison}
          onViewProfile={handleViewProfile}
        />
      )}
      {profileTechnician && (
        <TechnicianProfileDrawer technician={profileTechnician} onClose={() => setProfileTechnician(null)} />
      )}
    </div>
  );
};

const TechnicianProfileDrawer = ({ technician, onClose }) => {
  if (!technician) return null;

  const specialties = technician.specializations || technician.specialtyLabels || [];
  const displayName = technician.displayName || formatDisplayName(technician?.name);
  const rate = Number.isFinite(technician.priceWithSurge)
    ? technician.priceWithSurge.toLocaleString('en-IN')
    : Number.isFinite(technician.hourlyRate)
    ? technician.hourlyRate.toLocaleString('en-IN')
    : technician.hourlyRate || '—';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-6">
      <div className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{displayName}</h3>
            <p className="text-xs text-muted-foreground">
              {technician?.yearsOfExperience || 0} years experience • Responds in {technician?.responseTime}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
          >
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          <section>
            <h4 className="text-sm font-semibold text-foreground mb-2">Service Overview</h4>
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <p>Hourly rate</p>
                <p className="text-foreground font-medium">₹{rate}</p>
              </div>
              <div>
                <p>Availability</p>
                <p className="flex items-center gap-1">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      technician?.availability === 'available' ? 'bg-success' : 'bg-muted-foreground'
                    }`}
                  ></span>
                  {technician?.availability === 'available' ? 'Available now' : 'Currently busy'}
                </p>
              </div>
              <div>
                <p>Rating</p>
                <p className="text-foreground font-medium">
                  {technician?.rating} ({technician?.reviewCount || 0} reviews)
                </p>
              </div>
              <div>
                <p>Service radius</p>
                <p className="text-foreground font-medium">{technician?.serviceRadius || 0} km</p>
              </div>
            </div>
          </section>

          {specialties?.length ? (
            <section>
              <h4 className="text-sm font-semibold text-foreground mb-2">Specialties</h4>
              <div className="flex flex-wrap gap-2">
                {specialties.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {technician?.bio ? (
            <section>
              <h4 className="text-sm font-semibold text-foreground mb-2">About</h4>
              <p className="text-sm text-muted-foreground leading-6 whitespace-pre-line">
                {technician.bio}
              </p>
            </section>
          ) : null}

          <section>
            <h4 className="text-sm font-semibold text-foreground mb-2">Metrics</h4>
            <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>
                <p>Total jobs</p>
                <p className="text-foreground font-medium">{technician?.totalJobs || 0}</p>
              </div>
              <div>
                <p>Response time</p>
                <p className="text-foreground font-medium">{technician?.responseTime}</p>
              </div>
              <div>
                <p>Average ETA</p>
                <p className="text-foreground font-medium">{technician?.eta ?? '—'}</p>
              </div>
            </div>
          </section>
        </div>

        <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TechnicianSelection;
