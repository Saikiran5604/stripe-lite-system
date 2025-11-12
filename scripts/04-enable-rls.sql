-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

-- Users table policies
-- Users can only view their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (id = current_setting('app.current_user_id', TRUE)::INTEGER);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (id = current_setting('app.current_user_id', TRUE)::INTEGER);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = current_setting('app.current_user_id', TRUE)::INTEGER AND role = 'admin'
    )
  );

-- Subscription Plans policies
-- Everyone can view active plans
CREATE POLICY "Anyone can view active plans" ON subscription_plans
  FOR SELECT USING (is_active = TRUE);

-- Only admins can modify plans
CREATE POLICY "Admins can manage plans" ON subscription_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = current_setting('app.current_user_id', TRUE)::INTEGER AND role = 'admin'
    )
  );

-- User Subscriptions policies
-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
  FOR SELECT USING (user_id = current_setting('app.current_user_id', TRUE)::INTEGER);

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions" ON user_subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = current_setting('app.current_user_id', TRUE)::INTEGER AND role = 'admin'
    )
  );

-- Users can create their own subscriptions
CREATE POLICY "Users can create own subscriptions" ON user_subscriptions
  FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id', TRUE)::INTEGER);

-- Users can update their own subscriptions
CREATE POLICY "Users can update own subscriptions" ON user_subscriptions
  FOR UPDATE USING (user_id = current_setting('app.current_user_id', TRUE)::INTEGER);

-- Admins can manage all subscriptions
CREATE POLICY "Admins can manage all subscriptions" ON user_subscriptions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = current_setting('app.current_user_id', TRUE)::INTEGER AND role = 'admin'
    )
  );

-- Invoices policies
-- Users can view their own invoices
CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT USING (user_id = current_setting('app.current_user_id', TRUE)::INTEGER);

-- Admins can view all invoices
CREATE POLICY "Admins can view all invoices" ON invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = current_setting('app.current_user_id', TRUE)::INTEGER AND role = 'admin'
    )
  );

-- System can create invoices (for subscription creation)
CREATE POLICY "System can create invoices" ON invoices
  FOR INSERT WITH CHECK (TRUE);

-- Users can update their own invoices (for payment)
CREATE POLICY "Users can update own invoices" ON invoices
  FOR UPDATE USING (user_id = current_setting('app.current_user_id', TRUE)::INTEGER);

-- Admins can manage all invoices
CREATE POLICY "Admins can manage all invoices" ON invoices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = current_setting('app.current_user_id', TRUE)::INTEGER AND role = 'admin'
    )
  );

-- Payment Transactions policies
-- Users can view transactions for their invoices
CREATE POLICY "Users can view own payment transactions" ON payment_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM invoices WHERE invoices.id = payment_transactions.invoice_id 
      AND invoices.user_id = current_setting('app.current_user_id', TRUE)::INTEGER
    )
  );

-- Admins can view all transactions
CREATE POLICY "Admins can view all transactions" ON payment_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = current_setting('app.current_user_id', TRUE)::INTEGER AND role = 'admin'
    )
  );

-- System can create transactions
CREATE POLICY "System can create transactions" ON payment_transactions
  FOR INSERT WITH CHECK (TRUE);

-- Admins can manage all transactions
CREATE POLICY "Admins can manage all transactions" ON payment_transactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = current_setting('app.current_user_id', TRUE)::INTEGER AND role = 'admin'
    )
  );

-- Subscription History policies
-- Users can view history for their subscriptions
CREATE POLICY "Users can view own subscription history" ON subscription_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_subscriptions WHERE user_subscriptions.id = subscription_history.subscription_id 
      AND user_subscriptions.user_id = current_setting('app.current_user_id', TRUE)::INTEGER
    )
  );

-- Admins can view all history
CREATE POLICY "Admins can view all history" ON subscription_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = current_setting('app.current_user_id', TRUE)::INTEGER AND role = 'admin'
    )
  );

-- System can create history records
CREATE POLICY "System can create history" ON subscription_history
  FOR INSERT WITH CHECK (TRUE);

-- Admins can manage all history
CREATE POLICY "Admins can manage all history" ON subscription_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = current_setting('app.current_user_id', TRUE)::INTEGER AND role = 'admin'
    )
  );
