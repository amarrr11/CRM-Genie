import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
  const [orders, setOrders] = useState([]);
  const [newOrderAmount, setNewOrderAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [predictiveQuery, setPredictiveQuery] = useState('');
  const [predictiveResults, setPredictiveResults] = useState(null);
  const [isPredictiveLoading, setIsPredictiveLoading] = useState(false);

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

  const handlePredictiveQuery = async () => {
    if (!predictiveQuery.trim()) return;
    
    setIsPredictiveLoading(true);
    try {
      const response = await axios.post('http://localhost:5001/api/query', {
        query: predictiveQuery
      });
      
      setPredictiveResults(response.data);
    } catch (error) {
      console.error('Error with predictive query:', error);
      alert('Error processing predictive query');
    } finally {
      setIsPredictiveLoading(false);
    }
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

          {/* LangChain Predictive Analytics Section */}
          <div className="predictive-analytics-section">
            <h3>🤖 LangChain Business Intelligence</h3>
            <p className="section-description">
              Advanced AI-powered analytics using LangChain agents for predictive insights, 
              churn analysis, and business recommendations.
            </p>
            
            <div className="query-examples">
              <h4>💡 Try these advanced queries:</h4>
              <div className="example-queries">
                <button 
                  onClick={() => setPredictiveQuery("Analyze customer churn risk and provide recommendations")}
                  className="example-btn"
                >
                  🔍 Churn Analysis
                </button>
                <button 
                  onClick={() => setPredictiveQuery("Predict next month's revenue and growth opportunities")}
                  className="example-btn"
                >
                  📈 Revenue Forecast
                </button>
                <button 
                  onClick={() => setPredictiveQuery("Perform customer segmentation analysis")}
                  className="example-btn"
                >
                  👥 Customer Segmentation
                </button>
                <button 
                  onClick={() => setPredictiveQuery("Provide business intelligence insights")}
                  className="example-btn"
                >
                  📊 Business Insights
                </button>
              </div>
            </div>
            
            <div className="query-input-section">
              <textarea
                value={predictiveQuery}
                onChange={(e) => setPredictiveQuery(e.target.value)}
                placeholder="Ask for predictive analytics, business insights, or AI recommendations..."
                className="query-input"
                rows="3"
              />
              <button 
                onClick={handlePredictiveQuery}
                disabled={isPredictiveLoading || !predictiveQuery.trim()}
                className="query-btn"
              >
                {isPredictiveLoading ? '🤖 AI Analyzing...' : '🚀 Get AI Insights'}
              </button>
            </div>
            
            {predictiveResults && (
              <div className="results-section">
                <h4>🎯 AI Analysis Results:</h4>
                <div className="results-content">
                  {predictiveResults.type === 'predictive_analytics' ? (
                    <div className="predictive-results">
                      <pre className="ai-analysis">{predictiveResults.data}</pre>
                    </div>
                  ) : (
                    <div className="table-results">
                      {/* Existing table display logic */}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;