const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Auth middleware
function isAuthenticated(req, res, next) {
  if (req.session.userId) return next();
  res.redirect('/login');
}

// Routes
app.get('/', (req, res) => {
  res.redirect('/dashboard');
});

// Signup
app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    req.session.userId = result.insertId;
    res.redirect('/dashboard');
  } catch (err) {
    res.send('Error: ' + err.message);
  }
});

// Login
app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await pool.query('SELECT * FROM users WHERE email=?', [email]);
  if (rows.length > 0) {
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      req.session.userId = user.id;
      return res.redirect('/dashboard');
    }
  }
  res.send('Invalid email or password');
});

// Dashboard
app.get('/dashboard', isAuthenticated, async (req, res) => {
  const [userRows] = await pool.query('SELECT * FROM users WHERE id=?', [req.session.userId]);
  const [referrals] = await pool.query('SELECT * FROM referrals WHERE user_id=?', [req.session.userId]);
  res.render('dashboard', { user: userRows[0], referrals });
});

// Post referral
app.post('/referral', isAuthenticated, async (req, res) => {
  const { title, company, description } = req.body;
  await pool.query(
    'INSERT INTO referrals (user_id, title, company, description) VALUES (?, ?, ?, ?)',
    [req.session.userId, title, company, description]
  );
  res.redirect('/dashboard');
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});