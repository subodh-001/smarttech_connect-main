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

const buildDirectionsUrl = (jobCoordinates, jobAddress, technicianLocation) => {
  if (!jobCoordinates?.lat || !jobCoordinates?.lng) {
    if (jobAddress) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(jobAddress)}`;
    }
    return 'https://www.google.com/maps';
  }
  const destination = `${jobCoordinates.lat},${jobCoordinates.lng}`;
  const origin =
    technicianLocation?.lat && technicianLocation?.lng
      ? `${technicianLocation.lat},${technicianLocation.lng}`
      : null;
  if (origin) {
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${destination}`;
};

const JobRequestCard = ({
  job,
  onAccept,
  onDecline,
  disableAccept = false,
  disableReason = '',
  technicianLocation = null,
}) => {
  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'urgent': return 'text-error bg-error/10 border-error/20';
      case 'high': return 'text-warning bg-warning/10 border-warning/20';
      case 'medium': return 'text-accent bg-accent/10 border-accent/20';
      default: return 'text-success bg-success/10 border-success/20';
    }
  };

  const getServiceIcon = (category) => {
    const icons = {
      'plumbing': 'Wrench',
      'electrical': 'Zap',
      'ac-repair': 'Wind',
      'computer': 'Monitor',
      'mobile': 'Smartphone',
      'appliance': 'Home',
      'carpentry': 'Hammer'
    };
    return icons?.[category] || 'Tool';
  };

  const budgetValue = job?.budget ?? job?.budgetMax ?? job?.budgetMin;
  const budgetDisplay =
    budgetValue !== undefined && budgetValue !== null
      ? `₹${Number(budgetValue).toLocaleString('en-IN')}`
      : '—';
  const scheduledAt = job?.preferredTime
    ? job.preferredTime
    : job?.scheduledDate
    ? new Date(job.scheduledDate).toLocaleString()
    : 'As soon as possible';
  const location = job?.locationAddress || job?.location || 'On-site service';
  const applicants = job?.applicants ?? job?.applicantsCount ?? '—';
  const rating = job?.customerRating ?? job?.customer?.rating ?? '--';
  const timeAgo = job?.timeAgo || (job?.createdAt ? new Date(job.createdAt).toLocaleString() : '');
  const jobCoordinates = job?.coordinates;

  const { distanceKm, etaMinutes } = useMemo(() => {
    const distance = calculateDistanceKm(technicianLocation, jobCoordinates);
    return {
      distanceKm: distance,
      etaMinutes: estimateEtaMinutes(distance),
    };
  }, [technicianLocation, jobCoordinates]);

  const handleOpenDirections = () => {
    const url = buildDirectionsUrl(jobCoordinates, location, technicianLocation);
    window.open(url, '_blank', 'noopener');
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 shadow-subtle hover:shadow-elevated transition-smooth">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name={getServiceIcon(job?.category)} size={24} color="var(--color-primary)" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">{job?.title}</h3>
            <p className="text-sm text-text-secondary">{job?.category}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(job?.urgency)}`}>
          {job?.urgency?.toUpperCase()}
        </div>
      </div>
      {job?.assignedToYou && (
        <div className="mb-3 text-xs font-medium text-primary bg-primary/10 border border-primary/20 px-3 py-2 rounded-lg">
          This request was sent to you. Accept to confirm or decline to release it.
        </div>
      )}
      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2">
          <Icon name="MapPin" size={16} color="var(--color-text-secondary)" />
          <span className="text-sm text-text-secondary">{location}</span>
          {distanceKm ? (
            <span className="text-xs text-text-secondary">
              • {distanceKm.toFixed(1)} km away
            </span>
          ) : null}
          {etaMinutes ? (
            <span className="text-xs text-text-secondary hidden sm:inline">
              • ETA ~{etaMinutes} mins
            </span>
          ) : null}
        </div>

        <div className="flex items-center space-x-2">
          <Icon name="DollarSign" size={16} color="var(--color-success)" />
          <span className="text-sm font-medium text-success">{budgetDisplay}</span>
          <span className="text-xs text-text-secondary">Budget</span>
        </div>

        <div className="flex items-center space-x-2">
          <Icon name="Star" size={16} color="var(--color-accent)" />
          <span className="text-sm text-text-secondary">Customer Rating: {rating}/5</span>
        </div>

        <div className="flex items-center space-x-2">
          <Icon name="Clock" size={16} color="var(--color-text-secondary)" />
          <span className="text-sm text-text-secondary">Preferred: {scheduledAt}</span>
        </div>
      </div>
      <div className="bg-muted p-3 rounded-lg mb-4">
        <p className="text-sm text-text-primary">{job?.description}</p>
      </div>

      {jobCoordinates?.lat && jobCoordinates?.lng ? (
        <div className="mb-4 space-y-3">
          <JobLocationMap
            jobLocation={jobCoordinates}
            technicianLocation={technicianLocation}
            height={200}
          />
          <div className="flex flex-wrap items-center justify-between text-xs text-text-secondary gap-3">
            <div className="flex items-center gap-3">
              {distanceKm ? (
                <span className="flex items-center gap-1">
                  <Icon name="Navigation" size={12} />
                  {distanceKm.toFixed(1)} km away
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Icon name="Navigation" size={12} />
                  Location pinned on map
                </span>
              )}
              {etaMinutes ? (
                <span className="flex items-center gap-1">
                  <Icon name="Clock" size={12} />
                  ETA ~{etaMinutes} mins
                </span>
              ) : null}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenDirections}
              iconName="Map"
              iconPosition="left"
            >
              Open in Maps
            </Button>
          </div>
        </div>
      ) : null}

      <div className="flex items-center space-x-3">
        <Button
          variant="success"
          onClick={() => onAccept(job?.id)}
          className="flex-1"
          iconName="Check"
          iconPosition="left"
          disabled={disableAccept && !job?.assignedToYou}
          title={disableAccept && !job?.assignedToYou ? disableReason : undefined}
        >
          {job?.assignedToYou ? 'Accept & Confirm' : 'Accept Job'}
        </Button>
        <Button
          variant="outline"
          onClick={() => onDecline(job?.id)}
          className="flex-1"
          iconName="X"
          iconPosition="left"
        >
          Decline
        </Button>
      </div>
      <div className="mt-3 text-xs text-text-secondary text-center">
        {timeAgo ? `Posted ${timeAgo}` : 'New request'} • {applicants} technicians interested
      </div>
    </div>
  );
};

export default JobRequestCard;