-- Dog Trainers Directory Database Setup
-- Run these commands in your Supabase SQL Editor

-- Create pending_trainers table for form submissions
CREATE TABLE IF NOT EXISTS pending_trainers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  suburb TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  description TEXT NOT NULL,
  categories TEXT[],
  match_tags TEXT[],
  profile_image TEXT,
  why_choose_me TEXT,
  social_links JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trainers table for approved listings
CREATE TABLE IF NOT EXISTS trainers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  suburb TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  description TEXT NOT NULL,
  categories TEXT[],
  match_tags TEXT[],
  profile_image TEXT,
  why_choose_me TEXT,
  social_links JSONB,
  slug TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'approved',
  payment_status TEXT DEFAULT 'pending_standard' CHECK (payment_status IN ('pending_standard', 'paid_standard', 'expired_standard')),
  premium_status TEXT DEFAULT 'inactive' CHECK (premium_status IN ('inactive', 'active', 'cancelled')),
  stripe_customer_id TEXT,
  stripe_standard_subscription_id TEXT,
  stripe_premium_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create other necessary tables
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  featured_image TEXT,
  tags TEXT[],
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wagging_wisdom (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tip TEXT NOT NULL,
  author TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE pending_trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE wagging_wisdom ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- pending_trainers: Allow anonymous inserts (form submissions)
CREATE POLICY "Allow anonymous inserts on pending_trainers" ON pending_trainers
  FOR INSERT TO anon
  WITH CHECK (true);

-- trainers: Allow anonymous reads for approved trainers
CREATE POLICY "Allow anonymous reads on trainers" ON trainers
  FOR SELECT TO anon
  USING (status = 'approved');

-- newsletter_subscribers: Allow anonymous inserts
CREATE POLICY "Allow anonymous inserts on newsletter" ON newsletter_subscribers
  FOR INSERT TO anon
  WITH CHECK (true);

-- contact_messages: Allow anonymous inserts
CREATE POLICY "Allow anonymous inserts on contact" ON contact_messages
  FOR INSERT TO anon
  WITH CHECK (true);

-- feedback: Allow anonymous inserts
CREATE POLICY "Allow anonymous inserts on feedback" ON feedback
  FOR INSERT TO anon
  WITH CHECK (true);

-- blog_posts: Allow anonymous reads for published posts
CREATE POLICY "Allow anonymous reads on blog_posts" ON blog_posts
  FOR SELECT TO anon
  USING (published = true);

-- wagging_wisdom: Allow anonymous reads
CREATE POLICY "Allow anonymous reads on wagging_wisdom" ON wagging_wisdom
  FOR SELECT TO anon
  USING (true);

-- Admin policies (for authenticated users)
CREATE POLICY "Allow authenticated reads on pending_trainers" ON pending_trainers
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated operations on trainers" ON trainers
  FOR ALL TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated deletes on pending_trainers" ON pending_trainers
  FOR DELETE TO authenticated
  USING (true);

-- Insert some sample data
INSERT INTO wagging_wisdom (tip, author) VALUES
  ('Consistency is key in dog training. Use the same commands and rewards every time.', 'Melbourne Dog Training Experts'),
  ('Short, frequent training sessions (5-10 minutes) are more effective than long ones.', 'Professional Trainers Network'),
  ('Always end training sessions on a positive note with a successful command.', 'Positive Reinforcement Specialists'),
  ('Reward good behavior immediately - timing is everything in dog training.', 'Canine Behavior Institute'),
  ('Patience and persistence will get you further than frustration ever will.', 'Melbourne Pet Behaviorists');

INSERT INTO blog_posts (title, slug, excerpt, content, author, tags, published) VALUES
  (
    'Starting Your Puppy Training Journey',
    'starting-puppy-training-journey',
    'Essential tips for new puppy owners in Melbourne to start training early and build strong foundations.',
    'Getting a new puppy is exciting, but it can also be overwhelming. The key to raising a well-behaved dog starts with early training and socialization...',
    'Sarah Mitchell',
    ARRAY['puppy-training', 'basics', 'new-owners'],
    true
  ),
  (
    'Dealing with Separation Anxiety in Dogs',
    'dealing-with-separation-anxiety',
    'Practical strategies to help your dog feel calm and secure when left alone.',
    'Separation anxiety is one of the most common behavioral issues dog owners face in Melbourne. Understanding the signs and implementing proper training techniques can make a huge difference...',
    'Dr. James Chen',
    ARRAY['anxiety', 'behavior', 'training'],
    true
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trainers_suburb ON trainers(suburb);
CREATE INDEX IF NOT EXISTS idx_trainers_categories ON trainers USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_trainers_slug ON trainers(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);

-- Add sample trainers (optional - remove this section if you want to start with an empty directory)
INSERT INTO trainers (name, suburb, email, phone, website, description, categories, match_tags, slug, status) VALUES
  (
    'Melbourne Puppy School',
    'Richmond',
    'info@melbournepuppyschool.com.au',
    '(03) 9421 1234',
    'https://melbournepuppyschool.com.au',
    'Specializing in puppy socialization and basic obedience training for dogs under 12 months. Our positive reinforcement methods help build confidence and good habits from day one.',
    ARRAY['puppy-training'],
    ARRAY['socialization', 'basic-commands', 'house-training'],
    'melbourne-puppy-school',
    'approved'
  ),
  (
    'Calm Canine Behaviorists',
    'Fitzroy',
    'hello@calmcanine.com.au',
    '(03) 9876 5432',
    'https://calmcanine.com.au',
    'Expert in anxiety and stress management for reactive dogs. We use science-based methods to help nervous dogs build confidence and live happier lives.',
    ARRAY['anxiety-stress-management', 'behaviour-obedience'],
    ARRAY['anxiety', 'fear', 'reactivity', 'confidence'],
    'calm-canine-behaviorists',
    'approved'
  );

-- Migration: Add payment and premium status columns to existing tables
-- Run these ALTER statements if the trainers table already exists without these columns

ALTER TABLE trainers 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending_standard' CHECK (payment_status IN ('pending_standard', 'paid_standard', 'expired_standard'));

ALTER TABLE trainers 
ADD COLUMN IF NOT EXISTS premium_status TEXT DEFAULT 'inactive' CHECK (premium_status IN ('inactive', 'active', 'cancelled'));

ALTER TABLE trainers 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

ALTER TABLE trainers 
ADD COLUMN IF NOT EXISTS stripe_standard_subscription_id TEXT;

ALTER TABLE trainers
ADD COLUMN IF NOT EXISTS stripe_premium_subscription_id TEXT;

-- Add date tracking columns for subscription periods
ALTER TABLE trainers
ADD COLUMN IF NOT EXISTS standard_start_date TIMESTAMP WITH TIME ZONE;

ALTER TABLE trainers
ADD COLUMN IF NOT EXISTS standard_end_date TIMESTAMP WITH TIME ZONE;

ALTER TABLE trainers
ADD COLUMN IF NOT EXISTS premium_start_date TIMESTAMP WITH TIME ZONE;

ALTER TABLE trainers
ADD COLUMN IF NOT EXISTS premium_end_date TIMESTAMP WITH TIME ZONE;

-- Verify the setup
SELECT 'Tables created successfully!' as status;
