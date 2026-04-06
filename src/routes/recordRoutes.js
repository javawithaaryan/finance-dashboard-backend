const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const validate = [
  body('amount').isNumeric(),
  body('type').isIn(['income', 'expense']),
  body('category').notEmpty(),
  body('date').isDate()
];

// All roles can view
router.get('/', auth(['viewer', 'analyst', 'admin']), async (req, res) => {
  const { type, category, from, to, page = 1, limit = 10 } = req.query;
  const conditions = ['is_deleted = false'];
  const params = [];
  let i = 1;

  if (type) { conditions.push(`type = $${i++}`); params.push(type); }
  if (category) { conditions.push(`category ILIKE $${i++}`); params.push(`%${category}%`); }
  if (from) { conditions.push(`date >= $${i++}`); params.push(from); }
  if (to) { conditions.push(`date <= $${i++}`); params.push(to); }

  const offset = (page - 1) * limit;
  params.push(limit, offset);

  const query = `SELECT * FROM records WHERE ${conditions.join(' AND ')} ORDER BY date DESC LIMIT $${i++} OFFSET $${i}`;
  const result = await pool.query(query, params);
  res.json(result.rows);
});

// Admin only: create
router.post('/', auth(['admin']), validate, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { amount, type, category, date, notes } = req.body;
  const result = await pool.query(
    'INSERT INTO records (amount, type, category, date, notes, created_by) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
    [amount, type, category, date, notes, req.user.id]
  );
  res.status(201).json(result.rows[0]);
});

// Admin only: update
router.put('/:id', auth(['admin']), async (req, res) => {
  const { amount, type, category, date, notes } = req.body;
  const result = await pool.query(
    'UPDATE records SET amount=$1, type=$2, category=$3, date=$4, notes=$5 WHERE id=$6 AND is_deleted=false RETURNING *',
    [amount, type, category, date, notes, req.params.id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Record not found' });
  res.json(result.rows[0]);
});

// Admin only: soft delete
router.delete('/:id', auth(['admin']), async (req, res) => {
  await pool.query('UPDATE records SET is_deleted=true WHERE id=$1', [req.params.id]);
  res.json({ message: 'Record deleted' });
});

module.exports = router;
