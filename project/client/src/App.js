import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

axios.defaults.withCredentials = true;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/auth/user');
      setUser(response.data);
    } catch (error) {
      console.log('Not authenticated');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await axios.post('/auth/logout');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Handle OAuth redirects
  useEffect(() => {
    const handleOAuthRedirect = () => {
      if (window.location.pathname.startsWith('/auth/')) {
        window.location.href = `http://localhost:5000${window.location.pathname}${window.location.search}`;
      }
    };
    
    handleOAuthRedirect();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={user ? <Navigate to="/" /> : <Login />} 
          />
          <Route 
            path="/" 
            element={
              user ? (
                user.is_admin ? (
                  <AdminDashboard user={user} onLogout={handleLogout} />
                ) : (
                  <Dashboard user={user} onLogout={handleLogout} />
                )
              ) : (
                <Navigate to="/login" />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;