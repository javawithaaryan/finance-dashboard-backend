const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth(['admin']), (req, res) => {
  const users = db.prepare('SELECT id, name, email, role, is_active, created_at FROM users').all();
  res.json(users);
});

router.patch('/:id/role', auth(['admin']), (req, res) => {
  const { role } = req.body;
  if (!['viewer','analyst','admin'].includes(role))
    return res.status(400).json({ error: 'Invalid role' });
  const result = db.prepare('UPDATE users SET role=? WHERE id=?').run(role, req.params.id);
  if (!result.changes) return res.status(404).json({ error: 'User not found' });
  res.json({ message: 'Role updated' });
});

router.patch('/:id/status', auth(['admin']), (req, res) => {
  const { is_active } = req.body;
  db.prepare('UPDATE users SET is_active=? WHERE id=?').run(is_active ? 1 : 0, req.params.id);
  res.json({ message: 'Status updated' });
});

module.exports = router;
