import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { config } from '../config/env.js';

const createAdmin = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('[CreateAdmin] Connected to MongoDB.');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@cinereserve.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
    const adminName = process.env.ADMIN_NAME || 'CineReserve System Administrator';

    let admin = await User.findOne({ email: adminEmail });
    if (admin) {
      console.log(`[CreateAdmin] Admin account with email "${adminEmail}" already exists. Ensuring admin role...`);
      admin.role = 'admin';
      await admin.save();
      console.log(`[CreateAdmin] Admin privileges verified for ${adminEmail}.`);
    } else {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(adminPassword, salt);

      admin = await User.create({
        name: adminName,
        email: adminEmail,
        passwordHash,
        phone: '+91 9876543210',
        role: 'admin'
      });
      console.log(`[CreateAdmin] Success! Created new administrator: ${admin.email}`);
    }

    await mongoose.disconnect();
    console.log('[CreateAdmin] Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('[CreateAdmin Error]', error.message);
    process.exit(1);
  }
};

createAdmin();
