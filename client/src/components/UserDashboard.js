import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserDashboard.css';
import TypingTest from './TypingTest';

function UserDashboard({ user, onLogout }) {
  const [showTypingTest, setShowTypingTest] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTests: 0,
    averageWpm: 0,
    averageAccuracy: 0,
    bestWpm: 0
  });

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await axios.get('/api/results');
      setResults(response.data);
      calculateStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching results:', error);
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    if (data.length === 0) {
      setStats({ totalTests: 0, averageWpm: 0, averageAccuracy: 0, bestWpm: 0 });
      return;
    }

    const totalTests = data.length;
    const averageWpm = Math.round(data.reduce((sum, r) => sum + r.wpm, 0) / totalTests);
    const averageAccuracy = Math.round(data.reduce((sum, r) => sum + r.accuracy, 0) / totalTests);
    const bestWpm = Math.max(...data.map(r => r.wpm));

    setStats({ totalTests, averageWpm, averageAccuracy, bestWpm });
  };

  if (showTypingTest) {
    return (
      <div>
        <div style={{ padding: '10px', background: '#2a2a2a', textAlign: 'center' }}>
          <button 
            onClick={() => setShowTypingTest(false)} 
            style={{ 
              padding: '8px 16px', 
              background: '#ffd700', 
              color: '#1a1a1a', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Back to Dashboard
          </button>
        </div>
        <TypingTest user={user} onLogin={() => {}} onLogout={onLogout} />
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <h1>MatthewWrite</h1>
        <div className="user-info">
          <button onClick={() => setShowTypingTest(true)} className="typing-test-btn">
            Start Typing Test
          </button>
          <span>Welcome, {user?.username}</span>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Tests</div>
            <div className="stat-value">{stats.totalTests}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Average WPM</div>
            <div className="stat-value">{stats.averageWpm}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Average Accuracy</div>
            <div className="stat-value">{stats.averageAccuracy}%</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Best WPM</div>
            <div className="stat-value">{stats.bestWpm}</div>
          </div>
        </div>

        <div className="results-section">
          <h2>Recent Results</h2>
          {loading ? (
            <div className="loading">Loading...</div>
          ) : results.length === 0 ? (
            <div className="no-results">No test results yet. Start typing to see your results here!</div>
          ) : (
            <div className="results-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>WPM</th>
                    <th>Accuracy</th>
                    <th>Raw WPM</th>
                    <th>Test Type</th>
                    <th>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result) => (
                    <tr key={result.id}>
                      <td>{new Date(result.created_at).toLocaleDateString()}</td>
                      <td>{result.wpm}</td>
                      <td>{result.accuracy}%</td>
                      <td>{result.raw_wpm}</td>
                      <td>{result.test_type}</td>
                      <td>{result.test_duration}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;

