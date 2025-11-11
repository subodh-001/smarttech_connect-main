import React, { useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import JobLocationMap from './JobLocationMap';

const EARTH_RADIUS_KM = 6371;

const toRadians = (value) => (value * Math.PI) / 180;

const calculateDistanceKm = (from, to) => {
  if (!from?.lat || !from?.lng || !to?.lat || !to?.lng) return null;
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
};

const estimateEtaMinutes = (distanceKm) => {
  if (distanceKm == null) return null;
  return Math.max(5, Math.round(distanceKm * 3));
};

const ActiveJobsSection = ({
  activeJobs,
  onNavigate,
  onContactCustomer,
  onUpdateStatus,
  technicianLocation = null,
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'text-primary bg-primary/10 border-primary/20';
      case 'in_progress':
        return 'text-accent bg-accent/10 border-accent/20';
      case 'completed':
        return 'text-success bg-success/10 border-success/20';
      case 'cancelled':
        return 'text-error bg-error/10 border-error/20';
      default:
        return 'text-text-secondary bg-muted border-border';
    }
  };

  const formatStatusLabel = (status) => {
    if (!status) return 'PENDING';
    return status.replace(/_/g, ' ').toUpperCase();
  };

  const getNextStatusMeta = (status) => {
    switch (status) {
      case 'confirmed':
        return { next: 'in_progress', label: 'Start Job', icon: 'Play', variant: 'secondary' };
      case 'in_progress':
        return { next: 'completed', label: 'Mark Completed', icon: 'Check', variant: 'success' };
      default:
        return { next: null, label: 'Status Updated', icon: 'RefreshCw', variant: 'secondary' };
    }
  };

  if (activeJobs?.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 text-center">
        <Icon name="Calendar" size={48} color="var(--color-text-secondary)" className="mx-auto mb-4" />
        <h3 className="text-lg font-medium text-text-primary mb-2">No Active Jobs</h3>
        <p className="text-text-secondary">You don't have any active jobs at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activeJobs?.map((job) => {
        const statusMeta = getNextStatusMeta(job?.status);
        return (
        <div key={job?.id} className="bg-card rounded-lg border border-border p-6 shadow-subtle">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-text-primary mb-1">{job?.title}</h3>
              <p className="text-sm text-text-secondary">{job?.customerName}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(job?.status)}`}>
              {formatStatusLabel(job?.status)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Icon name="MapPin" size={16} color="var(--color-text-secondary)" />
                <span className="text-sm text-text-secondary">{job?.address}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Clock" size={16} color="var(--color-text-secondary)" />
                <span className="text-sm text-text-secondary">Started: {job?.startTime}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="DollarSign" size={16} color="var(--color-success)" />
                <span className="text-sm font-medium text-success">
                  ₹
                  {Number.isFinite(job?.amount) ? job.amount.toLocaleString('en-IN') : job?.amount}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Icon name="Phone" size={16} color="var(--color-text-secondary)" />
                <span className="text-sm text-text-secondary">{job?.customerPhone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Navigation" size={16} color="var(--color-primary)" />
                <span className="text-sm text-primary">ETA: {job?.eta}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Star" size={16} color="var(--color-accent)" />
                <span className="text-sm text-text-secondary">Customer: {job?.customerRating}/5</span>
              </div>
            </div>
          </div>

          {job?.coordinates?.lat && job?.coordinates?.lng ? (
            <div className="mb-4 space-y-3">
              <JobLocationMap
                jobLocation={job.coordinates}
                technicianLocation={technicianLocation}
                height={200}
              />
              <div className="flex flex-wrap items-center justify-between text-xs text-text-secondary gap-3">
                <DistanceSummary job={job} technicianLocation={technicianLocation} />
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="Map"
                  iconPosition="left"
                  onClick={() => onNavigate?.(job)}
                >
                  Open in Maps
                </Button>
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigate?.(job)}
              iconName="Navigation"
              iconPosition="left"
            >
              Navigate
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onContactCustomer(job?.id)}
              iconName="Phone"
              iconPosition="left"
            >
              Call Customer
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onContactCustomer(job?.id, 'message')}
              iconName="MessageCircle"
              iconPosition="left"
            >
              Message
            </Button>
            <Button
              variant={statusMeta.variant}
              size="sm"
              disabled={!statusMeta.next}
              onClick={() => statusMeta.next && onUpdateStatus?.(job, statusMeta.next)}
              iconName={statusMeta.icon}
              iconPosition="left"
            >
              {statusMeta.label}
            </Button>
          </div>
        </div>
        );
      })}
    </div>
  );
};

const DistanceSummary = ({ job, technicianLocation }) => {
  const { distanceKm, etaMinutes } = useMemo(() => {
    const distance = calculateDistanceKm(technicianLocation, job?.coordinates);
    return {
      distanceKm: distance,
      etaMinutes: estimateEtaMinutes(distance),
    };
  }, [job, technicianLocation]);

  if (!distanceKm && !etaMinutes) {
    return (
      <div className="flex items-center gap-2">
        <Icon name="Navigation" size={12} />
        <span>Job pinned on map</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      {distanceKm ? (
        <span className="flex items-center gap-1">
          <Icon name="Navigation" size={12} />
          {distanceKm.toFixed(1)} km away
        </span>
      ) : null}
      {etaMinutes ? (
        <span className="flex items-center gap-1">
          <Icon name="Clock" size={12} />
          ETA ~{etaMinutes} mins
        </span>
      ) : null}
    </div>
  );
};

export default ActiveJobsSection;