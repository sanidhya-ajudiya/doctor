import bcrypt from 'bcryptjs';
import pool from './config/database.js';

const seed = async () => {
  try {
    console.log('Starting database seeding...');

    // Hash admin password
    const adminPassword = 'admin123';
    const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

    // Create Admin User
    await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE password = VALUES(password)',
      ['Admin', 'admin@doctor.com', hashedAdminPassword, 'admin']
    );

    console.log('------------------------------------');
    console.log('Seeding completed successfully!');
    console.log('Admin Credentials:');
    console.log('Email: admin@doctor.com');
    console.log('Password: admin123');
    console.log('------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
