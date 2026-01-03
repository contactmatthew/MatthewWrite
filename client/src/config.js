// API Configuration
// In production, set REACT_APP_API_URL environment variable
// For local development, it defaults to localhost:5000

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Configure axios base URL
axios.defaults.baseURL = API_URL;

export default API_URL;

