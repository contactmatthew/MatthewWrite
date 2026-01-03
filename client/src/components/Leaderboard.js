import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Leaderboard.css';

function Leaderboard({ user, onLogout, onBack }) {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get('/api/leaderboard');
      console.log('Leaderboard response:', response.data);
      setRankings(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      console.error('Error response:', error.response?.data);
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h1>MatthewWrite</h1>
        <div className="user-info">
          {onBack && (
            <button onClick={onBack} className="back-btn">Back to Dashboard</button>
          )}
          {user && (
            <>
              <span>Welcome, {user.username}</span>
              <button onClick={onLogout} className="logout-btn">Logout</button>
            </>
          )}
        </div>
      </div>

      <div className="leaderboard-content">
        <h2>Public Leaderboard - Top WPM Rankings</h2>
        {loading ? (
          <div className="loading">Loading leaderboard...</div>
        ) : rankings.length === 0 ? (
          <div className="no-rankings">No rankings available yet. Start typing to see your rank!</div>
        ) : (
          <div className="rankings-table">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Username</th>
                  <th>Best WPM</th>
                  <th>Average WPM</th>
                  <th>Total Tests</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((rankingUser, index) => (
                  <tr 
                    key={rankingUser.id} 
                    className={rankingUser.id === user?.id ? 'current-user' : ''}
                  >
                    <td className="rank-cell">
                      <span className="rank-number">{getRankIcon(index + 1)}</span>
                    </td>
                    <td className="username-cell">
                      {rankingUser.username}
                      {rankingUser.id === user?.id && <span className="you-badge"> (You)</span>}
                    </td>
                    <td className="wpm-cell">{rankingUser.best_wpm}</td>
                    <td className="avg-wpm-cell">{Math.round(rankingUser.average_wpm || 0)}</td>
                    <td className="tests-cell">{rankingUser.total_tests}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;

