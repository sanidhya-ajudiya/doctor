import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Create prescription (Doctor only)
router.post('/', authenticateToken, authorizeRoles('doctor'), [
  body('appointment_id').isInt().withMessage('Valid appointment ID is required'),
  body('user_id').isInt().withMessage('Valid user ID is required'),
  body('medicines').isArray().withMessage('Medicines must be an array'),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { appointment_id, user_id, medicines, notes } = req.body;

    // Get doctor ID from user ID
    const [doctors] = await pool.query(
      'SELECT id FROM doctors WHERE user_id = ?',
      [req.user.id]
    );

    if (doctors.length === 0) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    const doctor_id = doctors[0].id;

    // Verify appointment belongs to this doctor and user
    const [appointments] = await pool.query(
      'SELECT id FROM appointments WHERE id = ? AND doctor_id = ? AND user_id = ?',
      [appointment_id, doctor_id, user_id]
    );

    if (appointments.length === 0) {
      return res.status(403).json({ error: 'Access denied: Appointment mismatch' });
    }

    // Insert prescription
    await pool.query(
      'INSERT INTO prescriptions (appointment_id, doctor_id, user_id, medicines, notes) VALUES (?, ?, ?, ?, ?)',
      [appointment_id, doctor_id, user_id, JSON.stringify(medicines), notes || null]
    );

    // Mark appointment as 'completed'
    await pool.query(
      'UPDATE appointments SET status = "completed" WHERE id = ?',
      [appointment_id]
    );

    res.status(201).json({ message: 'Prescription created and appointment completed' });
  } catch (error) {
    console.error('Create prescription error:', error);
    res.status(500).json({ error: 'Server error creating prescription' });
  }
});

// Get my prescriptions (Patient)
router.get('/my', authenticateToken, authorizeRoles('user'), async (req, res) => {
  try {
    const [prescriptions] = await pool.query(`
      SELECT p.*, d.name as doctor_name 
      FROM prescriptions p 
      JOIN doctors d ON p.doctor_id = d.id 
      WHERE p.user_id = ? 
      ORDER BY p.created_at DESC
    `, [req.user.id]);

    const formatted = prescriptions.map(p => ({
      ...p,
      medicines: typeof p.medicines === 'string' ? JSON.parse(p.medicines) : p.medicines
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Get prescriptions error:', error);
    res.status(500).json({ error: 'Server error fetching prescriptions' });
  }
});

// Get all prescriptions (Admin only)
router.get('/all', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const [prescriptions] = await pool.query(`
      SELECT p.*, d.name as doctor_name, u.name as user_name 
      FROM prescriptions p 
      JOIN doctors d ON p.doctor_id = d.id 
      JOIN users u ON p.user_id = u.id 
      ORDER BY p.created_at DESC
    `);

    const formatted = prescriptions.map(p => ({
      ...p,
      medicines: typeof p.medicines === 'string' ? JSON.parse(p.medicines) : p.medicines
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Get all prescriptions error:', error);
    res.status(500).json({ error: 'Server error fetching prescriptions' });
  }
});

export default router;
