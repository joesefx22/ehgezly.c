# Project 1 - Authentication System 🛡️

A complete, production-ready authentication system with role-based access control, built with Next.js 14, Prisma, and PostgreSQL.

## Features ✨

### 🔐 Authentication
- Email/Password Registration & Login
- Email Verification
- Password Reset via Email
- JWT-based Authentication
- HTTP-only Cookies for Security
- Refresh Token Rotation

### 🛡️ Security
- Password Hashing with bcrypt
- Rate Limiting on Auth Endpoints
- CSRF Protection
- Security Headers (CSP, HSTS, etc.)
- Audit Logging
- Account Lockout after Failed Attempts
- Password Policy Enforcement

### 👥 Role-Based Access Control
- Four User Roles: PLAYER, OWNER, EMPLOYEE, ADMIN
- Automatic Redirect to Role-Specific Dashboard
- Middleware Protection for All Routes
- API-Level Role Verification

### 📊 Database
- PostgreSQL with Prisma ORM
- Full Audit Trail
- Token Management for Email Verification & Password Reset
- Session Management

## Quick Start 🚀

### 1. Prerequisites
- Node.js 18+ 
- PostgreSQL
- npm or yarn

### 2. Installation
```bash
# Clone and install
git clone <repository>
cd project-1-auth
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your values

# Set up database
npm run db:push
npm run db:seed

# Run development server
npm run dev
