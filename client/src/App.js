import React, { useState, useEffect } from 'react';
import './App.css';
import TypingTest from './components/TypingTest';
import UserDashboard from './components/UserDashboard';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import axios from 'axios';

function App() {
  const [user, setUser] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check for stored token
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
  }, []);

  const handleLogin = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  // Route based on user role
  const renderContent = () => {
    if (!user) {
      return <TypingTest user={user} onLogin={handleLogin} onLogout={handleLogout} />;
    }

    if (user.role === 'superadmin') {
      return <SuperAdminDashboard user={user} onLogout={handleLogout} />;
    }

    return <UserDashboard user={user} onLogout={handleLogout} />;
  };

  return (
    <div className="App">
      {renderContent()}
    </div>
  );
}

export default App;

