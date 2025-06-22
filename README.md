# AI-Powered CRM System

A modern, intelligent Customer Relationship Management (CRM) system that leverages AI for analytics, Google OAuth for secure login, and automated email marketing. Built for businesses to manage customers, run campaigns, and gain insights with ease.

---

## 🧐 What is this Project?
This is a full-stack CRM platform where you can:
- Manage customers and orders
- Run targeted marketing campaigns
- Analyze customer data using natural language (AI)
- Export results to Excel
- Automate email marketing
- Securely login with Google

### **Who is it for?**
- Small/medium businesses
- Marketers
- Admins who want smart, easy customer management

---

## ❓ What Problem Does it Solve?
- **Manual data analysis** is slow—here, you ask questions in plain English ("Show all users who spent more than 5000") and get instant results.
- **Campaign management** is often scattered—this system centralizes campaigns, customer data, and communication.
- **Exporting and reporting** is one-click (Excel download).
- **Security** is built-in (Google OAuth, session management).

---

## 🛠️ Tech Stack
- **Backend:** Node.js (Express), MySQL, Passport.js (Google OAuth), Nodemailer
- **Frontend:** React.js, React Router, Axios, CSS3
- **AI Service:** Python (Flask), Google Gemini API (or OpenAI), Pandas, OpenPyXL

---

## 🚀 Features
- 🤖 **AI Analytics:** Ask questions in natural language, get SQL-powered answers
- 🔐 **Google OAuth:** Secure login for users/admins
- 📊 **Campaign Management:** Create, filter, and export campaign results
- 📧 **Bulk Email:** Send emails to filtered customer lists
- 📈 **Customer Insights:** Track visits, spending, activity
- 📋 **Order Management:** Add/view orders
- 📤 **Excel Export:** Download results as Excel files
- 🎨 **Modern UI:** Responsive, easy-to-use React interface

---

## ⚡ Quick Start Guide

### 1. **Clone & Install**
```bash
npm install           # Backend
cd client && npm install  # Frontend
cd ..
```

### 2. **Database Setup**
- Create a MySQL database (e.g., `crm`)
- Tables auto-create on first run, or use the SQL in this README

### 3. **Environment Variables**
Create a `.env` file in the root:
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=crm
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
SESSION_SECRET=your_session_secret
CLIENT_URL=http://localhost:3000
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
GEMINI_API_KEY=your_gemini_api_key
```

### 4. **Python Dependencies**
```bash
pip install -r requirements.txt
```

### 5. **Start Everything**
- **Backend:** `npm start`
- **Frontend:** `cd client && npm start`
- **AI Service:** `python ai_service.py`

Or use `npm run dev` if set up for concurrent start.

---

## 🖥️ Usage
- **Login:** Go to `http://localhost:3000` and login with Google
- **Regular User:** View your profile, order history, add orders
- **Admin:**
  - Access dashboard
  - Ask AI questions ("Show all users with 2 visits")
  - Export results to Excel
  - Send email campaigns

---

## 🧠 Example AI Queries
- "How many users have more than 2 visits?"
- "List all customers who spent over 5000"
- "Show inactive users in last 30 days"
- "Export all users with total spend > 10000"

---

## 🏗️ Project Structure
```
crm1/
├── server.js           # Node.js backend
├── ai_service.py       # Python AI service
├── package.json        # Backend dependencies
├── requirements.txt    # Python dependencies
├── .env                # Environment variables
├── client/             # React frontend
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── styles/     # CSS
│   │   └── App.js      # Main app
│   └── package.json    # Frontend dependencies
└── README.md           # This file
```

---

## 🔒 Security
- Google OAuth 2.0 authentication
- Session-based security
- Environment variable protection
- SQL injection prevention
- CORS configuration
- Secure cookies

---

## 🛠️ Troubleshooting
- **Port in use:** Change `PORT` in `.env` or kill the process using it
- **DB errors:** Check MySQL is running and credentials are correct
- **Google OAuth errors:** Double-check client ID/secret and callback URL
- **Email errors:** Use Gmail app password, not your main password
- **Python errors:** Run `pip install -r requirements.txt`

---

## 🗄️ Database Schema (Manual SQL)
```sql
CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  visits INT DEFAULT 1,
  last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  total_spend DECIMAL(10, 2) DEFAULT 0.00,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT,
  spend DECIMAL(10, 2) NOT NULL,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE campaigns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_email VARCHAR(255) NOT NULL,
  query_text TEXT NOT NULL,
  result_count INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🚀 Deployment
- **Heroku:** Set env vars, connect repo, deploy
- **VPS:** Install Node.js, Python, MySQL; set env vars; use PM2 for backend; Nginx for proxy

---

## ❓ FAQ
**Q: Is my data safe?**  
A: Yes, all sensitive info is in `.env` and never committed. Google OAuth and SQL injection protection are enabled.

**Q: Can I use another AI model?**  
A: Yes, swap the Gemini API key or adjust the Python service for OpenAI.

**Q: How do I reset the database?**  
A: Drop and recreate tables in MySQL, or use a setup script if provided.

**Q: How do I add more features?**  
A: Fork the repo, add your code, and submit a pull request!

---

## 📄 License
MIT License

---

## 👨‍💻 Maintainer
- amarshyam9199@gmail.com

---
