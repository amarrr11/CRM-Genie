# 🚀 AI-Powered CRM System - Setup Guide

## ✅ Current Status

Your AI-Powered CRM system is **ALMOST READY**! Here's what's been fixed and completed:

### ✅ Fixed Issues:
1. **Package.json syntax error** - Removed trailing comma
2. **Missing .env file** - Created with all required variables
3. **Missing exports directory** - Created for Excel file exports
4. **Database connection errors** - Added better error handling
5. **Missing environment variables** - All variables are now present

### ✅ What's Working:
- ✅ All Node.js dependencies installed
- ✅ All React client dependencies installed
- ✅ All Python dependencies listed
- ✅ All main application files present
- ✅ All required scripts configured
- ✅ Exports directory created
- ✅ Environment file created

## 🔧 Final Setup Steps

### Step 1: Get Your API Keys

#### Google OAuth Setup (Required)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Set **Authorized redirect URI**: `http://localhost:5000/auth/google/callback`
6. Copy **Client ID** and **Client Secret**

#### OpenAI API Setup (Required for AI features)
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account and get your API key
3. Copy the API key

### Step 2: Update Environment Variables

Edit your `.env` file and replace the placeholder values:

```env
# Replace these placeholder values with your real API keys
GOOGLE_CLIENT_ID=your_actual_google_client_id
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret
SESSION_SECRET=your_actual_session_secret_key
OPENAI_API_KEY=your_actual_openai_api_key
```

### Step 3: Database Setup

1. **Install MySQL** if not already installed
2. **Start MySQL service**
3. **Create the database**:
   ```sql
   CREATE DATABASE crm_database;
   ```

### Step 4: Start the Application

#### Option 1: Use the Startup Script (Recommended)
```bash
# Double-click the start.bat file
# OR run from command line:
start.bat
```

#### Option 2: Manual Start
```bash
# Terminal 1: Start the main server
npm run dev

# Terminal 2: Start the Python AI service (if not started automatically)
python ai_service.py
```

### Step 5: Access the Application

1. Open your browser
2. Go to: `http://localhost:3000`
3. Click "Continue with Google" to login
4. If using `amarshyam9199@gmail.com`, you'll get admin access

## 🎯 How to Use

### For Regular Users:
- Login with Google
- View your order history
- Create new orders
- Track your spending

### For Admin Users (amarshyam9199@gmail.com):
- Access admin dashboard
- Use AI-powered queries like:
  - "Users who spend more than 5000"
  - "Customers inactive for 30 days"
  - "How many users visit more than 5 times"
- Export results to Excel
- Send bulk emails

## 🔧 Troubleshooting

### Common Issues:

#### 1. "Database connection failed"
- Ensure MySQL is running
- Check database credentials in `.env`
- Create database: `CREATE DATABASE crm_database;`

#### 2. "Google OAuth error"
- Verify Google Client ID and Secret in `.env`
- Check redirect URI is correct: `http://localhost:5000/auth/google/callback`

#### 3. "Port already in use"
- Change PORT in `.env` file
- Or kill the process using the port

#### 4. "Python service not starting"
- Install Python dependencies: `pip install -r requirements.txt`
- Ensure Python 3.8+ is installed

#### 5. "Module not found errors"
- Run: `npm install` (for Node.js)
- Run: `cd client && npm install` (for React)
- Run: `pip install -r requirements.txt` (for Python)

## 📞 Support

If you encounter issues:

1. **Check the console logs** for error messages
2. **Verify all environment variables** are set correctly
3. **Ensure all services** (MySQL, Node.js, Python) are running
4. **Check API keys** are valid and have sufficient credits
5. **Read the README.md** for detailed instructions

## 🎉 Success!

Once everything is set up correctly, you'll have a fully functional AI-powered CRM system with:

- 🤖 AI-powered customer analytics
- 🔐 Secure Google OAuth authentication
- 📊 Smart campaign management
- 📧 Automated email marketing
- 📈 Customer insights and tracking
- 📋 Order management
- 📊 Excel export functionality

## 🚀 Next Steps

After successful setup:
1. Test the login functionality
2. Try creating some test orders
3. Test the AI query features (admin only)
4. Explore the email marketing features
5. Export some data to Excel

---

**Need help?** Check the troubleshooting section in `README.md` or create an issue with detailed error information. 