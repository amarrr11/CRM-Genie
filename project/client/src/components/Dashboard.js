import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  const [orders, setOrders] = useState([]);
  const [newOrderAmount, setNewOrderAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!newOrderAmount || newOrderAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/orders', { spend: parseFloat(newOrderAmount) });
      setNewOrderAmount('');
      fetchOrders();
      alert('Order created successfully!');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Failed to create order');
    }
    setLoading(false);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="user-info">
            <h1>Welcome, {user.name}!</h1>
            <p>Customer Dashboard</p>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <h3>Total Spent</h3>
              <p className="stat-value">₹{user.total_spend || 0}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🔄</div>
            <div className="stat-info">
              <h3>Total Visits</h3>
              <p className="stat-value">{user.visits || 0}</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <h3>Total Orders</h3>
              <p className="stat-value">{orders.length}</p>
            </div>
          </div>
        </div>

        <div className="main-content">
          <div className="create-order-section">
            <h2>Create New Order</h2>
            <form onSubmit={handleCreateOrder} className="order-form">
              <div className="form-group">
                <label htmlFor="amount">Order Amount (₹)</label>
                <input
                  type="number"
                  id="amount"
                  value={newOrderAmount}
                  onChange={(e) => setNewOrderAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <button type="submit" disabled={loading} className="create-order-btn">
                {loading ? 'Creating...' : 'Create Order'}
              </button>
            </form>
          </div>

          <div className="orders-section">
            <h2>Your Orders</h2>
            {orders.length === 0 ? (
              <div className="empty-state">
                <p>No orders yet. Create your first order above!</p>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order.id} className="order-item">
                    <div className="order-info">
                      <div className="order-amount">₹{order.spend}</div>
                      <div className="order-date">
                        {new Date(order.order_date).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <div className="order-status">
                      <span className="status-badge">Completed</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;