const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Admin only
router.get('/', auth(['admin']), async (req, res) => {
  const result = await pool.query('SELECT id, name, email, role, is_active, created_at FROM users');
  res.json(result.rows);
});

router.patch('/:id/role', auth(['admin']), async (req, res) => {
  const { role } = req.body;
  if (!['viewer', 'analyst', 'admin'].includes(role))
    return res.status(400).json({ error: 'Invalid role' });
  const result = await pool.query(
    'UPDATE users SET role=$1 WHERE id=$2 RETURNING id, name, email, role',
    [role, req.params.id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'User not found' });
  res.json(result.rows[0]);
});

router.patch('/:id/status', auth(['admin']), async (req, res) => {
  const { is_active } = req.body;
  const result = await pool.query(
    'UPDATE users SET is_active=$1 WHERE id=$2 RETURNING id, name, is_active',
    [is_active, req.params.id]
  );
  res.json(result.rows[0]);
});

module.exports = router;
