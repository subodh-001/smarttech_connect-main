import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import OtpToken from '../models/OtpToken.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

const signToken = (user) => {
  const payload = { sub: user._id, role: user.role, email: user.email };
  const secret = process.env.JWT_SECRET || 'dev-secret';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const emailFrom = process.env.EMAIL_FROM || emailUser;

let mailTransporter = null;
if (emailUser && emailPass) {
  mailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
}

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

router.post('/send-otp', async (req, res) => {
  try {
    const { email, fullName, purpose = 'generic' } = req.body || {};
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase();
    const normalizedPurpose = purpose || 'generic';

    if (normalizedPurpose === 'password_reset') {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (!existingUser) {
        // Do not leak account existence
        return res.json({
          success: true,
          message: 'If the email is registered, a reset code has been sent.',
        });
      }
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    await OtpToken.findOneAndUpdate(
      { email: normalizedEmail, purpose: normalizedPurpose },
      {
        otpHash,
        expiresAt,
        attempts: 0,
        verified: false,
        verifiedAt: null,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (!mailTransporter) {
      console.warn(
        `Email service not configured. OTP for ${normalizedEmail} is ${otp}. Configure EMAIL_USER/EMAIL_PASS to send real emails.`
      );

      return res.json({
        success: true,
        message:
          'Email service not configured. OTP has been logged on the server console for development use.',
        devOtp: process.env.NODE_ENV === 'production' ? undefined : otp,
      });
    }

    const mailOptions = {
      from: emailFrom,
      to: normalizedEmail,
      subject: 'SmartTech Connect Verification Code',
      text: `Hello${fullName ? ` ${fullName}` : ''},\n\nYour SmartTech Connect verification code is ${otp}. It expires in 5 minutes.\n\nIf you did not request this, please ignore this email.\n`,
      html: `
        <p>Hello${fullName ? ` ${fullName}` : ''},</p>
        <p>Your SmartTech Connect verification code is <strong>${otp}</strong>.</p>
        <p>This code will expire in 5 minutes.</p>
        <p>If you did not request this, you can safely ignore this email.</p>
      `,
    };

    await mailTransporter.sendMail(mailOptions);

    return res.json({ success: true, message: 'OTP sent to email.' });
  } catch (error) {
    console.error('Failed to send OTP:', error);
    return res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp, purpose = 'generic' } = req.body || {};
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    const otpRecord = await OtpToken.findOne({
      email: email.toLowerCase(),
      purpose: purpose || 'generic',
    });
    if (!otpRecord) {
      return res.status(404).json({ error: 'OTP not found. Please request a new one.' });
    }

    if (otpRecord.expiresAt < new Date()) {
      await OtpToken.deleteOne({ _id: otpRecord._id });
      return res.status(410).json({ error: 'OTP has expired. Please request a new one.' });
    }

    if (otpRecord.attempts >= 5) {
      return res.status(429).json({ error: 'Too many invalid attempts. Please request a new OTP.' });
    }

    const isValid = await bcrypt.compare(otp, otpRecord.otpHash);
    if (!isValid) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ error: 'Invalid OTP. Please try again.' });
    }

    otpRecord.verified = true;
    otpRecord.verifiedAt = new Date();
    otpRecord.attempts = 0;
    await otpRecord.save();

    return res.json({ success: true, message: 'OTP verified successfully.' });
  } catch (error) {
    console.error('Failed to verify OTP:', error);
    return res.status(500).json({ error: 'Failed to verify OTP. Please try again.' });
  }
});

router.post('/password-reset/confirm', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body || {};
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP, and new password are required' });
    }

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    const normalizedEmail = email.toLowerCase();
    const otpRecord = await OtpToken.findOne({
      email: normalizedEmail,
      purpose: 'password_reset',
    });

    if (!otpRecord) {
      return res.status(404).json({ error: 'Reset code not found. Please request a new one.' });
    }

    if (otpRecord.expiresAt < new Date()) {
      await OtpToken.deleteOne({ _id: otpRecord._id });
      return res.status(410).json({ error: 'Reset code has expired. Please request a new one.' });
    }

    if (otpRecord.attempts >= 5) {
      return res.status(429).json({ error: 'Too many invalid attempts. Please request a new code.' });
    }

    const isValid = await bcrypt.compare(otp, otpRecord.otpHash);
    if (!isValid) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ error: 'Invalid reset code. Please try again.' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      await OtpToken.deleteOne({ _id: otpRecord._id });
      return res.status(404).json({ error: 'Account not found.' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    await OtpToken.deleteOne({ _id: otpRecord._id });

    return res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Failed to reset password:', error);
    return res.status(500).json({ error: 'Failed to reset password. Please try again.' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, phone, role = 'user', address, city, state, postalCode } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const normalizedEmail = email.toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const otpRecord = await OtpToken.findOne({ email: normalizedEmail, purpose: 'registration' });
    if (!otpRecord || !otpRecord.verified) {
      return res.status(403).json({ error: 'Please verify the OTP sent to your email before registering.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: normalizedEmail,
      passwordHash,
      fullName,
      phone,
      role,
      address,
      city,
      state,
      postalCode,
      authProvider: 'local',
    });

    await OtpToken.deleteOne({ _id: otpRecord._id });

    const token = signToken(user);
    return res.json({
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        phone: user.phone,
        address: user.address,
        city: user.city,
      state: user.state,
        postalCode: user.postalCode,
      authProvider: user.authProvider,
      },
      token,
    });
  } catch (error) {
    console.error('Registration failed:', error);
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

const findOrCreateGoogleUser = async ({ email, name, picture, googleId }, role = 'user') => {
  if (!email) {
    throw new Error('Google profile is missing an email address.');
  }

  const normalizedEmail = email.toLowerCase();

  let user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    const tempPassword = crypto.randomBytes(32).toString('hex');
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    user = await User.create({
      email: normalizedEmail,
      passwordHash,
      fullName: name,
      phone: '',
      role,
      address: '',
      city: '',
      state: '',
      postalCode: '',
      googleId,
      avatarUrl: picture,
      authProvider: 'google',
    });
  } else {
    let shouldSave = false;

    if (googleId && !user.googleId) {
      user.googleId = googleId;
      shouldSave = true;
    }

    if (role === 'technician' && user.role !== 'technician') {
      user.role = 'technician';
      shouldSave = true;
    }

    if (!user.fullName && name) {
      user.fullName = name;
      shouldSave = true;
    }

    if (picture && picture !== user.avatarUrl) {
      user.avatarUrl = picture;
      shouldSave = true;
    }

    if (user.authProvider !== 'google') {
      user.authProvider = 'google';
      shouldSave = true;
    }

    if (shouldSave) {
      await user.save();
    }
  }

  return user;
};

const formatAuthResponse = (user, token, extras = {}) => ({
  user: {
    _id: user._id,
    email: user.email,
    role: user.role,
    fullName: user.fullName,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    address: user.address,
    city: user.city,
    state: user.state,
    postalCode: user.postalCode,
    authProvider: user.authProvider,
  },
  token,
  ...extras,
});

router.post('/google', async (req, res) => {
  try {
    const { code, mockProfile } = req.body || {};

    if ((!googleClientId || !googleClientSecret) && mockProfile) {
      try {
        const profile = {
          email: mockProfile.email,
          name: mockProfile.fullName || mockProfile.name || 'Google User',
          picture: mockProfile.picture,
          googleId: mockProfile.googleId || `mock-google-${Date.now()}`,
        };

        const user = await findOrCreateGoogleUser(profile);
        const token = signToken(user);
        return res.json(formatAuthResponse(user, token, { mocked: true }));
      } catch (mockError) {
        console.error('Mock Google sign-in failed:', mockError);
        return res.status(400).json({ error: mockError.message || 'Failed to simulate Google sign-in.' });
      }
    }

    if (!googleClientId || !googleClientSecret) {
      return res.status(503).json({ error: 'Google sign-in is not configured.' });
    }

    if (!code) {
      return res.status(400).json({ error: 'Missing Google authorization code.' });
    }

    const oauthClient = new OAuth2Client(googleClientId, googleClientSecret, 'postmessage');
    const { tokens } = await oauthClient.getToken(code);

    if (!tokens?.id_token) {
      return res.status(400).json({ error: 'Google did not return a valid ID token.' });
    }

    const ticket = await oauthClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: googleClientId,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload || {};

    if (!email) {
      return res.status(400).json({ error: 'Google account is missing a verified email address.' });
    }

    const user = await findOrCreateGoogleUser({ email, name, picture, googleId });

    const token = signToken(user);
    return res.json(formatAuthResponse(user, token));
  } catch (error) {
    console.error('Google authentication failed:', error);
    return res.status(500).json({ error: 'Failed to sign in with Google. Please try again.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  const user = await User.findOne({ email: email?.toLowerCase() });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = signToken(user);
  res.json({
    user: {
      _id: user._id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      phone: user.phone,
    },
    token,
  });
});

router.post('/logout', (req, res) => {
  res.json({ ok: true });
});

router.get('/me', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.sub);
  if (!user) return res.status(404).json({});
  res.json({
    user: {
      _id: user._id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      isActive: user.isActive,
      address: user.address,
      city: user.city,
      state: user.state,
      postalCode: user.postalCode,
      authProvider: user.authProvider,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
});

export default router;

