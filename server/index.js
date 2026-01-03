const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const textGenerator = require('./textGenerator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'typing_speed',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize database tables
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'superadmin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Add role column if it doesn't exist (for existing databases)
    try {
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS role ENUM('user', 'superadmin') DEFAULT 'user'
      `);
    } catch (error) {
      // Column might already exist, ignore error
    }

    // Create typing_results table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS typing_results (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        wpm INT NOT NULL,
        accuracy DECIMAL(5,2) NOT NULL,
        raw_wpm INT NOT NULL,
        characters INT NOT NULL,
        errors INT NOT NULL,
        test_type VARCHAR(50) NOT NULL,
        test_duration INT NOT NULL,
        consistency DECIMAL(5,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    connection.release();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// Routes

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const connection = await pool.getConnection();
    
    // Check if user exists
    const [existingUsers] = await connection.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      connection.release();
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user (default role is 'user')
    const [result] = await connection.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, 'user']
    );

    // Get the created user with role
    const [newUsers] = await connection.query(
      'SELECT id, username, email, role FROM users WHERE id = ?',
      [result.insertId]
    );
    const newUser = newUsers[0];

    connection.release();

    // Generate token
    const token = jwt.sign(
      { id: newUser.id, username, email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: newUser.id, username, email, role: newUser.role }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const connection = await pool.getConnection();
    
    const [users] = await connection.query(
      'SELECT id, username, email, password, role FROM users WHERE username = ? OR email = ?',
      [username, username]
    );

    connection.release();

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Ensure role exists (default to 'user' if NULL or missing)
    const userRole = user.role || 'user';

    // Generate token with role
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: userRole },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, email: user.email, role: userRole }
    });
  } catch (error) {
    console.error('Login error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ 
      error: 'Server error during login',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Save typing result
app.post('/api/results', authenticateToken, async (req, res) => {
  try {
    const { wpm, accuracy, rawWpm, characters, errors, testType, testDuration, consistency } = req.body;

    if (!wpm || accuracy === undefined || !rawWpm || !characters || errors === undefined || !testType || !testDuration) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const connection = await pool.getConnection();
    
    const [result] = await connection.query(
      `INSERT INTO typing_results 
       (user_id, wpm, accuracy, raw_wpm, characters, errors, test_type, test_duration, consistency) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, wpm, accuracy, rawWpm, characters, errors, testType, testDuration, consistency || null]
    );

    connection.release();

    res.status(201).json({
      message: 'Result saved successfully',
      resultId: result.insertId
    });
  } catch (error) {
    console.error('Save result error:', error);
    res.status(500).json({ error: 'Server error saving result' });
  }
});

// Get user's typing results
app.get('/api/results', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [results] = await connection.query(
      `SELECT * FROM typing_results 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [req.user.id]
    );

    connection.release();

    res.json(results);
  } catch (error) {
    console.error('Get results error:', error);
    res.status(500).json({ error: 'Server error fetching results' });
  }
});

// Get public leaderboard (user rankings by best WPM) - only for logged-in users
app.get('/api/leaderboard', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [rankings] = await connection.query(
      `SELECT 
        u.id,
        u.username,
        u.created_at as user_created_at,
        MAX(tr.wpm) as best_wpm,
        ROUND(AVG(tr.wpm), 2) as average_wpm,
        COUNT(tr.id) as total_tests
      FROM users u
      INNER JOIN typing_results tr ON u.id = tr.user_id
      WHERE (u.role = 'user' OR u.role IS NULL)
      GROUP BY u.id, u.username, u.created_at
      ORDER BY MAX(tr.wpm) DESC, AVG(tr.wpm) DESC
      LIMIT 100`
    );

    console.log('Leaderboard query returned', rankings.length, 'users');
    connection.release();

    res.json(rankings);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ error: 'Server error fetching leaderboard', details: error.message });
  }
});

// Admin routes - require superadmin role
const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ error: 'Access denied. Super admin required.' });
  }
  next();
};

// Get all users (admin only)
app.get('/api/admin/users', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [users] = await connection.query(
      'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC'
    );

    connection.release();
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error fetching users' });
  }
});

// Get all results (admin only)
app.get('/api/admin/results', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    const [results] = await connection.query(`
      SELECT tr.*, u.username 
      FROM typing_results tr
      LEFT JOIN users u ON tr.user_id = u.id
      ORDER BY tr.created_at DESC
      LIMIT 100
    `);

    connection.release();
    res.json(results);
  } catch (error) {
    console.error('Get all results error:', error);
    res.status(500).json({ error: 'Server error fetching results' });
  }
});

// Create user (admin only)
app.post('/api/admin/users', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    const userRole = role || 'user'; // Default to 'user' if not specified

    if (userRole !== 'user' && userRole !== 'superadmin') {
      return res.status(400).json({ error: 'Invalid role. Must be "user" or "superadmin"' });
    }

    const connection = await pool.getConnection();
    
    // Check if user exists
    const [existingUsers] = await connection.query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      connection.release();
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await connection.query(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, userRole]
    );

    // Get the created user
    const [newUsers] = await connection.query(
      'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
      [result.insertId]
    );
    const newUser = newUsers[0];

    connection.release();

    res.status(201).json({
      message: 'User created successfully',
      user: newUser
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Server error creating user' });
  }
});

// Delete user (admin only)
app.delete('/api/admin/users/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    if (!userId) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const connection = await pool.getConnection();
    
    // Check if user exists and is not superadmin
    const [users] = await connection.query(
      'SELECT role FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'User not found' });
    }

    if (users[0].role === 'superadmin') {
      connection.release();
      return res.status(403).json({ error: 'Cannot delete superadmin' });
    }

    await connection.query('DELETE FROM users WHERE id = ?', [userId]);
    connection.release();

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Server error deleting user' });
  }
});

// Get random text
app.get('/api/text', async (req, res) => {
  try {
    const { type = 'words', length = 50 } = req.query;
    
    const textLength = parseInt(length) || 50;
    const textType = type || 'words';
    
    if (!textGenerator || typeof textGenerator.generateText !== 'function') {
      throw new Error('Text generator not available');
    }
    
    const text = textGenerator.generateText(textType, textLength);

    if (!text || text.length === 0) {
      throw new Error('Generated text is empty');
    }

    res.json({ text });
  } catch (error) {
    console.error('Get text error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Server error generating text',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Initialize database and start server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

