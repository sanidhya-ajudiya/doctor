import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authenticateToken, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

// Book appointment (user only)
router.post('/', authenticateToken, authorizeRoles('user'), [
  body('doctor_id').isInt().withMessage('Valid doctor ID is required'),
  body('date').isDate().withMessage('Valid date is required'),
  body('time').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time format required (HH:MM)'),
  body('reason').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { doctor_id, date, time, reason } = req.body;
    const user_id = req.user.id;

    // Check if doctor exists
    const [doctors] = await pool.query(
      'SELECT id, available_slots FROM doctors WHERE id = ?',
      [doctor_id]
    );

    if (doctors.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Check if slot is available
    const available_slots = typeof doctors[0].available_slots === 'string' 
      ? JSON.parse(doctors[0].available_slots) 
      : doctors[0].available_slots;

    // If slots are defined, they must match. If not defined, allow booking by default (open schedule)
    if (available_slots && available_slots.length > 0) {
      const isSlotAvailable = available_slots.some(slot => 
        slot.date === date && slot.times.includes(time)
      );

      if (!isSlotAvailable) {
        return res.status(400).json({ error: 'Selected time slot is not available for this doctor' });
      }
    }

    // Check for double booking
    const [existing] = await pool.query(
      'SELECT id FROM appointments WHERE doctor_id = ? AND date = ? AND time = ? AND status NOT IN ("rejected", "cancelled")',
      [doctor_id, date, time]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'This time slot is already booked' });
    }

    // Create appointment
    const [result] = await pool.query(
      'INSERT INTO appointments (user_id, doctor_id, date, time, reason) VALUES (?, ?, ?, ?, ?)',
      [user_id, doctor_id, date, time, reason || null]
    );

    // Get doctor user_id to notify them
    const [docUser] = await pool.query('SELECT user_id FROM doctors WHERE id = ?', [doctor_id]);
    if (docUser.length > 0) {
      await pool.query(
        'INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)',
        [docUser[0].user_id, `New appointment request from ${req.user.name} on ${date} at ${time}`, 'appointment_request']
      );
    }

    res.status(201).json({ message: 'Appointment booked successfully', appointmentId: result.insertId });
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({ error: 'Server error booking appointment' });
  }
});

// Get user appointments (user only)
router.get('/my-appointments', authenticateToken, authorizeRoles('user'), async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT a.*, d.name as doctor_name, d.specialization, d.fees 
      FROM appointments a 
      JOIN doctors d ON a.doctor_id = d.id 
      WHERE a.user_id = ?
    `;
    const params = [req.user.id];

    if (status) {
      const statusList = status.split(',');
      const placeholders = statusList.map(() => '?').join(',');
      query += ` AND a.status IN (${placeholders})`;
      params.push(...statusList);
    }

    query += ' ORDER BY a.date DESC, a.time DESC';

    const [appointments] = await pool.query(query, params);
    res.json(appointments);
  } catch (error) {
    console.error('Get user appointments error:', error);
    res.status(500).json({ error: 'Server error fetching appointments' });
  }
});

// Get doctor appointments (doctor only)
router.get('/doctor-appointments', authenticateToken, authorizeRoles('doctor'), async (req, res) => {
  try {
    // Get doctor ID from user ID
    const [doctors] = await pool.query(
      'SELECT id FROM doctors WHERE user_id = ?',
      [req.user.id]
    );

    if (doctors.length === 0) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    const doctor_id = doctors[0].id;
    const { status } = req.query;

    let query = `
      SELECT a.*, u.name as user_name, u.email as user_email, u.phone as user_phone 
      FROM appointments a 
      JOIN users u ON a.user_id = u.id 
      WHERE a.doctor_id = ?
    `;
    const params = [doctor_id];

    if (status) {
      const statusList = status.split(',');
      const placeholders = statusList.map(() => '?').join(',');
      query += ` AND a.status IN (${placeholders})`;
      params.push(...statusList);
    }

    query += ' ORDER BY a.date DESC, a.time DESC';

    const [appointments] = await pool.query(query, params);
    res.json(appointments);
  } catch (error) {
    console.error('Get doctor appointments error:', error);
    res.status(500).json({ error: 'Server error fetching appointments' });
  }
});

// Get all appointments (admin only)
router.get('/all', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const query = `
      SELECT a.*, u.name as user_name, d.name as doctor_name 
      FROM appointments a 
      JOIN users u ON a.user_id = u.id 
      JOIN doctors d ON a.doctor_id = d.id 
      ORDER BY a.date DESC, a.time DESC
    `;

    const [appointments] = await pool.query(query);
    res.json(appointments);
  } catch (error) {
    console.error('Get all appointments error:', error);
    res.status(500).json({ error: 'Server error fetching appointments' });
  }
});

// Update appointment status (doctor only)
router.put('/:id/status', authenticateToken, authorizeRoles('doctor'), [
  body('status').isIn(['accepted', 'rejected']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status } = req.body;
    const appointmentId = req.params.id;

    // Get doctor ID from user ID
    const [doctors] = await pool.query(
      'SELECT id FROM doctors WHERE user_id = ?',
      [req.user.id]
    );

    if (doctors.length === 0) {
      return res.status(404).json({ error: 'Doctor profile not found' });
    }

    const doctor_id = doctors[0].id;

    // Verify appointment belongs to this doctor
    const [appointments] = await pool.query(
      'SELECT id FROM appointments WHERE id = ? AND doctor_id = ?',
      [appointmentId, doctor_id]
    );

    if (appointments.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await pool.query(
      'UPDATE appointments SET status = ? WHERE id = ?',
      [status, appointmentId]
    );

    // Notify patient
    const [apptData] = await pool.query('SELECT user_id, date, time FROM appointments WHERE id = ?', [appointmentId]);
    if (apptData.length > 0) {
      await pool.query(
        'INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)',
        [apptData[0].user_id, `Your appointment on ${apptData[0].date} has been ${status}`, 'appointment_update']
      );
    }

    res.json({ message: `Appointment ${status} successfully` });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ error: 'Server error updating appointment' });
  }
});

// Cancel appointment (user only)
router.put('/:id/cancel', authenticateToken, authorizeRoles('user'), async (req, res) => {
  try {
    const appointmentId = req.params.id;

    // Verify appointment belongs to this user
    const [appointments] = await pool.query(
      'SELECT id, status FROM appointments WHERE id = ? AND user_id = ?',
      [appointmentId, req.user.id]
    );

    if (appointments.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const appointment = appointments[0];

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ error: 'Appointment is already cancelled' });
    }

    if (appointment.status === 'completed') {
      return res.status(400).json({ error: 'Cannot cancel completed appointment' });
    }

    await pool.query(
      'UPDATE appointments SET status = ? WHERE id = ?',
      ['cancelled', appointmentId]
    );

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ error: 'Server error cancelling appointment' });
  }
});

// Mock Payment (User only)
router.post('/:id/pay', authenticateToken, authorizeRoles('user'), async (req, res) => {
  try {
    const appointmentId = req.params.id;
    const transaction_id = 'TXN_' + Math.random().toString(36).substr(2, 9).toUpperCase();

    // Verify ownership
    const [appointments] = await pool.query(
      'SELECT id FROM appointments WHERE id = ? AND user_id = ?',
      [appointmentId, req.user.id]
    );

    if (appointments.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await pool.query(
      'UPDATE appointments SET payment_status = "paid", transaction_id = ? WHERE id = ?',
      [transaction_id, appointmentId]
    );

    res.json({ message: 'Payment successful', transactionId: transaction_id });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: 'Server error processing payment' });
  }
});

export default router;
