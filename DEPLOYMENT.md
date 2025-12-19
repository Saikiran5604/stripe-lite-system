# Deployment Guide - Stripe Lite System

## Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/stripe-lite-system)

## Prerequisites

1. **GitHub Account** - To host your repository
2. **Vercel Account** - For hosting (connected to GitHub)
3. **Neon Database** - PostgreSQL database (free tier available)

## Step-by-Step Deployment

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Stripe Lite System"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/stripe-lite-system.git
git push -u origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure environment variables (see below)
5. Click "Deploy"

### 3. Configure Environment Variables in Vercel

Go to Project Settings → Environment Variables and add:

| Variable | Value | Description |
|----------|-------|-------------|
| `NEON_DATABASE_URL` | Your Neon connection string | From Neon dashboard |
| `JWT_SECRET` | Random secure string | Generate with `openssl rand -base64 32` |
| `ADMIN_SECRET_KEY` | Your admin key | Strong password for admin access |

**Getting NEON_DATABASE_URL:**
1. Go to [neon.tech](https://neon.tech)
2. Create a new project (or use existing)
3. Copy the connection string from dashboard
4. Format: `postgresql://user:password@host/database?sslmode=require`

### 4. Initialize Database

After deployment:

1. Visit your deployed app URL
2. Click "Setup Database" on the first screen
3. Wait for tables to be created
4. You're ready to go!

### 5. Create Admin Account

**First User Method:**
- The first person to sign up automatically becomes admin

**Admin Secret Key Method:**
- During signup, click "Have an admin access key?"
- Enter your `ADMIN_SECRET_KEY`
- Complete registration

## Database Migrations

If you need to run migrations manually:

1. Go to your Neon dashboard
2. Open SQL Editor
3. Run scripts from the `scripts/` folder in order:
   - `01-create-schema.sql` - Creates all tables
   - `02-seed-data.sql` - Adds sample subscription plans
   - `05-add-role-column.sql` - Adds role column (if missing)
   - `06-fix-schema-mismatches.sql` - Fixes any column name issues

## Troubleshooting

### Database Connection Issues

**Error: "Failed to fetch" or "Database connection failed"**

Solution:
- Verify `NEON_DATABASE_URL` is set correctly in Vercel
- Check Neon database is running (not suspended)
- Ensure connection string includes `?sslmode=require`

### "Expected string, received null" on Signup

Solution:
- This has been fixed in the latest version
- Redeploy from Vercel dashboard

### Setup Page Shows Every Time

Solution:
- Database tables may not be created
- Click "Setup Database" button once
- Refresh the page

### Admin Access Not Working

Solution:
- Verify `ADMIN_SECRET_KEY` environment variable is set
- Or manually update role in database:
  ```sql
  UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
  ```

## Vercel Configuration

The project includes:
- `next.config.mjs` - Next.js configuration
- `vercel.json` - Vercel-specific settings (auto-generated)

## Security Checklist

Before going live:

- [ ] Change `JWT_SECRET` to a secure random string
- [ ] Set a strong `ADMIN_SECRET_KEY`
- [ ] Review database RLS policies
- [ ] Test all authentication flows
- [ ] Verify admin access control works
- [ ] Check subscription creation and payments
- [ ] Test invoice generation

## Performance Optimization

The app uses:
- Server Components by default (faster initial load)
- Database connection pooling (via Neon)
- Optimized SQL queries with indexes
- Static assets from Vercel CDN

## Monitoring

View logs in Vercel:
1. Go to your project dashboard
2. Click "Deployments"
3. Select deployment → "View Function Logs"

## Scaling Considerations

**Free Tier Limits:**
- Neon: 0.5GB storage, 3GB data transfer
- Vercel: 100GB bandwidth, 100 function executions/day

**Upgrade When:**
- You exceed 1000 users
- Database size > 0.5GB
- Need more function executions

## Support

For issues:
1. Check [GitHub Issues](https://github.com/YOUR_USERNAME/stripe-lite-system/issues)
2. Review deployment logs in Vercel
3. Check Neon database logs

## Local Development

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/stripe-lite-system.git
cd stripe-lite-system

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Run development server
npm run dev

# Open http://localhost:3000
```

## Production Checklist

Before announcing your app:

- [ ] All environment variables set
- [ ] Database initialized
- [ ] Admin account created
- [ ] Test user signup/login
- [ ] Test subscription flow
- [ ] Test invoice payments
- [ ] Verify admin dashboard
- [ ] Check mobile responsiveness
- [ ] Test in different browsers
- [ ] Set up custom domain (optional)

## Custom Domain

To add a custom domain:
1. Go to Vercel project settings
2. Click "Domains"
3. Add your domain
4. Update DNS records as instructed
5. Wait for SSL certificate (automatic)

Your Stripe Lite System is now live! 🎉
