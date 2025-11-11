#!/usr/bin/env node
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve project root so models import correctly
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const loadModel = async () => {
  const module = await import(path.join(projectRoot, 'src', 'models', 'User.js'));
  return module.default;
};

const usage = () => {
  console.log('\nCreate or update an admin user\n');
  console.log('Usage:');
  console.log('  npm run create-admin -- <email> <password> [fullName]');
  console.log('\nExamples:');
  console.log('  npm run create-admin -- admin@example.com StrongPass123');
  console.log('  npm run create-admin -- admin@example.com StrongPass123 "Site Administrator"\n');
};

const run = async () => {
  const [, , email, password, fullNameArg] = process.argv;

  if (!email || !password) {
    usage();
    process.exitCode = 1;
    return;
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('MONGODB_URI is required in your environment to run this script.');
    process.exitCode = 1;
    return;
  }

  await mongoose.connect(mongoUri);
  const User = await loadModel();

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const fullName = fullNameArg || 'Admin User';

    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      user.passwordHash = passwordHash;
      user.role = 'admin';
      user.fullName = fullName;
      user.isActive = true;
      await user.save();
      console.log(`Updated existing user ${email} to admin role.`);
    } else {
      user = await User.create({
        email: email.toLowerCase(),
        passwordHash,
        fullName,
        role: 'admin',
        isActive: true,
      });
      console.log(`Created new admin user ${email}.`);
    }

    console.log('Admin setup complete.');
  } catch (error) {
    console.error('Failed to create admin user:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();

