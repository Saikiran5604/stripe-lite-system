# Contributing to Stripe Lite System

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/stripe-lite-system.git
   cd stripe-lite-system
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create `.env.local` from `.env.example` and add your values
5. Run development server:
   ```bash
   npm run dev
   ```

## Code Structure

```
├── app/              # Next.js App Router pages
│   ├── actions/      # Server Actions (database operations)
│   ├── admin/        # Admin dashboard routes
│   ├── api/          # API routes
│   └── dashboard/    # User dashboard
├── components/       # React components
├── lib/              # Utility functions
├── scripts/          # Database SQL scripts
└── middleware.ts     # Authentication middleware
```

## Making Changes

1. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes
3. Test thoroughly
4. Commit with clear messages:
   ```bash
   git commit -m "Add: Feature description"
   ```
5. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
6. Open a Pull Request

## Code Guidelines

- Use TypeScript for type safety
- Follow existing code style
- Add comments for complex logic
- Test all database operations
- Ensure responsive design
- Handle errors gracefully

## Testing Changes

Before submitting:

1. Test user signup/login
2. Test subscription operations
3. Test admin dashboard
4. Check mobile view
5. Verify no console errors

## Areas for Contribution

- **Features**: Payment integrations, email notifications
- **UI/UX**: Improved designs, animations
- **Security**: Enhanced RLS policies, audit logs
- **Testing**: Unit tests, integration tests
- **Documentation**: Tutorials, API docs
- **Performance**: Query optimization, caching

## Questions?

Open an issue for discussion before starting major changes.

Thank you for contributing! 🚀
