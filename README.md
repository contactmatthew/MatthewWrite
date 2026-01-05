# MatthewWrite

<div align="center">

![MatthewWrite](https://img.shields.io/badge/MatthewWrite-Typing%20Speed%20Test-blue?style=for-the-badge)
![Version](https://img.shields.io/badge/version-1.0.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)

**A modern, full-featured typing speed test application with real-time analytics, performance tracking, and competitive leaderboards.**

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Screenshots](#-screenshots)
- [Getting Started](#-getting-started)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 🎯 Overview

MatthewWrite is a comprehensive typing speed test application designed to help users improve their typing skills through detailed analytics, performance tracking, and competitive features. Built with modern web technologies, it provides a seamless experience for both casual users and professional typists.

### Key Highlights

- ⚡ **Real-time Statistics** - Live WPM, accuracy, and consistency tracking
- 📊 **Performance Analytics** - Detailed graphs and historical data
- 🏆 **Competitive Leaderboards** - Compare your skills with other users
- 👥 **User Management** - Role-based access control (User & Admin)
- 📈 **Progress Tracking** - Monitor your improvement over time
- 🎨 **Modern UI** - Clean, responsive design with dark theme

---

## ✨ Features

### Core Functionality
- **Typing Tests** with customizable duration (15s, 30s, 60s, etc.)
- **Multiple Test Types**: Words, Sentences, Paragraphs
- **Real-time WPM Calculation** (Words Per Minute)
- **Accuracy Tracking** with detailed error analysis
- **Error Letter Count** - Tracks all mistakes including corrected ones
- **Consistency Score** - Measures typing rhythm and stability
- **Raw WPM** - Shows typing speed without accuracy penalty

### User Features
- **User Authentication** - Secure login and registration
- **Personal Dashboard** - View your test history and statistics
- **Performance Graphs** - Visual representation of WPM and errors over time
- **Test History** - Sortable table of all your past tests
- **Best Scores** - Track your personal records

### Admin Features
- **Super Admin Dashboard** - Comprehensive system overview
- **User Management** - Create and manage user accounts
- **System Statistics** - View all users and test results
- **Account Management** - Full CRUD operations for users

### Competitive Features
- **Public Leaderboard** - Ranked by best WPM
- **User Rankings** - See where you stand globally
- **Average WPM Tracking** - Compare average performance
- **Total Tests Counter** - Track activity levels

---

## 🛠 Tech Stack

### Frontend
- **React 18.2** - Modern UI framework
- **Recharts** - Data visualization and graphs
- **Axios** - HTTP client for API requests
- **CSS3** - Custom styling with responsive design

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **MySQL** - Relational database
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing

### Infrastructure
- **GitHub Actions** - CI/CD workflows
- **GitHub Packages** - Package registry
- **Docker** - Containerization support (optional)

---

## 📸 Screenshots

### Typing Test Interface
- Real-time statistics panel
- Live performance graph
- Character-by-character feedback
- Final results summary

### User Dashboard
- Personal statistics overview
- Test history with sorting
- Performance trends

### Leaderboard
- Top WPM rankings
- User comparison
- Average performance metrics

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **MySQL** 8.0 or higher
- **npm** or **yarn**
- **Git**

### Quick Start

```bash
# Clone the repository
git clone https://github.com/contactmatthew/MatthewWrite.git
cd MatthewWrite

# Install all dependencies
npm run install-all

# Set up the database (see Configuration section)
# Configure environment variables

# Start development servers
npm run dev
```

---

## 📦 Installation

### Step 1: Clone Repository

```bash
git clone https://github.com/contactmatthew/MatthewWrite.git
cd MatthewWrite
```

### Step 2: Install Dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Step 3: Database Setup

1. Create MySQL database:
```sql
CREATE DATABASE typing_speed;
```

2. Run schema:
```bash
mysql -u root -p typing_speed < database/schema.sql
```

3. (Optional) Run migration:
```bash
mysql -u root -p typing_speed < database/migration_add_role.sql
```

### Step 4: Environment Configuration

**Server** (`server/.env`):
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=typing_speed
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

**Client** (`client/.env`):
```env
REACT_APP_API_URL=http://localhost:5000
```

### Step 5: Create Sample Accounts

```bash
cd server
npm run setup-accounts
```

This creates:
- **Super Admin**: `admin` / `admin123`
- **User**: `user` / `user123`

---

## ⚙️ Configuration

### Server Configuration

Edit `server/.env` with your database credentials and JWT secret.

### Client Configuration

The client automatically uses the API URL from environment variables. For production, set `REACT_APP_API_URL` to your backend URL.

### Database Configuration

See `database/README.md` for detailed database setup instructions.

---

## 📖 Usage

### Running Development Servers

```bash
# Run both frontend and backend concurrently
npm run dev

# Or run separately:
npm run server  # Backend on port 5000
npm run client  # Frontend on port 3000
```

### Accessing the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: See API section below

### User Roles

- **User**: Can take tests, view personal dashboard and leaderboard
- **Super Admin**: Full access including user management and system statistics

---

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/register` - Register new user
- `POST /api/login` - User login

### User Endpoints (Authenticated)

- `GET /api/results` - Get user's test results
- `POST /api/results` - Save test result
- `GET /api/leaderboard` - Get public leaderboard

### Admin Endpoints (Super Admin Only)

- `GET /api/admin/users` - Get all users
- `GET /api/admin/results` - Get all test results
- `POST /api/admin/users` - Create new user
- `DELETE /api/admin/users/:id` - Delete user

### Public Endpoints

- `GET /api/text` - Get random text for typing test

---

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment guides including:

- **Render** (Recommended - Free tier)
- **Vercel + Railway**
- **DigitalOcean App Platform**
- **Self-hosted VPS**
- **Docker** deployment

### Quick Deploy to Render

1. Connect GitHub repository to Render
2. Deploy backend as Web Service
3. Deploy frontend as Static Site
4. Add MySQL database
5. Configure environment variables

---

## 📦 Packages

This repository publishes npm packages to GitHub Packages:

- `@contactmatthew/matthewwrite-server` - Backend package
- `@contactmatthew/matthewwrite-client` - Frontend package

See [PACKAGES.md](./PACKAGES.md) for installation and usage instructions.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style
- Add comments for complex logic
- Update documentation as needed
- Test your changes thoroughly

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Contact

**Matthew James**

- GitHub: [@contactmatthew](https://github.com/contactmatthew)
- Email: contact.james.matthew@gmail.com
- Repository: [MatthewWrite](https://github.com/contactmatthew/MatthewWrite)

---

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by popular typing test applications
- Designed for both learning and competitive use

---

<div align="center">

**⭐ If you find this project helpful, please consider giving it a star! ⭐**

Made with ❤️ by [contactmatthew](https://github.com/contactmatthew)

---

*Last updated: January 2026*

</div>
