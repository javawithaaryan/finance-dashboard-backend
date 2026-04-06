const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/summary', auth(['viewer', 'analyst', 'admin']), async (req, res) => {
  const totals = await pool.query(`
    SELECT type, SUM(amount) as total FROM records WHERE is_deleted=false GROUP BY type
  `);
  const income = totals.rows.find((r) => r.type === 'income')?.total || 0;
  const expense = totals.rows.find((r) => r.type === 'expense')?.total || 0;

  const categories = await pool.query(`
    SELECT category, type, SUM(amount) as total FROM records WHERE is_deleted=false GROUP BY category, type ORDER BY total DESC
  `);

  const recent = await pool.query(`
    SELECT * FROM records WHERE is_deleted=false ORDER BY created_at DESC LIMIT 5
  `);

  const trends = await pool.query(`
    SELECT TO_CHAR(date, 'YYYY-MM') as month, type, SUM(amount) as total
    FROM records WHERE is_deleted=false
    GROUP BY month, type ORDER BY month DESC LIMIT 12
  `);

  res.json({
    total_income: parseFloat(income),
    total_expense: parseFloat(expense),
    net_balance: parseFloat(income) - parseFloat(expense),
    category_breakdown: categories.rows,
    recent_transactions: recent.rows,
    monthly_trends: trends.rows
  });
});

module.exports = router;
