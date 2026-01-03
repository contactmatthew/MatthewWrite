# Changelog

All notable changes to MatthewWrite will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-03

### Added
- User authentication system with JWT tokens
- User registration and login functionality
- Role-based access control (user and superadmin)
- Typing speed test with customizable duration and test type
- Real-time statistics display (WPM, accuracy, raw WPM, consistency)
- Performance graph showing WPM and error history over time
- User dashboard with test history and statistics
- Super admin dashboard with user management
- Public leaderboard showing top WPM rankings
- Error letter count tracking (includes corrected mistakes)
- Character tracking (correct, incorrect, extra, missed)
- Consistency calculation using coefficient of variation
- Test results saved to database
- Responsive design for mobile and desktop
- Dark theme UI with modern styling

### Technical Details
- Frontend: React 18.2.0
- Backend: Express.js with MySQL database
- Authentication: JWT (JSON Web Tokens)
- Database: MySQL with proper schema and migrations
- API endpoints for all features
- CORS enabled for cross-origin requests

### Security
- Password hashing with bcrypt
- JWT token-based authentication
- Protected API routes
- Role-based access control
- Input validation

### Database
- Users table with role support
- Typing results table with comprehensive statistics
- Foreign key relationships
- Indexes for performance

## [Unreleased]

### Planned Features
- User profile customization
- Test result export (CSV/PDF)
- Advanced statistics and analytics
- Social features (sharing results)
- Custom text input for typing tests
- Multi-language support
- Theme customization options

