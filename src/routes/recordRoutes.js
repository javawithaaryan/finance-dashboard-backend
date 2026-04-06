const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

router.get('/', auth(['viewer','analyst','admin']), (req, res) => {
  const { type, category, from, to, page = 1, limit = 10 } = req.query;
  let query = 'SELECT * FROM records WHERE is_deleted=0';
  const params = [];

  if (type) { query += ' AND type=?'; params.push(type); }
  if (category) { query += ' AND category LIKE ?'; params.push(`%${category}%`); }
  if (from) { query += ' AND date>=?'; params.push(from); }
  if (to) { query += ' AND date<=?'; params.push(to); }

  query += ' ORDER BY date DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), (parseInt(page)-1)*parseInt(limit));

  res.json(db.prepare(query).all(...params));
});

router.post('/', auth(['admin']), [
  body('amount').isNumeric(),
  body('type').isIn(['income','expense']),
  body('category').notEmpty(),
  body('date').notEmpty()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { amount, type, category, date, notes } = req.body;
  const result = db.prepare(
    'INSERT INTO records (amount, type, category, date, notes, created_by) VALUES (?,?,?,?,?,?)'
  ).run(amount, type, category, date, notes, req.user.id);
  res.status(201).json({ id: result.lastInsertRowid, amount, type, category, date, notes });
});

router.put('/:id', auth(['admin']), (req, res) => {
  const { amount, type, category, date, notes } = req.body;
  const result = db.prepare(
    'UPDATE records SET amount=?, type=?, category=?, date=?, notes=? WHERE id=? AND is_deleted=0'
  ).run(amount, type, category, date, notes, req.params.id);
  if (!result.changes) return res.status(404).json({ error: 'Record not found' });
  res.json({ message: 'Record updated' });
});

router.delete('/:id', auth(['admin']), (req, res) => {
  db.prepare('UPDATE records SET is_deleted=1 WHERE id=?').run(req.params.id);
  res.json({ message: 'Record deleted' });
});

module.exports = router;
