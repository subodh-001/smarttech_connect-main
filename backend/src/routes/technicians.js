import express from 'express';
import fs from 'fs';
import path from 'path';
import multer from 'multer';
import Technician from '../models/Technician.js';
import authMiddleware from '../middleware/auth.js';

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
