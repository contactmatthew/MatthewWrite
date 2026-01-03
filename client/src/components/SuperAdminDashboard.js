import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SuperAdminDashboard.css';
import TypingTest from './TypingTest';
import Leaderboard from './Leaderboard';

function SuperAdminDashboard({ user, onLogout }) {
  const [showTypingTest, setShowTypingTest] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [users, setUsers] = useState([]);
  const [allResults, setAllResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [createUserForm, setCreateUserForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [createUserError, setCreateUserError] = useState('');
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTests: 0,
    averageWpm: 0,
    averageAccuracy: 0
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    try {
      const [usersResponse, resultsResponse] = await Promise.all([
        axios.get('/api/admin/users'),
        axios.get('/api/admin/results')
      ]);
      setUsers(usersResponse.data);
      setAllResults(resultsResponse.data);
      calculateStats(usersResponse.data, resultsResponse.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const calculateStats = (usersData, resultsData) => {
    const totalUsers = usersData.length;
    const totalTests = resultsData.length;
    const averageWpm = totalTests > 0 
      ? Math.round(resultsData.reduce((sum, r) => sum + r.wpm, 0) / totalTests)
      : 0;
    const averageAccuracy = totalTests > 0
      ? Math.round(resultsData.reduce((sum, r) => sum + r.accuracy, 0) / totalTests)
      : 0;

    setStats({ totalUsers, totalTests, averageWpm, averageAccuracy });
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/users/${userId}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateUserError('');
    setCreateUserLoading(true);

    try {
      await axios.post('/api/admin/users', createUserForm);
      setCreateUserForm({ username: '', email: '', password: '', role: 'user' });
      setShowCreateUser(false);
      fetchData(); // Refresh users list
    } catch (error) {
      setCreateUserError(error.response?.data?.error || 'Failed to create user');
    } finally {
      setCreateUserLoading(false);
    }
  };

  const handleCreateUserChange = (e) => {
    setCreateUserForm({
      ...createUserForm,
      [e.target.name]: e.target.value
    });
    setCreateUserError('');
  };

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
    <div className="superadmin-dashboard">
      <div className="dashboard-header">
        <h1>MatthewWrite - Admin Panel</h1>
        <div className="user-info">
          <button onClick={() => setShowTypingTest(true)} className="typing-test-btn">
            Start Typing Test
          </button>
          <button onClick={() => setShowLeaderboard(true)} className="leaderboard-btn">
            Leaderboard
          </button>
          <span>Super Admin: {user?.username}</span>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{stats.totalUsers}</div>
          </div>
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
        </div>

        <div className="tables-section">
          <div className="table-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Manage Accounts</h2>
              <button 
                onClick={() => setShowCreateUser(!showCreateUser)}
                className="create-user-btn"
              >
                {showCreateUser ? 'Cancel' : '+ Create User'}
              </button>
            </div>

            {showCreateUser && (
              <div className="create-user-form">
                <form onSubmit={handleCreateUser}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Username</label>
                      <input
                        type="text"
                        name="username"
                        value={createUserForm.username}
                        onChange={handleCreateUserChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        value={createUserForm.email}
                        onChange={handleCreateUserChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Password</label>
                      <input
                        type="password"
                        name="password"
                        value={createUserForm.password}
                        onChange={handleCreateUserChange}
                        required
                        minLength="6"
                      />
                    </div>
                    <div className="form-group">
                      <label>Role</label>
                      <select
                        name="role"
                        value={createUserForm.role}
                        onChange={handleCreateUserChange}
                      >
                        <option value="user">User</option>
                        <option value="superadmin">Super Admin</option>
                      </select>
                    </div>
                  </div>
                  {createUserError && (
                    <div className="error-message">{createUserError}</div>
                  )}
                  <button type="submit" disabled={createUserLoading} className="submit-btn">
                    {createUserLoading ? 'Creating...' : 'Create User'}
                  </button>
                </form>
              </div>
            )}
          </div>

          <div className="table-container">
            <h2>All Users</h2>
            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td>{u.id}</td>
                        <td>{u.username}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`role-badge ${u.role}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>{new Date(u.created_at).toLocaleDateString()}</td>
                        <td>
                          {u.role !== 'superadmin' && (
                            <button 
                              className="delete-btn"
                              onClick={() => handleDeleteUser(u.id)}
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="table-container">
            <h2>All Test Results</h2>
            {loading ? (
              <div className="loading">Loading...</div>
            ) : allResults.length === 0 ? (
              <div className="no-results">No test results yet.</div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>WPM</th>
                      <th>Accuracy</th>
                      <th>Raw WPM</th>
                      <th>Test Type</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allResults.map((result) => (
                      <tr key={result.id}>
                        <td>{result.username || 'N/A'}</td>
                        <td>{result.wpm}</td>
                        <td>{result.accuracy}%</td>
                        <td>{result.raw_wpm}</td>
                        <td>{result.test_type}</td>
                        <td>{new Date(result.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuperAdminDashboard;

