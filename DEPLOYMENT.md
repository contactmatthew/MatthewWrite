# Deployment Guide for MatthewWrite

This guide covers multiple deployment options for your full-stack typing test application.

## Project Structure
- **Frontend**: React app (client/)
- **Backend**: Express.js API (server/)
- **Database**: MySQL

---

## Option 1: Render (Recommended - Free Tier Available)

### Step 1: Deploy Backend (API Server)

1. **Create a Render account** at https://render.com
2. **Create a new Web Service**:
   - Connect your GitHub repository
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Environment Variables**:
     ```
     PORT=5000
     DB_HOST=your-mysql-host
     DB_USER=your-db-user
     DB_PASSWORD=your-db-password
     DB_NAME=typing_speed
     JWT_SECRET=your-secret-key-change-this
     NODE_ENV=production
     ```
3. **Add MySQL Database**:
   - In Render dashboard, create a new PostgreSQL or MySQL database
   - Copy the connection details to your environment variables

### Step 2: Deploy Frontend

1. **Create a new Static Site** in Render:
   - Connect your GitHub repository
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/build`
2. **Add Environment Variables**:
   - `REACT_APP_API_URL=https://your-backend-url.onrender.com`

### Step 3: Update Frontend API Configuration

Update `client/src` to use the production API URL:

```javascript
// Create client/src/config.js
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
export default API_URL;
```

Then update axios calls to use this URL.

---

## Option 2: Vercel (Frontend) + Railway (Backend)

### Frontend on Vercel

1. **Create Vercel account** at https://vercel.com
2. **Import your GitHub repository**
3. **Configure**:
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Environment Variables**:
     ```
     REACT_APP_API_URL=https://your-backend.railway.app
     ```

### Backend on Railway

1. **Create Railway account** at https://railway.app
2. **New Project** → **Deploy from GitHub**
3. **Configure**:
   - **Root Directory**: `server`
   - **Start Command**: `npm start`
   - **Add MySQL Database** service
   - **Environment Variables** (from database service):
     ```
     DB_HOST=${{MySQL.MYSQLHOST}}
     DB_USER=${{MySQL.MYSQLUSER}}
     DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
     DB_NAME=${{MySQL.MYSQLDATABASE}}
     PORT=${{PORT}}
     JWT_SECRET=your-secret-key
     ```

---

## Option 3: DigitalOcean App Platform

1. **Create DigitalOcean account**
2. **Create App** → **GitHub** → Select repository
3. **Configure Components**:

   **Backend Component**:
   - **Source Directory**: `server`
   - **Build Command**: `npm install`
   - **Run Command**: `npm start`
   - **Environment Variables**: Add all DB and JWT variables

   **Frontend Component**:
   - **Source Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: `build`
   - **Environment Variables**: `REACT_APP_API_URL`

   **Database Component**:
   - Add MySQL database
   - Connection details auto-injected

---

## Option 4: Self-Hosted VPS (Ubuntu/Debian)

### Prerequisites
- VPS with Ubuntu 20.04+
- Domain name (optional but recommended)
- SSH access

### Step 1: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL
sudo apt install mysql-server -y
sudo mysql_secure_installation

# Install Nginx
sudo apt install nginx -y

# Install PM2 (Process Manager)
sudo npm install -g pm2
```

### Step 2: Setup Database

```bash
# Login to MySQL
sudo mysql -u root -p

# Create database and user
CREATE DATABASE typing_speed;
CREATE USER 'typing_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON typing_speed.* TO 'typing_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Import schema
mysql -u typing_user -p typing_speed < database/schema.sql
```

### Step 3: Deploy Backend

```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/contactmatthew/MatthewWrite.git
cd MatthewWrite/server

# Install dependencies
sudo npm install --production

# Create .env file
sudo nano .env
```

Add to `.env`:
```
PORT=5000
DB_HOST=localhost
DB_USER=typing_user
DB_PASSWORD=your_secure_password
DB_NAME=typing_speed
JWT_SECRET=your-very-secure-secret-key-here
NODE_ENV=production
```

```bash
# Start with PM2
sudo pm2 start index.js --name matthewwrite-api
sudo pm2 save
sudo pm2 startup
```

### Step 4: Deploy Frontend

```bash
cd /var/www/MatthewWrite/client

# Install dependencies
sudo npm install

# Build
sudo npm run build

# Copy build to nginx directory
sudo cp -r build/* /var/www/html/
```

### Step 5: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/matthewwrite
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/matthewwrite /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 6: Setup SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

---

## Option 5: Docker Deployment

### Create Dockerfile for Backend

```dockerfile
# server/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "index.js"]
```

### Create Dockerfile for Frontend

```dockerfile
# client/Dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: typing_speed
      MYSQL_USER: typing_user
      MYSQL_PASSWORD: userpassword
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"

  backend:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      DB_HOST: mysql
      DB_USER: typing_user
      DB_PASSWORD: userpassword
      DB_NAME: typing_speed
      JWT_SECRET: your-secret-key
    depends_on:
      - mysql

  frontend:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - backend
```

Deploy:
```bash
docker-compose up -d
```

---

## Important Pre-Deployment Steps

### 1. Update API Configuration

Create `client/src/config.js`:
```javascript
const API_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? 'https://your-backend-url.com' 
    : 'http://localhost:5000');

export default API_URL;
```

Update axios calls:
```javascript
// In components, replace axios.get('/api/...') with:
import API_URL from '../config';
axios.get(`${API_URL}/api/...`)
```

### 2. Environment Variables Checklist

**Backend (.env)**:
- ✅ `DB_HOST`
- ✅ `DB_USER`
- ✅ `DB_PASSWORD`
- ✅ `DB_NAME`
- ✅ `JWT_SECRET` (use a strong random string)
- ✅ `PORT` (usually auto-set by hosting)

**Frontend (.env)**:
- ✅ `REACT_APP_API_URL` (your backend URL)

### 3. Security Checklist

- [ ] Change default JWT_SECRET to a strong random string
- [ ] Use strong database passwords
- [ ] Enable HTTPS/SSL
- [ ] Set up CORS properly (already configured)
- [ ] Review and remove any console.logs with sensitive data
- [ ] Set up database backups

### 4. Database Migration

Run the schema on your production database:
```bash
mysql -u user -p database_name < database/schema.sql
```

Or use the migration script:
```bash
mysql -u user -p database_name < database/migration_add_role.sql
```

---

## Recommended: Render (Easiest)

**Why Render?**
- ✅ Free tier available
- ✅ Easy GitHub integration
- ✅ Automatic SSL
- ✅ Built-in database options
- ✅ Simple configuration

**Quick Start:**
1. Sign up at render.com
2. Connect GitHub
3. Deploy backend as Web Service
4. Deploy frontend as Static Site
5. Add MySQL database
6. Configure environment variables
7. Done!

---

## Need Help?

- Check hosting provider documentation
- Review error logs in hosting dashboard
- Test API endpoints with Postman/curl
- Verify database connections
- Check CORS settings if API calls fail

---

## Post-Deployment

1. **Test all features**:
   - User registration/login
   - Typing test functionality
   - Results saving
   - Leaderboard
   - Admin features

2. **Monitor**:
   - Server logs
   - Database performance
   - Error rates
   - User activity

3. **Backup**:
   - Set up automated database backups
   - Keep code in version control (GitHub)

