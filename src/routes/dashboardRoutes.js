const router = require('express').Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.get('/summary', auth(['viewer','analyst','admin']), (req, res) => {
  const totals = db.prepare(
    'SELECT type, SUM(amount) as total FROM records WHERE is_deleted=0 GROUP BY type'
  ).all();
  const income = totals.find((r) => r.type==='income')?.total || 0;
  const expense = totals.find((r) => r.type==='expense')?.total || 0;

  const categories = db.prepare(
    'SELECT category, type, SUM(amount) as total FROM records WHERE is_deleted=0 GROUP BY category, type'
  ).all();

  const recent = db.prepare(
    'SELECT * FROM records WHERE is_deleted=0 ORDER BY created_at DESC LIMIT 5'
  ).all();

  const trends = db.prepare(
    `SELECT strftime('%Y-%m', date) as month, type, SUM(amount) as total
     FROM records WHERE is_deleted=0 GROUP BY month, type ORDER BY month DESC LIMIT 12`
  ).all();

  res.json({
    total_income: income,
    total_expense: expense,
    net_balance: income - expense,
    category_breakdown: categories,
    recent_transactions: recent,
    monthly_trends: trends
  });
});

module.exports = router;
