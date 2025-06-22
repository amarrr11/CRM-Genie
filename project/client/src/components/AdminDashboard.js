import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/AdminDashboard.css';

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('query');
  const [queryInput, setQueryInput] = useState('');
  const [queryResult, setQueryResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [emailList, setEmailList] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');

  useEffect(() => {
    if (activeTab === 'campaigns') {
      fetchCampaigns();
    }
  }, [activeTab]);

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get('/api/admin/campaigns');
      setCampaigns(response.data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    if (!queryInput.trim()) return;

    setLoading(true);
    try {
      const response = await axios.post('/api/admin/query', { query: queryInput });
      setQueryResult(response.data);
      fetchCampaigns(); // Refresh campaigns
    } catch (error) {
      console.error('Error processing query:', error);
      setQueryResult({ 
        type: 'error', 
        message: 'Failed to process query. Please try again.' 
      });
    }
    setLoading(false);
  };

  const handleSendEmails = async (e) => {
    e.preventDefault();
    if (!emailList.trim()) {
      alert('Please enter email addresses');
      return;
    }

    const emails = emailList.split(',').map(email => email.trim()).filter(email => email);
    
    setLoading(true);
    try {
      const response = await axios.post('/api/send-emails', {
        emails,
        subject: emailSubject,
        message: emailMessage
      });
      
      alert(response.data.message);
      setEmailList('');
      setEmailSubject('');
      setEmailMessage('');
    } catch (error) {
      console.error('Error sending emails:', error);
      alert('Failed to send emails');
    }
    setLoading(false);
  };

  const downloadExcel = (filename) => {
    window.open(`http://localhost:5002/download-excel/${filename}`, '_blank');
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="header-content">
          <div className="user-info">
            <h1>Admin Dashboard</h1>
            <p>Welcome, {user.name}</p>
          </div>
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="admin-content">
        <nav className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'query' ? 'active' : ''}`}
            onClick={() => setActiveTab('query')}
          >
            🤖 AI Query
          </button>
          <button 
            className={`tab-btn ${activeTab === 'campaigns' ? 'active' : ''}`}
            onClick={() => setActiveTab('campaigns')}
          >
            📊 Campaign History
          </button>
          <button 
            className={`tab-btn ${activeTab === 'email' ? 'active' : ''}`}
            onClick={() => setActiveTab('email')}
          >
            📧 Send Emails
          </button>
        </nav>

        <div className="tab-content">
          {activeTab === 'query' && (
            <div className="query-section">
              <div className="section-header">
                <h2>AI-Powered Customer Query</h2>
                <p>Ask questions about your customers in natural language</p>
              </div>
              
              <form onSubmit={handleQuerySubmit} className="query-form">
                <div className="form-group">
                  <label htmlFor="query">Enter your query:</label>
                  <textarea
                    id="query"
                    value={queryInput}
                    onChange={(e) => setQueryInput(e.target.value)}
                    placeholder="e.g., How many users spend more than ₹10,000 and have less than 3 visits?"
                    rows="4"
                    required
                  />
                </div>
                <button type="submit" disabled={loading} className="query-btn">
                  {loading ? 'Processing...' : 'Run Query'}
                </button>
              </form>

              {queryResult && (
                <div className="query-result">
                  <h3>Query Result</h3>
                  {queryResult.type === 'error' ? (
                    <div className="error-message">
                      <p>{queryResult.message}</p>
                    </div>
                  ) : queryResult.type === 'count' ? (
                    <div className="count-result">
                      <div className="count-display">
                        <span className="count-number">{queryResult.count}</span>
                        <span className="count-label">Users Found</span>
                      </div>
                      <p>{queryResult.message}</p>
                    </div>
                  ) : (
                    <div className="data-result">
                      <div className="result-header">
                        <span>Found {queryResult.count} users</span>
                        {queryResult.excel_file && (
                          <button 
                            onClick={() => downloadExcel(queryResult.excel_file.split('/')[1].replace('.xlsx', ''))}
                            className="download-btn"
                          >
                            📊 Download Excel
                          </button>
                        )}
                      </div>
                      
                      {queryResult.results.length > 0 && (
                        <div className="results-table">
                          <table>
                            <thead>
                              <tr>
                                {Object.keys(queryResult.results[0]).map(key => (
                                  <th key={key}>{key}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {queryResult.results.slice(0, 10).map((row, index) => (
                                <tr key={index}>
                                  {Object.values(row).map((value, i) => (
                                    <td key={i}>{value}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {queryResult.results.length > 10 && (
                            <p className="table-note">
                              Showing first 10 results. Download Excel for complete data.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'campaigns' && (
            <div className="campaigns-section">
              <div className="section-header">
                <h2>Campaign History</h2>
                <p>Your previous AI queries and campaigns</p>
              </div>
              
              {campaigns.length === 0 ? (
                <div className="empty-state">
                  <p>No campaigns yet. Start by running your first AI query!</p>
                </div>
              ) : (
                <div className="campaigns-list">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="campaign-item">
                      <div className="campaign-content">
                        <div className="campaign-query">
                          <h4>Query:</h4>
                          <p>"{campaign.query_text}"</p>
                        </div>
                        {campaign.result_count && (
                          <div className="campaign-result">
                            <span className="result-count">{campaign.result_count} results</span>
                          </div>
                        )}
                      </div>
                      <div className="campaign-date">
                        {new Date(campaign.created_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'email' && (
            <div className="email-section">
              <div className="section-header">
                <h2>Send Bulk Emails</h2>
                <p>Send personalized emails to multiple customers</p>
              </div>
              
              <form onSubmit={handleSendEmails} className="email-form">
                <div className="form-group">
                  <label htmlFor="emails">Email Addresses:</label>
                  <textarea
                    id="emails"
                    value={emailList}
                    onChange={(e) => setEmailList(e.target.value)}
                    placeholder="Enter email addresses separated by commas"
                    rows="4"
                    required
                  />
                  <small>Separate multiple emails with commas</small>
                </div>
                
                <div className="form-group">
                  <label htmlFor="subject">Subject:</label>
                  <input
                    type="text"
                    id="subject"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Email subject"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Message:</label>
                  <textarea
                    id="message"
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    placeholder="Email message"
                    rows="6"
                  />
                </div>
                
                <button type="submit" disabled={loading} className="send-email-btn">
                  {loading ? 'Sending...' : 'Send Emails'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;