import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { adminService } from '../services/admin.service.js';

async function runSeed() {
  console.log('🌱 Starting BIS Sahayak MongoDB Database Seed...');

  await connectDB();

  // Run full domain seeding (settings, standards, submissions, reports, licences, activity logs)
  await adminService.ensureMongoSeeded();

  // Ensure Admin User
  const adminEmail = 'admin@admin.com';
  let admin = await User.findOne({ email: adminEmail });
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);

  if (!admin) {
    admin = await User.create({
      email: adminEmail,
      password: adminPasswordHash,
      full_name: 'Dr. Rajesh Verma',
      company_name: 'Central Regulatory Directorate',
      role: 'admin',
      phone: '011-23230131',
      sector: 'Central Regulatory Directorate',
      enterprise_category: 'Statutory Standards Authority',
      gstin: '07AAAAA0000A1Z5',
      is_active: true,
      is_admin: true,
      status: 'active',
      provider: 'local'
    });
    console.log(`✅ Created official Admin account: ${adminEmail} (Password: Admin@123)`);
  } else {
    admin.password = adminPasswordHash;
    admin.is_admin = true;
    admin.role = 'admin';
    admin.status = 'active';
    await admin.save();
    console.log(`✅ Updated official Admin account: ${adminEmail} (Password: Admin@123)`);
  }

  // Ensure Demo User
  const demoEmail = 'demo.user@standards.local';
  let demoUser = await User.findOne({ email: demoEmail });
  if (!demoUser) {
    const demoPasswordHash = await bcrypt.hash('UserPass#2026', 10);
    demoUser = await User.create({
      email: demoEmail,
      password: demoPasswordHash,
      full_name: 'Anil Sharma',
      company_name: 'Bharat Cookware & Appliances Pvt. Ltd.',
      role: 'Manufacturer',
      phone: '+91 98765 43210',
      sector: 'Consumer Goods & Utensils',
      enterprise_category: 'MSME - Small Enterprise',
      gstin: '07AAACB2194D1Z5',
      is_active: true,
      is_admin: false,
      status: 'active',
      provider: 'local'
    });
    console.log(`✅ Created Demo Manufacturer account: ${demoEmail} (Password: UserPass#2026)`);
  }

  const totalUsers = await User.countDocuments();
  console.log(`✨ Seeding complete! Total users in MongoDB: ${totalUsers}`);
}

runSeed()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  });
