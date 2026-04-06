const router = require('express').Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

router.post('/register', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty(),
  body('role').optional().isIn(['viewer','analyst','admin'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, password, role } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const stmt = db.prepare(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
    );
    const result = stmt.run(name, email, hash, role || 'viewer');
    res.status(201).json({ id: result.lastInsertRowid, name, email, role: role || 'viewer' });
  } catch (e) {
    if (e.message.includes('UNIQUE')) return res.status(400).json({ error: 'Email already exists' });
    res.status(500).json({ error: e.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = db.prepare('SELECT * FROM users WHERE email=? AND is_active=1').get(email);
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, role: user.role, name: user.name });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
