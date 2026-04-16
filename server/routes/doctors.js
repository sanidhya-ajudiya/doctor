import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Get all doctors (public)
router.get('/', async (req, res) => {
  try {
    const { specialization, search } = req.query;
    let query = `
      SELECT d.*, 
             COALESCE(AVG(r.rating), 0) as average_rating, 
             COUNT(r.id) as review_count 
      FROM doctors d 
      LEFT JOIN reviews r ON d.id = r.doctor_id 
      WHERE 1=1
    `;
    const params = [];

    if (specialization) {
      query += ' AND d.specialization LIKE ?';
      params.push(`%${specialization}%`);
    }

    if (search) {
      query += ' AND (d.name LIKE ? OR d.specialization LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ' GROUP BY d.id';

    const [doctors] = await pool.query(query, params);

    // Format available_slots if it's a string
    const formattedDoctors = doctors.map(doctor => ({
      ...doctor,
      available_slots: typeof doctor.available_slots === 'string' 
        ? JSON.parse(doctor.available_slots) 
        : doctor.available_slots
    }));

    res.json(formattedDoctors);
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ error: 'Server error fetching doctors' });
  }
});

// Get single doctor by ID
router.get('/:id', async (req, res) => {
  try {
    const [doctors] = await pool.query(
      'SELECT * FROM doctors WHERE id = ?',
      [req.params.id]
    );

    if (doctors.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const doctor = doctors[0];
    doctor.available_slots = typeof doctor.available_slots === 'string' 
      ? JSON.parse(doctor.available_slots) 
      : doctor.available_slots;

    res.json(doctor);
  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({ error: 'Server error fetching doctor' });
  }
});

// Update doctor profile (doctor only)
router.put('/:id', authenticateToken, authorizeRoles('doctor', 'admin'), [
  body('name').optional().trim().notEmpty(),
  body('specialization').optional().trim().notEmpty(),
  body('experience').optional().isInt({ min: 0 }),
  body('fees').optional().isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, specialization, experience, fees, about, education, available_slots } = req.body;
    const doctorId = req.params.id;

    // If doctor is updating their own profile, verify ownership
    if (req.user.role === 'doctor') {
      const [doctors] = await pool.query(
        'SELECT user_id FROM doctors WHERE id = ?',
        [doctorId]
      );
      if (doctors.length === 0 || doctors[0].user_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const updates = [];
    const values = [];

    if (name) { updates.push('name = ?'); values.push(name); }
    if (specialization) { updates.push('specialization = ?'); values.push(specialization); }
    if (experience !== undefined) { updates.push('experience = ?'); values.push(experience); }
    if (fees !== undefined) { updates.push('fees = ?'); values.push(fees); }
    if (about !== undefined) { updates.push('about = ?'); values.push(about); }
    if (education !== undefined) { updates.push('education = ?'); values.push(education); }
    if (available_slots !== undefined) { 
      updates.push('available_slots = ?'); 
      values.push(JSON.stringify(available_slots)); 
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(doctorId);

    await pool.query(
      `UPDATE doctors SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.json({ message: 'Doctor profile updated successfully' });
  } catch (error) {
    console.error('Update doctor error:', error);
    res.status(500).json({ error: 'Server error updating doctor' });
  }
});

// Add new doctor (admin only)
router.post('/', authenticateToken, authorizeRoles('admin'), [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('specialization').trim().notEmpty().withMessage('Specialization is required'),
  body('experience').isInt({ min: 0 }).withMessage('Experience must be a positive number'),
  body('fees').isFloat({ min: 0 }).withMessage('Fees must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, specialization, experience, fees, about, education, available_slots, email, password } = req.body;

    // Create user account for doctor
    const hashedPassword = await bcrypt.hash(password || 'doctor123', 10);
    const [userResult] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'doctor']
    );

    // Create doctor profile
    const [doctorResult] = await pool.query(
      'INSERT INTO doctors (user_id, name, specialization, experience, fees, available_slots, about, education) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userResult.insertId, name, specialization, experience, fees, JSON.stringify(available_slots || []), about || null, education || null]
    );

    res.status(201).json({ 
      message: 'Doctor added successfully', 
      doctorId: doctorResult.insertId,
      userId: userResult.insertId 
    });
  } catch (error) {
    console.error('Add doctor error:', error);
    res.status(500).json({ error: 'Server error adding doctor' });
  }
});

// Delete doctor (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM doctors WHERE id = ?', [req.params.id]);
    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Delete doctor error:', error);
    res.status(500).json({ error: 'Server error deleting doctor' });
  }
});

export default router;
