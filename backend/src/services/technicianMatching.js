import Technician from '../models/Technician.js';
import { TECHNICIAN_SPECIALTIES, SPECIALTY_LABEL_MAP } from '../constants/technicianSpecialties.js';

const EARTH_RADIUS_KM = 6371;

const DEFAULT_LOCATION = { lat: 12.9716, lng: 77.5946 };

const toRadians = (degrees) => (degrees * Math.PI) / 180;

const haversineDistance = (lat1, lng1, lat2, lng2) => {
  if (
    typeof lat1 !== 'number' ||
    typeof lng1 !== 'number' ||
    typeof lat2 !== 'number' ||
    typeof lng2 !== 'number'
  ) {
    return null;
  }

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
};

const formatSpecialties = (specialties = []) =>
  specialties.map((spec) => SPECIALTY_LABEL_MAP[spec] || spec.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()));

const buildBadges = (technician) => {
  const badges = [];
  if ((technician.averageRating || 0) >= 4.6) badges.push('Top Rated');
  if ((technician.totalJobs || 0) >= 75) badges.push('Popular');
  if ((technician.yearsOfExperience || 0) >= 5) badges.push('Expert');
  if (technician.serviceRadius >= 15) badges.push('City Wide');
  return badges;
};

const computeEtaMinutes = (distanceKm) => {
  if (distanceKm === null) return null;
  // assume average travel speed ~20km/h => 3 minutes per km
  const eta = Math.max(5, Math.round(distanceKm * 3));
  return eta;
};

const buildAvatar = (technician, userDoc) => {
  if (userDoc?.avatarUrl) return userDoc.avatarUrl;
  const name = encodeURIComponent(userDoc?.fullName || userDoc?.email || 'technician');
  return `https://api.dicebear.com/7.x/initials/svg?radius=50&seed=${name}`;
};

const formatTechnician = (doc, options) => {
  const { lat, lng, radiusInKm } = options;
  const userDoc = doc.userId || {};

  const location = doc.lastLocation && typeof doc.lastLocation.lat === 'number'
    ? doc.lastLocation
    : DEFAULT_LOCATION;

  const distanceKm =
    typeof lat === 'number' && typeof lng === 'number'
      ? haversineDistance(lat, lng, location.lat, location.lng)
      : null;

  const etaMinutes = computeEtaMinutes(distanceKm);
  const ratingValue = Number(doc.averageRating || 4.5);
  const responseMinutes = doc.responseTimeMinutes || Math.max(2, Math.round((doc.totalJobs || 20) / 15));

  const availability = doc.currentStatus || 'offline';
  const isWithinRadius =
    radiusInKm && typeof radiusInKm === 'number' && distanceKm !== null
      ? distanceKm <= radiusInKm
      : true;

  return {
    id: doc._id.toString(),
    userId: userDoc?._id ? userDoc._id.toString() : null,
    name: userDoc?.fullName || userDoc?.email || 'Technician',
    email: userDoc?.email || null,
    phone: userDoc?.phone || null,
    avatar: buildAvatar(doc, userDoc),
    rating: ratingValue.toFixed(1),
    ratingValue,
    reviewCount: doc.totalJobs || 0,
    yearsOfExperience: doc.yearsOfExperience || 0,
    experience: `${doc.yearsOfExperience || 0} years`,
    specializations: formatSpecialties(doc.specialties),
    distanceKm: distanceKm ?? null,
    distance: distanceKm !== null ? `${distanceKm.toFixed(1)} km` : '—',
    etaMinutes: etaMinutes ?? null,
    eta: etaMinutes !== null ? `${etaMinutes} mins` : '—',
    availability,
    isAvailable: availability === 'available',
    hourlyRate: doc.hourlyRate || 400,
    responseTimeMinutes: responseMinutes,
    responseTime: `${responseMinutes} mins`,
    badges: buildBadges(doc),
    recentReview: doc.recentReview || null,
    location,
    serviceRadius: doc.serviceRadius || 10,
    kycStatus: doc.kycStatus,
    verified: doc.kycStatus === 'approved',
    isVerified: doc.kycStatus === 'approved',
    withinRadius: isWithinRadius,
  };
};

export const findAvailableTechnicians = async ({
  category,
  lat,
  lng,
  radiusInKm = 10,
  limit = 50,
}) => {
  const query = {
    currentStatus: 'available',
    kycStatus: 'approved',
  };

  if (category) {
    query.specialties = category;
  }

  const docs = await Technician.find(query)
    .populate('userId', 'fullName email phone avatarUrl')
    .limit(Math.max(limit, 1) * 2) // fetch extra for radius filtering
    .lean({ getters: true, virtuals: true });

  const options = {
    lat: typeof lat === 'number' ? lat : undefined,
    lng: typeof lng === 'number' ? lng : undefined,
    radiusInKm,
  };

  const formatted = docs.map((doc) => formatTechnician(doc, options));

  formatted.sort((a, b) => {
    if (a.distanceKm === null && b.distanceKm === null) return 0;
    if (a.distanceKm === null) return 1;
    if (b.distanceKm === null) return -1;
    return a.distanceKm - b.distanceKm;
  });

  const trimmed = formatted.slice(0, limit);

  const totals = {
    total: formatted.length,
    withinRadius:
      typeof radiusInKm === 'number'
        ? formatted.filter((item) => item.withinRadius).length
        : formatted.length,
    categoryBreakdown: formatted.reduce((acc, item) => {
      (item.specializations || []).forEach((spec) => {
        acc[spec] = (acc[spec] || 0) + 1;
      });
      return acc;
    }, {}),
    averageEta: (() => {
      const etas = trimmed.map((item) => item.etaMinutes).filter((val) => typeof val === 'number');
      if (!etas.length) return null;
      return Math.round(etas.reduce((sum, val) => sum + val, 0) / etas.length);
    })(),
  };

  return {
    technicians: trimmed,
    summary: totals,
  };
};


