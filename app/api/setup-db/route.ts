import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST() {
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create subscription_plans table
    await sql`
      CREATE TABLE IF NOT EXISTS subscription_plans (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        billing_cycle VARCHAR(50) NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
        features TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create user_subscriptions table
    await sql`
      CREATE TABLE IF NOT EXISTS user_subscriptions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        plan_id INTEGER NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'expired')),
        start_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        end_date TIMESTAMP,
        next_billing_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE RESTRICT
      )
    `

    // Create invoices table
    await sql`
      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        subscription_id INTEGER NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
        due_date TIMESTAMP NOT NULL,
        paid_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id) ON DELETE CASCADE
      )
    `

    // Create payment_transactions table
    await sql`
      CREATE TABLE IF NOT EXISTS payment_transactions (
        id SERIAL PRIMARY KEY,
        invoice_id INTEGER NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('payment', 'refund')),
        transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
      )
    `

    // Create subscription_history table
    await sql`
      CREATE TABLE IF NOT EXISTS subscription_history (
        id SERIAL PRIMARY KEY,
        subscription_id INTEGER NOT NULL,
        action VARCHAR(100) NOT NULL,
        old_status VARCHAR(50),
        new_status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id) ON DELETE CASCADE
      )
    `

    // Create indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`
    await sql`CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status)`
    await sql`CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id)`
    await sql`CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status)`

    // Insert sample subscription plans
    const planCount = await sql`SELECT COUNT(*) as count FROM subscription_plans`

    if (planCount[0].count === 0) {
      await sql`
        INSERT INTO subscription_plans (name, description, price, billing_cycle, features)
        VALUES 
          ('Basic', 'Perfect for individuals getting started', 9.99, 'monthly', '["5 Projects", "10GB Storage", "Basic Support", "API Access"]'),
          ('Basic', 'Perfect for individuals getting started (Annual)', 99.99, 'yearly', '["5 Projects", "10GB Storage", "Basic Support", "API Access", "2 Months Free"]'),
          ('Pro', 'For professionals and small teams', 29.99, 'monthly', '["Unlimited Projects", "100GB Storage", "Priority Support", "Advanced API", "Team Collaboration"]'),
          ('Pro', 'For professionals and small teams (Annual)', 299.99, 'yearly', '["Unlimited Projects", "100GB Storage", "Priority Support", "Advanced API", "Team Collaboration", "2 Months Free"]'),
          ('Enterprise', 'For large organizations', 99.99, 'monthly', '["Everything in Pro", "Unlimited Storage", "24/7 Support", "Custom Integrations", "SLA Guarantee", "Dedicated Account Manager"]'),
          ('Enterprise', 'For large organizations (Annual)', 999.99, 'yearly', '["Everything in Pro", "Unlimited Storage", "24/7 Support", "Custom Integrations", "SLA Guarantee", "Dedicated Account Manager", "2 Months Free"]')
      `
    }

    return NextResponse.json({
      success: true,
      message: "Database setup completed successfully!",
    })
  } catch (error) {
    console.error("[v0] Database setup error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Setup failed" },
      { status: 500 },
    )
  }
}
