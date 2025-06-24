#!/bin/bash

# 🚀 Dog Trainers Directory - Quick Deployment Setup
# This script helps you set up your Supabase database and prepare for Vercel deployment

echo "🐾 Dog Trainers Directory - Deployment Setup"
echo "============================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

# Create .env file template if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env template..."
    cat > .env << EOF
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Replace with your actual Supabase project credentials
# Get these from: https://supabase.com/dashboard > Your Project > Settings > API
EOF
    echo "✅ Created .env template"
    echo "⚠️  Please update .env with your actual Supabase credentials"
else
    echo "✅ .env file already exists"
fi

# Create Supabase migration file
mkdir -p supabase/migrations
cat > supabase/migrations/20250625000000_initial_schema.sql << 'EOF'
-- Dog Trainers Directory Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Trainers table (approved, public directory)
CREATE TABLE IF NOT EXISTS trainers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  suburb TEXT,
  description TEXT,
  categories TEXT[],
  profile_image_url TEXT,
  website TEXT,
  slug TEXT UNIQUE,
  review_count INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pending trainers table (awaiting approval)
CREATE TABLE IF NOT EXISTS pending_trainers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  suburb TEXT,
  description TEXT,
  categories TEXT[],
  website TEXT,
  is_flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update requests table
CREATE TABLE IF NOT EXISTS update_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trainer_name TEXT NOT NULL,
  trainer_email TEXT NOT NULL,
  current_info TEXT,
  requested_changes TEXT NOT NULL,
  admin_notes TEXT,
  is_reviewed BOOLEAN DEFAULT FALSE,
  reviewed_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE update_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Public read access for trainers (directory is public)
CREATE POLICY "Public read access for trainers" ON trainers
  FOR SELECT USING (true);

-- Allow anonymous inserts for forms
CREATE POLICY "Allow anonymous inserts" ON pending_trainers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts" ON update_requests
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts" ON contact_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS trainers_suburb_idx ON trainers(suburb);
CREATE INDEX IF NOT EXISTS trainers_categories_idx ON trainers USING gin(categories);
CREATE INDEX IF NOT EXISTS trainers_slug_idx ON trainers(slug);
CREATE INDEX IF NOT EXISTS pending_trainers_created_at_idx ON pending_trainers(created_at);
CREATE INDEX IF NOT EXISTS newsletter_email_idx ON newsletter_subscribers(email);

-- Insert sample data (optional)
INSERT INTO trainers (name, email, suburb, description, categories, slug) VALUES
('Pawsitive Steps Training', 'contact@pawsivesteps.com.au', 'Richmond', 'Specialized in puppy training and basic obedience', ARRAY['Puppy Training', 'Basic Obedience'], 'pawsitive-steps-training'),
('Calm Canine Co.', 'hello@calmcanine.com.au', 'Fitzroy', 'Expert in anxiety management and reactive dog training', ARRAY['Anxiety Management', 'Reactive Dogs'], 'calm-canine-co'),
('Melbourne Dog Gurus', 'info@melbdoggurus.com.au', 'South Yarra', 'Professional behavior modification specialists', ARRAY['Behavior Training', 'Advanced Training'], 'melbourne-dog-gurus')
ON CONFLICT (slug) DO NOTHING;
EOF

echo "✅ Created Supabase migration file"
echo ""

echo "🚀 Next Steps:"
echo "=============="
echo "1. 📊 Set up Supabase:"
echo "   - Go to https://supabase.com and create a new project"
echo "   - Copy your project URL and anon key to .env file"
echo "   - Run the SQL migration in Supabase > SQL Editor"
echo ""
echo "2. 🌐 Deploy to Vercel:"
echo "   - Go to https://vercel.com and import your GitHub repo"
echo "   - Add environment variables from your .env file"
echo "   - Deploy and get your live URL"
echo ""
echo "3. 🔗 Configure Domain (optional):"
echo "   - Add custom domain in Vercel dashboard"
echo "   - Update DNS records as instructed"
echo ""
echo "📁 Files created:"
echo "   - .env (template - update with your credentials)"
echo "   - supabase/migrations/20250625000000_initial_schema.sql"
echo ""
echo "🎉 You're ready to deploy!"
