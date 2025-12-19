# Stripe Lite System

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/pes2ug22cs153s-projects/v0-stripe-lite-system)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/vWSj4nC9AVD)

## Overview

A complete subscription and billing management system built with Next.js 16, featuring user authentication, subscription plans, invoicing, admin dashboard, and Row Level Security.

## Features

- **User Authentication**: Secure JWT-based authentication with bcrypt password hashing
- **Subscription Management**: Multiple subscription plans with different billing cycles
- **Invoice System**: Automated invoice generation and payment processing
- **Admin Dashboard**: Revenue metrics, subscription management, and analytics
- **Row Level Security**: Database-level security policies for data protection
- **Admin Access Control**: Secure admin registration with secret key

## Deployment

Your project is live at:

**[https://vercel.com/pes2ug22cs153s-projects/v0-stripe-lite-system](https://vercel.com/pes2ug22cs153s-projects/v0-stripe-lite-system)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/vWSj4nC9AVD](https://v0.app/chat/vWSj4nC9AVD)

## Security Setup for Production

### 1. Set Environment Variables

In your Vercel project settings, add these environment variables:

- `NEON_DATABASE_URL` - Your Neon database connection string (already set)
- `JWT_SECRET` - Generate a secure random string (e.g., use `openssl rand -base64 32`)
- `ADMIN_SECRET_KEY` - Create a strong secret key for admin registration

### 2. Enable Row Level Security

After deploying, run this SQL script in your Neon database console:

1. Go to your Neon dashboard
2. Open the SQL Editor
3. Copy and paste the contents of `scripts/04-enable-rls.sql`
4. Execute the script to enable RLS and create security policies

### 3. Create Admin Account

**Option 1: First User (Automatic)**
- The first user to sign up automatically becomes an admin

**Option 2: Admin Secret Key**
- During signup, click "Have an admin access key?"
- Enter your `ADMIN_SECRET_KEY` value
- Complete registration to get admin privileges

## Security Features

### Row Level Security (RLS)

All database tables have RLS enabled with policies that:

- **Users**: Can only view/edit their own data (admins can view all)
- **Subscription Plans**: Public read, admin-only write
- **Subscriptions**: Users see only their subscriptions, admins see all
- **Invoices**: Users see only their invoices, admins see all
- **Payments**: Restricted to related invoice owners and admins

### Authentication

- JWT tokens with HTTP-only cookies
- Bcrypt password hashing
- Middleware-protected routes
- Role-based access control (admin/user)

## Project Structure

```
├── app/
│   ├── actions/          # Server actions for auth, plans, subscriptions, invoices
│   ├── admin/            # Admin dashboard pages
│   ├── dashboard/        # User dashboard
│   ├── plans/            # Plan selection page
│   └── login|signup/     # Authentication pages
├── components/           # Reusable UI components
├── lib/                  # Utilities (auth, db connection)
├── scripts/              # Database migration scripts
└── middleware.ts         # Route protection
```

## Admin Features

- Revenue dashboard with metrics and charts
- Manage subscription plans (CRUD operations)
- View and manage all user subscriptions
- Invoice management and payment processing
- User management

## User Features

- Browse and subscribe to plans
- View active subscriptions
- Pause/resume/cancel subscriptions
- View billing history
- Pay invoices online

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Neon PostgreSQL with Row Level Security
- **Authentication**: JWT + HTTP-only cookies
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Charts**: Recharts

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository
