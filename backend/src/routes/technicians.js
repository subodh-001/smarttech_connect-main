import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import Technician from '../models/Technician.js';
import authMiddleware from '../middleware/auth.js';
import { findAvailableTechnicians } from '../services/technicianMatching.js';
import { TECHNICIAN_SPECIALTIES, SPECIALTY_LABEL_MAP } from '../constants/technicianSpecialties.js';

const router = express.Router();

const uploadDir = path.resolve(process.cwd(), 'uploads/kyc');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf'];

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, JPG, and PNG files are allowed.'));
    }
  },
});

const ensureTechnicianRole = (req, res) => {
  if (req.user.role !== 'technician') {
    res.status(403).json({ error: 'Only technicians can access this resource.' });
    return false;
  }
  return true;
};

// List technicians (optionally by userId)
router.get('/', authMiddleware, async (req, res) => {
  const { userId } = req.query;
  const q = userId ? { userId } : {};
  const list = await Technician.find(q).limit(50).lean();
  res.json(list);
});

router.get('/available', authMiddleware, async (req, res) => {
  try {
    const { category, radius, limit } = req.query;
    const lat = Number.parseFloat(req.query.lat);
    const lng = Number.parseFloat(req.query.lng);

    const filters = {
      category: category || undefined,
      lat: Number.isFinite(lat) ? lat : undefined,
      lng: Number.isFinite(lng) ? lng : undefined,
      radiusInKm: radius ? Number.parseFloat(radius) || undefined : undefined,
      limit: limit ? Number.parseInt(limit, 10) : undefined,
    };

    const result = await findAvailableTechnicians(filters);
    res.json(result);
  } catch (error) {
    console.error('Failed to fetch available technicians:', error);
    res.status(500).json({ error: 'Failed to fetch available technicians' });
  }
});

router.get('/specialties', authMiddleware, (_req, res) => {
  res.json({
    specialties: TECHNICIAN_SPECIALTIES,
  });
});

router.get('/me/profile', authMiddleware, async (req, res) => {
  if (!ensureTechnicianRole(req, res)) return;

  try {
    let technician = await Technician.findOne({ userId: req.user.sub }).lean();
    if (!technician) {
      technician = await Technician.create({ userId: req.user.sub });
      technician = technician.toObject();
    }

    res.json({
      technician: {
        specialties: technician.specialties || [],
        yearsOfExperience: technician.yearsOfExperience || 0,
        serviceRadius: technician.serviceRadius || 10,
        hourlyRate: technician.hourlyRate || 0,
        bio: technician.bio || '',
        certifications: technician.certifications || [],
        payoutMethod: technician.payoutMethod || 'none',
        upiId: technician.upiId || null,
        bankAccountName: technician.bankAccountName || null,
        bankAccountNumber: technician.bankAccountNumber || null,
        bankIfscCode: technician.bankIfscCode || null,
      },
      specialties: TECHNICIAN_SPECIALTIES,
    });
  } catch (error) {
    console.error('Failed to load technician profile:', error);
    res.status(500).json({ error: 'Failed to load technician profile.' });
  }
});

router.put('/me/profile', authMiddleware, async (req, res) => {
  if (!ensureTechnicianRole(req, res)) return;

  try {
    const payload = req.body || {};
    const allowedSpecialties = new Set(TECHNICIAN_SPECIALTIES.map((item) => item.id));

    const updates = {};

    if (payload.specialties !== undefined) {
      if (!Array.isArray(payload.specialties)) {
        return res.status(400).json({ error: 'Specialties must be an array.' });
      }
      const cleaned = [...new Set(payload.specialties.filter((spec) => allowedSpecialties.has(spec)))];
      if (cleaned.length === 0) {
        return res.status(400).json({ error: 'Select at least one valid specialty.' });
      }
      updates.specialties = cleaned;
    }

    if (payload.yearsOfExperience !== undefined) {
      const years = Number(payload.yearsOfExperience);
      if (!Number.isInteger(years) || years < 0 || years > 60) {
        return res.status(400).json({ error: 'Years of experience must be between 0 and 60.' });
      }
      updates.yearsOfExperience = years;
    }

    if (payload.serviceRadius !== undefined) {
      const radius = Number(payload.serviceRadius);
      if (Number.isNaN(radius) || radius < 1 || radius > 50) {
        return res.status(400).json({ error: 'Service radius must be between 1 and 50 km.' });
      }
      updates.serviceRadius = radius;
    }

    if (payload.hourlyRate !== undefined) {
      const rate = Number(payload.hourlyRate);
      if (Number.isNaN(rate) || rate < 0 || rate > 10000) {
        return res.status(400).json({ error: 'Hourly rate must be between 0 and 10000.' });
      }
      updates.hourlyRate = rate;
    }

    if (payload.bio !== undefined) {
      updates.bio = typeof payload.bio === 'string' ? payload.bio.trim().slice(0, 600) : '';
    }

    // Payout settings
    if (payload.payoutMethod !== undefined) {
      const allowedMethods = ['upi', 'bank_transfer', 'none'];
      if (!allowedMethods.includes(payload.payoutMethod)) {
        return res.status(400).json({ error: 'Invalid payout method.' });
      }
      updates.payoutMethod = payload.payoutMethod;
    }

    if (payload.upiId !== undefined) {
      updates.upiId = typeof payload.upiId === 'string' ? payload.upiId.trim() : null;
    }

    if (payload.bankAccountName !== undefined) {
      updates.bankAccountName = typeof payload.bankAccountName === 'string' ? payload.bankAccountName.trim() : null;
    }

    if (payload.bankAccountNumber !== undefined) {
      updates.bankAccountNumber = typeof payload.bankAccountNumber === 'string' ? payload.bankAccountNumber.trim() : null;
    }

    if (payload.bankIfscCode !== undefined) {
      updates.bankIfscCode = typeof payload.bankIfscCode === 'string' ? payload.bankIfscCode.trim().toUpperCase() : null;
    }

    if (payload.certifications !== undefined) {
      if (!Array.isArray(payload.certifications)) {
        return res.status(400).json({ error: 'Certifications must be an array of strings.' });
      }
      updates.certifications = payload.certifications
        .map((item) => (typeof item === 'string' ? item.trim() : null))
        .filter(Boolean)
        .slice(0, 10);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update.' });
    }

    const technician = await Technician.findOneAndUpdate(
      { userId: req.user.sub },
      { $set: updates },
      { new: true, upsert: true }
    ).lean();

    res.json({
      technician: {
        specialties: technician.specialties || [],
        yearsOfExperience: technician.yearsOfExperience || 0,
        serviceRadius: technician.serviceRadius || 10,
        hourlyRate: technician.hourlyRate || 0,
        bio: technician.bio || '',
        certifications: technician.certifications || [],
      },
      specialties: TECHNICIAN_SPECIALTIES,
    });
  } catch (error) {
    console.error('Failed to update technician profile:', error);
    res.status(500).json({ error: 'Failed to update technician profile.' });
  }
});

router.get('/me/kyc', authMiddleware, async (req, res) => {
  if (!ensureTechnicianRole(req, res)) return;

  const technician = await Technician.findOne({ userId: req.user.sub }).lean();
  if (!technician) {
    return res.json({ status: 'not_submitted' });
  }

  res.json({
    status: technician.kycStatus || 'not_submitted',
    submittedAt: technician.kycSubmittedAt,
    reviewedAt: technician.kycReviewedAt,
    feedback: technician.kycFeedback || null,
    documents: {
      governmentId: technician.kycGovernmentDocumentPath
        ? `/uploads/kyc/${path.basename(technician.kycGovernmentDocumentPath)}`
        : null,
      selfie: technician.kycSelfieDocumentPath
        ? `/uploads/kyc/${path.basename(technician.kycSelfieDocumentPath)}`
        : null,
    },
    documentUploaded: Boolean(technician.kycGovernmentDocumentPath),
    faceUploaded: Boolean(technician.kycSelfieDocumentPath),
  });
});

router.post('/me/kyc', authMiddleware, (req, res) => {
  if (!ensureTechnicianRole(req, res)) return;

  upload.fields([
    { name: 'governmentId', maxCount: 1 },
    { name: 'selfie', maxCount: 1 },
  ])(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    const governmentFile = req.files?.governmentId?.[0];
    const selfieFile = req.files?.selfie?.[0];

    if (!governmentFile && !selfieFile) {
      return res.status(400).json({ error: 'Upload a government ID or selfie to continue.' });
    }

    try {
      let technician = await Technician.findOne({ userId: req.user.sub });
      if (!technician) {
        technician = new Technician({ userId: req.user.sub });
      }

      if (governmentFile) {
        if (technician.kycGovernmentDocumentPath && fs.existsSync(technician.kycGovernmentDocumentPath)) {
          try {
            fs.unlinkSync(technician.kycGovernmentDocumentPath);
          } catch (unlinkErr) {
            console.warn('Failed to remove previous government document:', unlinkErr.message);
          }
        }
        technician.kycGovernmentDocumentPath = governmentFile.path;
        technician.kycGovernmentDocumentOriginalName = governmentFile.originalname;
      }

      if (selfieFile) {
        if (technician.kycSelfieDocumentPath && fs.existsSync(technician.kycSelfieDocumentPath)) {
          try {
            fs.unlinkSync(technician.kycSelfieDocumentPath);
          } catch (unlinkErr) {
            console.warn('Failed to remove previous selfie document:', unlinkErr.message);
          }
        }
        technician.kycSelfieDocumentPath = selfieFile.path;
        technician.kycSelfieDocumentOriginalName = selfieFile.originalname;
      }

      technician.kycSubmittedAt = new Date();
      technician.kycReviewedAt = null;
      technician.kycStatus = 'under_review';
      technician.kycFeedback = null;
      await technician.save();

      res.json({
        status: technician.kycStatus,
        submittedAt: technician.kycSubmittedAt,
        documents: {
          governmentId: technician.kycGovernmentDocumentPath
            ? `/uploads/kyc/${path.basename(technician.kycGovernmentDocumentPath)}`
            : null,
          selfie: technician.kycSelfieDocumentPath
            ? `/uploads/kyc/${path.basename(technician.kycSelfieDocumentPath)}`
            : null,
        },
        documentUploaded: Boolean(technician.kycGovernmentDocumentPath),
        faceUploaded: Boolean(technician.kycSelfieDocumentPath),
      });
    } catch (error) {
      console.error('Failed to process KYC submission:', error);
      res.status(500).json({ error: 'Failed to submit verification document. Please try again.' });
    }
  });
});

// Update technician by id
router.put('/:id', authMiddleware, async (req, res) => {
  const update = req.body || {};
  const tech = await Technician.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!tech) return res.status(404).json({ error: 'Not found' });
  res.json(tech);
});

export default router;
