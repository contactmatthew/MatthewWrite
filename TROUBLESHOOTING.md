# Troubleshooting Guide

## 500 Internal Server Error on /api/text

This error means the **backend server is not running** or there's an issue with it.

### Solution:

1. **Start the Backend Server**:
   
   Open a new terminal and run:
   ```bash
   cd server
   npm start
   ```
   
   You should see:
   ```
   Server running on port 5000
   Database initialized successfully
   ```

2. **Or Start Both Servers Together**:
   
   From the root directory:
   ```bash
   npm run dev
   ```
   
   This starts both frontend (port 3000) and backend (port 5000) together.

3. **Check if Backend is Running**:
   
   Open http://localhost:5000/api/text?type=words&length=50 in your browser
   
   You should see JSON like:
   ```json
   {"text":"computer programming software algorithm..."}
   ```

### Common Issues:

**Issue: "Cannot find module './textGenerator'"**
- Make sure you're in the `server` directory when running `npm start`
- Check that `server/textGenerator.js` exists

**Issue: "Port 5000 already in use"**
- Another process is using port 5000
- Change the port in `server/.env` file:
  ```
  PORT=5001
  ```
- Update `client/package.json` proxy to match:
  ```json
  "proxy": "http://localhost:5001"
  ```

**Issue: Database connection error**
- Make sure MySQL/XAMPP is running
- Check `server/.env` has correct database credentials
- Verify database `typing_speed` exists

### Verify Setup:

1. **Backend running**: http://localhost:5000/api/text?type=words&length=10
2. **Frontend running**: http://localhost:3000
3. **Database**: Check phpMyAdmin or MySQL that `typing_speed` database exists

### Quick Test:

Run this in your terminal to test the backend:
```bash
curl http://localhost:5000/api/text?type=words&length=10
```

If you get JSON back, the backend is working!

