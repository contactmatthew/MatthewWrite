# Quick Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)

## Step 1: Install Dependencies
```bash
npm run install-all
```

## Step 2: Configure Database

### For XAMPP Users:

1. **Start XAMPP**: Make sure Apache and MySQL are running in XAMPP Control Panel

2. **Open phpMyAdmin**: Go to http://localhost/phpmyadmin

3. **Create Database**:
   - Click on "SQL" tab in phpMyAdmin
   - Copy and paste the contents of `database/schema.sql` file
   - Click "Go" to execute
   - OR manually create database: Click "New" → Database name: `typing_speed` → Collation: `utf8mb4_unicode_ci` → Create

4. **Import Schema** (if you created database manually):
   - Select `typing_speed` database
   - Click "SQL" tab
   - Copy and paste the CREATE TABLE statements from `database/schema.sql`
   - Click "Go"

### For MySQL Command Line Users:

1. Open MySQL command line or terminal
2. Run the SQL file:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
   Or copy and paste the contents of `database/schema.sql` directly

### Configure Environment File:

1. Copy the environment file:
   ```bash
   cd server
   copy env.example .env
   ```
   (On Windows PowerShell: `Copy-Item env.example .env`)

2. Edit `server/.env` with your database credentials:
   ```
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=          # Leave empty if XAMPP MySQL has no password
   DB_NAME=typing_speed
   JWT_SECRET=your-secret-key-change-in-production
   ```
   
   **Note for XAMPP**: By default, XAMPP MySQL has no password. Leave `DB_PASSWORD` empty or set it to an empty string.

## Step 3: Start the Application.

### Option 1: Start both frontend and backend together
```bash
npm run dev
```

### Option 2: Start separately

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

## Troubleshooting.

### Proxy Error (ECONNREFUSED)
This means the backend server isn't running. Make sure:
1. The backend server is started on port 5000
2. MySQL is running
3. Database credentials in `.env` are correct
4. The database `typing_speed` exists

### Database Connection Error
- Verify MySQL is running
- Check database credentials in `server/.env`
- Ensure the database `typing_speed` exists

### Port Already in Use
- Change the port in `server/.env` (for backend)
- Or change the proxy in `client/package.json` (for frontend)

## Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

