const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '/.env' });

const express = require('express');
const mysql = require('mysql2');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const cors = require('cors');
const path = require('path');

// Minimal environment variable check (no sensitive data)
console.log('🔍 Environment Variables Check:');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '✅ Loaded' : '❌ Not loaded');
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ Loaded' : '❌ Not loaded');
console.log('SESSION_SECRET:', process.env.SESSION_SECRET ? '✅ Loaded' : '❌ Not loaded');
console.log('');

const app = express();
const PORT = process.env.PORT || 5000;

// Check required environment variables
// const requiredEnvVars = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'SESSION_SECRET'];
// const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName] || process.env[varName].includes('your_'));

// if (missingEnvVars.length > 0) {
//   console.error('❌ Missing or placeholder environment variables:', missingEnvVars.join(', '));
//   console.error('Please check your .env file and ensure all required variables are set with real values.');
//   console.error('For testing, you can temporarily comment out this check.');
//   process.exit(1);
// }

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

app.use(passport.initialize());
app.use(passport.session());

// Database connection - Made optional for testing
let db = null;
let dbConnected = false;

function connectToDatabase() {
  db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'crm'
  });

  db.connect((err) => {
    if (err) {
      console.error('❌ Database connection failed:', err.message);
      console.error('⚠️  Running in TEST MODE without database');
      console.error('   Some features will be limited');
      dbConnected = false;
    } else {
      console.log('✅ Connected to MySQL database');
      dbConnected = true;
      initializeDatabase();
    }
  });
}

// Try to connect to database
connectToDatabase();

// Initialize database tables
function initializeDatabase() {
  const createCustomersTable = `
    CREATE TABLE IF NOT EXISTS customers (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      visits INT DEFAULT 1,
      last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      total_spend DECIMAL(10, 2) DEFAULT 0.00,
      is_admin BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const createOrdersTable = `
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customer_id INT,
      spend DECIMAL(10, 2) NOT NULL,
      order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
  `;

  const createCampaignsTable = `
    CREATE TABLE IF NOT EXISTS campaigns (
      id INT AUTO_INCREMENT PRIMARY KEY,
      admin_email VARCHAR(255) NOT NULL,
      query_text TEXT NOT NULL,
      result_count INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  db.query(createCustomersTable, (err) => {
    if (err) console.error('Error creating customers table:', err);
  });

  db.query(createOrdersTable, (err) => {
    if (err) console.error('Error creating orders table:', err);
  });

  db.query(createCampaignsTable, (err) => {
    if (err) console.error('Error creating campaigns table:', err);
  });
}

// Passport Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    const name = profile.displayName;
    const isAdmin = email === 'amarshyam9199@gmail.com';

    if (dbConnected) {
      // Check if user exists in database
      db.query('SELECT * FROM customers WHERE email = ?', [email], (err, results) => {
        if (err) return done(err);

        if (results.length > 0) {
          // Update visits and last_active
          db.query(
            'UPDATE customers SET visits = visits + 1, last_active = CURRENT_TIMESTAMP WHERE email = ?',
            [email],
            (err) => {
              if (err) console.error('Error updating user visits:', err);
            }
          );
          return done(null, results[0]);
        } else {
          // Create new user
          db.query(
            'INSERT INTO customers (name, email, is_admin) VALUES (?, ?, ?)',
            [name, email, isAdmin],
            (err, result) => {
              if (err) return done(err);
              
              const newUser = {
                id: result.insertId,
                name,
                email,
                visits: 1,
                total_spend: 0,
                is_admin: isAdmin
              };
              return done(null, newUser);
            }
          );
        }
      });
    } else {
      // Test mode - use in-memory storage
      const testUser = {
        id: email === 'amarshyam9199@gmail.com' ? 1 : 2,
        name,
        email,
        visits: 1,
        total_spend: 0,
        is_admin: isAdmin
      };
      return done(null, testUser);
    }
  } catch (error) {
    return done(error);
  }
}));

// Temporary test authentication for development (keeping as backup)
// passport.use(new (require('passport-local').Strategy)({
//   usernameField: 'email',
//   passwordField: 'password'
// }, async (email, password, done) => {
//   try {
//     // For testing, accept any email/password
//     const isAdmin = email === 'admin@test.com';
    
//     if (dbConnected) {
//       // Check if user exists in database
//       db.query('SELECT * FROM customers WHERE email = ?', [email], (err, results) => {
//         if (err) return done(err);

//         if (results.length > 0) {
//           // Update visits and last_active
//           db.query(
//             'UPDATE customers SET visits = visits + 1, last_active = CURRENT_TIMESTAMP WHERE email = ?',
//             [email],
//             (err) => {
//               if (err) console.error('Error updating user visits:', err);
//             }
//           );
//           return done(null, results[0]);
//         } else {
//           // Create new user
//           const name = email.split('@')[0]; // Use email prefix as name
//           db.query(
//             'INSERT INTO customers (name, email, is_admin) VALUES (?, ?, ?)',
//             [name, email, isAdmin],
//             (err, result) => {
//               if (err) return done(err);
              
//               const newUser = {
//                 id: result.insertId,
//                 name,
//                 email,
//                 visits: 1,
//                 total_spend: 0,
//                 is_admin: isAdmin
//               };
//               return done(null, newUser);
//             }
//           );
//         }
//       });
//     } else {
//       // Test mode - use in-memory storage
//       const name = email.split('@')[0];
//       const testUser = {
//         id: email === 'admin@test.com' ? 1 : 2,
//         name,
//         email,
//         visits: 1,
//         total_spend: 0,
//         is_admin: isAdmin
//       };
//       return done(null, testUser);
//     }
//   } catch (error) {
//     return done(error);
//   }
// }));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  db.query('SELECT * FROM customers WHERE id = ?', [id], (err, results) => {
    if (err) return done(err);
    done(null, results[0]);
  });
});

// Auth Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect(process.env.CLIENT_URL || 'http://localhost:3000');
  }
);

// Temporary test login route (keeping as backup)
// app.post('/auth/login', passport.authenticate('local'), (req, res) => {
//   res.json({ message: 'Login successful', user: req.user });
// });

// Test login page route (keeping as backup)
// app.get('/auth/test-login', (req, res) => {
//   res.send(`
//     <html>
//       <head><title>Test Login</title></head>
//       <body>
//         <h2>Test Login</h2>
//         <form action="/auth/login" method="post">
//           <p>Email: <input type="email" name="email" value="admin@test.com" /></p>
//           <p>Password: <input type="password" name="password" value="test123" /></p>
//           <p><input type="submit" value="Login" /></p>
//         </form>
//         <p><strong>Test Accounts:</strong></p>
//         <ul>
//           <li>Admin: admin@test.com / test123</li>
//           <li>User: user@test.com / test123</li>
//         </ul>
//       </body>
//     </html>
//   `);
// });

app.get('/auth/user', (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

app.post('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.json({ message: 'Logged out successfully' });
  });
});

// API Routes
app.post('/api/orders', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const { spend } = req.body;
  const customerId = req.user.id;

  if (!spend || spend <= 0) {
    return res.status(400).json({ error: 'Invalid spend amount' });
  }

  if (dbConnected) {
    // Insert order in database
    db.query(
      'INSERT INTO orders (customer_id, spend) VALUES (?, ?)',
      [customerId, spend],
      (err, result) => {
        if (err) {
          console.error('Error creating order:', err);
          return res.status(500).json({ error: 'Failed to create order' });
        }

        // Update total_spend in customers table
        db.query(
          'UPDATE customers SET total_spend = total_spend + ? WHERE id = ?',
          [spend, customerId],
          (err) => {
            if (err) {
              console.error('Error updating total spend:', err);
            }
          }
        );

        res.json({ message: 'Order created successfully', orderId: result.insertId });
      }
    );
  } else {
    // Test mode - simulate order creation
    res.json({ message: 'Order created successfully (test mode)', orderId: Date.now() });
  }
});

app.get('/api/orders', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (dbConnected) {
    db.query(
      'SELECT * FROM orders WHERE customer_id = ? ORDER BY order_date DESC',
      [req.user.id],
      (err, results) => {
        if (err) {
          console.error('Error fetching orders:', err);
          return res.status(500).json({ error: 'Failed to fetch orders' });
        }
        res.json(results);
      }
    );
  } else {
    // Test mode - return sample data
    res.json([
      {
        id: 1,
        customer_id: req.user.id,
        spend: 1500.00,
        order_date: new Date().toISOString()
      },
      {
        id: 2,
        customer_id: req.user.id,
        spend: 2500.00,
        order_date: new Date(Date.now() - 86400000).toISOString()
      }
    ]);
  }
});

// Admin routes
app.post('/api/admin/query', (req, res) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { query } = req.body;
  
  // Save campaign query
  db.query(
    'INSERT INTO campaigns (admin_email, query_text) VALUES (?, ?)',
    [req.user.email, query],
    (err, result) => {
      if (err) console.error('Error saving campaign:', err);
    }
  );

  // Call Python Flask service for AI query processing
  const axios = require('axios');
  axios.post('http://localhost:5002/process-query', {
    query: query,
    db_config: {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '1234',
      database: process.env.DB_NAME || 'crm'
    }
  })
  .then(response => {
    res.json(response.data);
  })
  .catch(error => {
    console.error('Error processing AI query:', error);
    
    // Extract detailed error information
    let errorMessage = 'Failed to process query';
    let errorDetails = '';
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      errorMessage = `AI Service Error: ${error.response.status}`;
      errorDetails = error.response.data?.error || error.response.data || 'No error details provided';
      console.error('AI Service Response:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = 'AI Service Connection Error';
      errorDetails = 'No response received from AI service. Is the Python service running on port 5002?';
      console.error('No response from AI service:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      errorMessage = 'Request Setup Error';
      errorDetails = error.message;
      console.error('Request setup error:', error.message);
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: errorDetails,
      timestamp: new Date().toISOString()
    });
  });
});

app.get('/api/admin/campaigns', (req, res) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  db.query(
    'SELECT * FROM campaigns WHERE admin_email = ? ORDER BY created_at DESC',
    [req.user.email],
    (err, results) => {
      if (err) {
        console.error('Error fetching campaigns:', err);
        return res.status(500).json({ error: 'Failed to fetch campaigns' });
      }
      res.json(results);
    }
  );
});

// Email sending route
app.post('/api/send-emails', (req, res) => {
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const { emails, subject, message } = req.body;
  
  if (!emails || !Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ error: 'Email list is required' });
  }

  const nodemailer = require('nodemailer');
  
  // Updated Gmail configuration with better security
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  // Verify transporter configuration
  transporter.verify(function(error, success) {
    if (error) {
      console.error('Email transporter verification failed:', error);
      return res.status(500).json({ 
        error: 'Email service configuration error',
        details: error.message 
      });
    }
    
    console.log('Email server is ready to send messages');
    
    // Send emails after verification
    const emailPromises = emails.map(email => {
      return transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email.trim(),
        subject: subject || 'CRM Campaign Email',
        text: message || 'Thank you for being our valued customer!'
      }).catch(error => {
        console.error(`Failed to send email to ${email}:`, error);
        return { error: true, email: email, message: error.message };
      });
    });

    Promise.all(emailPromises)
      .then((results) => {
        const successful = results.filter(r => !r.error).length;
        const failed = results.filter(r => r.error).length;
        
        if (failed === 0) {
          res.json({ 
            message: `Successfully sent emails to ${successful} recipients`,
            sent: successful,
            failed: failed
          });
        } else {
          res.json({ 
            message: `Sent ${successful} emails, ${failed} failed`,
            sent: successful,
            failed: failed,
            errors: results.filter(r => r.error)
          });
        }
      })
      .catch(error => {
        console.error('Error sending emails:', error);
        res.status(500).json({ 
          error: 'Failed to send emails',
          details: error.message 
        });
      });
  });
});

// Serve static files from React build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});