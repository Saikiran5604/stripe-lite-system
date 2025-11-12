-- Seed data for Stripe-Lite system

-- Insert sample subscription plans
INSERT INTO subscription_plans (name, description, price, billing_cycle, features) VALUES
  ('Basic', 'Perfect for individuals getting started', 9.99, 'monthly', 
   '{"features": ["Up to 5 projects", "1GB storage", "Email support"]}'::jsonb),
  ('Pro', 'For professionals who need more power', 29.99, 'monthly', 
   '{"features": ["Unlimited projects", "10GB storage", "Priority support", "Advanced analytics"]}'::jsonb),
  ('Enterprise', 'For teams and large organizations', 99.99, 'monthly', 
   '{"features": ["Unlimited projects", "100GB storage", "24/7 phone support", "Custom integrations", "Dedicated account manager"]}'::jsonb),
  ('Basic Yearly', 'Perfect for individuals - save with yearly billing', 99.99, 'yearly', 
   '{"features": ["Up to 5 projects", "1GB storage", "Email support"]}'::jsonb),
  ('Pro Yearly', 'For professionals - save with yearly billing', 299.99, 'yearly', 
   '{"features": ["Unlimited projects", "10GB storage", "Priority support", "Advanced analytics"]}'::jsonb),
  ('Enterprise Yearly', 'For teams - save with yearly billing', 999.99, 'yearly', 
   '{"features": ["Unlimited projects", "100GB storage", "24/7 phone support", "Custom integrations", "Dedicated account manager"]}'::jsonb)
ON CONFLICT DO NOTHING;
