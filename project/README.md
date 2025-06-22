# AI-Powered CRM System

A modern, intelligent Customer Relationship Management system with AI-powered analytics, Google OAuth authentication, and automated email marketing capabilities.

## 🚀 Features

- **🤖 AI-Powered Analytics**: Natural language queries to analyze customer data
- **🔐 Google OAuth Authentication**: Secure login with Google accounts
- **📊 Smart Campaign Management**: Create targeted marketing campaigns
- **📧 Automated Email Marketing**: Send bulk emails to filtered customer lists
- **📈 Customer Insights**: Track customer visits, spending, and activity
- **📋 Order Management**: Record and track customer orders
- **📊 Excel Export**: Export campaign results to Excel files
- **🎨 Modern UI**: Beautiful, responsive React interface

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MySQL** database
- **Passport.js** for Google OAuth
- **Nodemailer** for email functionality

### Frontend
- **React.js** with modern hooks
- **React Router** for navigation
- **Axios** for API calls
- **CSS3** with modern styling

### AI Service
- **Python Flask** server
- **OpenAI GPT-3.5** for natural language processing
- **Pandas** for data manipulation
- **OpenPyXL** for Excel file generation

## 📋 Prerequisites

Before running this application, ensure you have:

1. **Node.js** (v14 or higher)
2. **Python** (v3.8 or higher)
3. **MySQL** server running
4. **Google OAuth** credentials
5. **OpenAI API** key

## 🚀 Quick Setup

### 1. Clone and Install Dependencies

```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 2. Database Setup

```sql
-- Create the database
CREATE DATABASE crm_database;

-- The application will automatically create tables on first run
```

### 3. Environment Configuration

Create a `.env` file in the project root with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=crm_database

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Session Configuration
SESSION_SECRET=your_session_secret_key

# Client URL
CLIENT_URL=http://localhost:3000

# Email Configuration (for Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key
```

### 4. Get Required API Keys

#### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Set authorized redirect URI: `http://localhost:5000/auth/google/callback`
6. Copy Client ID and Client Secret to your `.env` file

#### OpenAI API Setup
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account and get your API key
3. Add the API key to your `.env` file

#### Gmail Setup (for email functionality)
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password
3. Use the App Password in your `.env` file

### 5. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 6. Start the Application

#### Development Mode (Recommended)
```bash
# Start both server and client
npm run dev
```

#### Production Mode
```bash
# Build the client
npm run build

# Start the server
npm start
```

#### Manual Start (if dev script doesn't work)
```bash
# Terminal 1: Start the Node.js server
npm start

# Terminal 2: Start the React client
cd client
npm start

# Terminal 3: Start the Python AI service
python ai_service.py
```

## 📱 Usage

### For Regular Users
1. Visit `http://localhost:3000`
2. Click "Continue with Google" to login
3. View your order history and customer profile
4. Add new orders with spending amounts

### For Admin Users
1. Login with the admin email (configured in server.js)
2. Access the admin dashboard
3. Use natural language queries like:
   - "Users who spend more than 5000"
   - "Customers inactive for 30 days"
   - "How many users visit more than 5 times"
4. Export results to Excel
5. Send targeted email campaigns

## 🔧 Troubleshooting

### Common Issues

#### 1. Database Connection Error
```
❌ Database connection failed: ER_ACCESS_DENIED_ERROR
```
**Solution**: Check your MySQL credentials in `.env` file and ensure MySQL is running.

#### 2. Google OAuth Error
```
❌ Missing required environment variables: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
```
**Solution**: Set up Google OAuth credentials and add them to `.env` file.

#### 3. Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**: Change the PORT in `.env` file or kill the process using the port.

#### 4. Python Service Not Starting
```
ModuleNotFoundError: No module named 'flask'
```
**Solution**: Install Python dependencies: `pip install -r requirements.txt`

#### 5. Client Build Error
```
npm ERR! missing script: build
```
**Solution**: Ensure you're in the client directory: `cd client && npm run build`

### Database Issues

If tables are not created automatically:

```sql
-- Run these manually in MySQL
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

## 📁 Project Structure

```
project/
├── server.js              # Main Node.js server
├── ai_service.py          # Python Flask AI service
├── package.json           # Node.js dependencies
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables
├── exports/               # Excel export directory
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── styles/        # CSS files
│   │   └── App.js         # Main React app
│   └── package.json       # Client dependencies
└── README.md              # This file
```

## 🔒 Security Features

- Google OAuth 2.0 authentication
- Session-based security
- Environment variable protection
- SQL injection prevention
- CORS configuration
- Secure cookie settings

## 🚀 Deployment

### Heroku Deployment
1. Create a Heroku app
2. Set environment variables in Heroku dashboard
3. Connect your GitHub repository
4. Deploy automatically

### VPS Deployment
1. Set up a VPS with Node.js, Python, and MySQL
2. Configure environment variables
3. Use PM2 for process management
4. Set up Nginx as reverse proxy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Ensure all prerequisites are installed
3. Verify environment variables are set correctly
4. Check console logs for error messages
5. Create an issue with detailed error information

## 🎯 Roadmap

- [ ] Add more AI analytics features
- [ ] Implement customer segmentation
- [ ] Add SMS marketing capabilities
- [ ] Create mobile app
- [ ] Add advanced reporting
- [ ] Implement multi-tenant architecture