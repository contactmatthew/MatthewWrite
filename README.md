# Typing Speed Test Application

A full-stack typing speed test application built with React, Node.js, Express, and MySQL. Track your typing speed (WPM), accuracy, and view real-time performance graphs.

## Features

- **User Authentication**: Register and login to save your typing results
- **Random Text Generator**: Generates meaningful words and sentences for typing practice
- **WPM Calculation**: Real-time Words Per Minute calculation
- **Accuracy Tracking**: Tracks correct, incorrect, extra, and missed characters
- **Real-time Graph**: Visualize your typing speed and errors over time
- **Multiple Test Types**: Choose between words, sentences, or mixed text
- **Customizable Duration**: 15s, 30s, 60s, or 120s tests
- **Statistics**: View WPM, accuracy, raw WPM, consistency, and character statistics

## Tech Stack

- **Frontend**: React 18
- **Backend**: Node.js, Express
- **Database**: MySQL
- **Charts**: Recharts
- **Authentication**: JWT (JSON Web Tokens)

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MatthewWrite
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up MySQL database**
   - Create a MySQL database named `typing_speed`
   - Update the `.env` file in the `server` directory with your database credentials

4. **Configure environment variables**
   ```bash
   cd server
   cp .env.example .env
   ```
   Edit `.env` with your database credentials:
   ```
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password_here
   DB_NAME=typing_speed
   JWT_SECRET=your-secret-key-change-in-production
   ```

5. **Start the application**
   ```bash
   # From the root directory
   npm run dev
   ```
   This will start both the backend server (port 5000) and frontend (port 3000).

## Usage

1. **Register/Login**: Create an account or login to track your results
2. **Configure Test**: Choose test type (words/sentences/mixed), duration, and text length
3. **Start Typing**: Begin typing the displayed text. The test starts automatically when you type the first character
4. **View Results**: See your WPM, accuracy, and other statistics in real-time
5. **Review Graph**: Check the performance graph showing your typing speed and errors over time
6. **Save Results**: Results are automatically saved to your account when the test completes

## Project Structure

```
MatthewWrite/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.js         # Main app component
│   │   └── index.js       # Entry point
│   └── package.json
├── server/                # Express backend
│   ├── index.js           # Server entry point
│   ├── textGenerator.js   # Text generation logic
│   └── package.json
├── package.json           # Root package.json
└── README.md
```

## API Endpoints

- `POST /api/register` - Register a new user
- `POST /api/login` - Login user
- `GET /api/text` - Get random text for typing test
- `POST /api/results` - Save typing test result (requires authentication)
- `GET /api/results` - Get user's typing results (requires authentication)

## Database Schema

### Users Table
- id (INT, PRIMARY KEY)
- username (VARCHAR, UNIQUE)
- email (VARCHAR, UNIQUE)
- password (VARCHAR, hashed)
- created_at (TIMESTAMP)

### Typing Results Table
- id (INT, PRIMARY KEY)
- user_id (INT, FOREIGN KEY)
- wpm (INT)
- accuracy (DECIMAL)
- raw_wpm (INT)
- characters (INT)
- errors (INT)
- test_type (VARCHAR)
- test_duration (INT)
- consistency (DECIMAL)
- created_at (TIMESTAMP)

## License

ISC

