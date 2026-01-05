import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserDashboard.css';
import TypingTest from './TypingTest';
import Leaderboard from './Leaderboard';

function UserDashboard({ user, onLogout }) {
  const [showTypingTest, setShowTypingTest] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [stats, setStats] = useState({
    totalTests: 0,
    averageWpm: 0,
    averageAccuracy: 0,
    bestWpm: 0
  });

  useEffect(() => {
    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    
    // Calculate average WPM
    const validWpmData = data.filter(r => r.wpm != null && !isNaN(r.wpm));
    const averageWpm = validWpmData.length > 0
      ? Math.round(validWpmData.reduce((sum, r) => sum + Number(r.wpm), 0) / validWpmData.length)
      : 0;
    
    // Calculate average accuracy - handle null, undefined, and NaN values
    const validAccuracyData = data.filter(r => {
      const acc = Number(r.accuracy);
      return acc != null && !isNaN(acc) && isFinite(acc);
    });
    const averageAccuracy = validAccuracyData.length > 0
      ? Math.round(validAccuracyData.reduce((sum, r) => sum + Number(r.accuracy), 0) / validAccuracyData.length)
      : 0;
    
    // Calculate best WPM
    const wpmValues = data.map(r => Number(r.wpm)).filter(wpm => !isNaN(wpm) && wpm != null);
    const bestWpm = wpmValues.length > 0 ? Math.max(...wpmValues) : 0;

    setStats({ totalTests, averageWpm, averageAccuracy, bestWpm });
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedResults = [...results].sort((a, b) => {
    let aValue, bValue;

    switch (sortConfig.key) {
      case 'date':
      case 'created_at':
        aValue = new Date(a.created_at);
        bValue = new Date(b.created_at);
        break;
      case 'wpm':
        aValue = a.wpm;
        bValue = b.wpm;
        break;
      case 'accuracy':
        aValue = a.accuracy;
        bValue = b.accuracy;
        break;
      case 'raw_wpm':
        aValue = a.raw_wpm;
        bValue = b.raw_wpm;
        break;
      case 'test_type':
        aValue = a.test_type.toLowerCase();
        bValue = b.test_type.toLowerCase();
        break;
      case 'duration':
        aValue = a.test_duration;
        bValue = b.test_duration;
        break;
      case 'errors':
        aValue = a.errors;
        bValue = b.errors;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  if (showTypingTest) {
    return (
      <TypingTest 
        user={user} 
        onLogin={() => {}} 
        onLogout={onLogout}
        onBack={() => setShowTypingTest(false)}
      />
    );
  }

  if (showLeaderboard) {
    return (
      <Leaderboard 
        user={user} 
        onLogout={onLogout}
        onBack={() => setShowLeaderboard(false)}
      />
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
          <button onClick={() => setShowLeaderboard(true)} className="leaderboard-btn">
            Leaderboard
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
                    <th 
                      className="sortable" 
                      onClick={() => handleSort('created_at')}
                    >
                      Date
                      {sortConfig.key === 'created_at' && (
                        <span className="sort-indicator">
                          {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                        </span>
                      )}
                    </th>
                    <th 
                      className="sortable" 
                      onClick={() => handleSort('wpm')}
                    >
                      WPM
                      {sortConfig.key === 'wpm' && (
                        <span className="sort-indicator">
                          {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                        </span>
                      )}
                    </th>
                    <th 
                      className="sortable" 
                      onClick={() => handleSort('accuracy')}
                    >
                      Accuracy
                      {sortConfig.key === 'accuracy' && (
                        <span className="sort-indicator">
                          {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                        </span>
                      )}
                    </th>
                    <th 
                      className="sortable" 
                      onClick={() => handleSort('raw_wpm')}
                    >
                      Raw WPM
                      {sortConfig.key === 'raw_wpm' && (
                        <span className="sort-indicator">
                          {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                        </span>
                      )}
                    </th>
                    <th 
                      className="sortable" 
                      onClick={() => handleSort('test_type')}
                    >
                      Test Type
                      {sortConfig.key === 'test_type' && (
                        <span className="sort-indicator">
                          {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                        </span>
                      )}
                    </th>
                    <th 
                      className="sortable" 
                      onClick={() => handleSort('duration')}
                    >
                      Duration
                      {sortConfig.key === 'duration' && (
                        <span className="sort-indicator">
                          {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                        </span>
                      )}
                    </th>
                    <th 
                      className="sortable" 
                      onClick={() => handleSort('errors')}
                    >
                      Error Letter Count
                      {sortConfig.key === 'errors' && (
                        <span className="sort-indicator">
                          {sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}
                        </span>
                      )}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedResults.map((result) => (
                    <tr key={result.id}>
                      <td>{new Date(result.created_at).toLocaleDateString()}</td>
                      <td>{result.wpm}</td>
                      <td>{result.accuracy}%</td>
                      <td>{result.raw_wpm}</td>
                      <td>{result.test_type}</td>
                      <td>{result.test_duration}s</td>
                      <td>{result.errors || 0}</td>
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

