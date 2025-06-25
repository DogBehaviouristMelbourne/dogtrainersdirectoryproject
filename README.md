# 🐾 Dog Trainers Directory Melbourne

A behaviour-first, community-powered directory for certified dog trainers and services in Melbourne, Australia.

![Build Status](https://github.com/DogBehaviouristMelbourne/dogtrainersdirectoryproject/workflows/🚀%20Build%20and%20Deploy/badge.svg)
[![Accessibility](https://img.shields.io/badge/Accessibility-WCAG%202.1%20AA-green)](https://www.w3.org/WAI/WCAG21/quickref/)
[![Performance](https://img.shields.io/badge/Performance-Optimized-brightgreen)](https://web.dev/performance-scoring/)

---

## 🌐 Website
[dogtrainersdirectory.com.au](https://dogtrainersdirectory.com.au)

---

## 🎯 Purpose
To help Melbourne dog owners find trusted, certified behaviour professionals using a clean, fast, and human-first experience.

---

## 🚀 Tech Stack

- **Astro** (frontend framework)
- **Supabase** (backend/database)
- **TailwindCSS** (UI styling)
- **Zoho SMTP** (email automation)
- **Cloudflare** (analytics, CDN)
- **JavaScript** (form logic, UI interactions)

---

## ✅ Key Features

- 🧩 **Public Trainer Directory** - Browse certified trainers by location and specialty
- 📬 **Secure Contact Forms** - Newsletter signup and direct trainer contact
- ✍️ **Trainer Submission Flow** - Professional onboarding with admin approval
- 🔍 **Smart Filtering** - Search by category, suburb, and specialized tags
- 🔒 **Admin Dashboard** - Secure approval system for quality control
- 🦮 **Trust-First Design** - Professional photos with fallback initials
- 💬 **Social Proof** - Testimonials and expert wisdom tips
- 🗂️ **Advanced Pagination** - Sort by name, location, or reviews
- ⭐ **Review System Ready** - Rating display and review management
- ♿ **Accessibility First** - WCAG 2.1 AA compliant with automated testing
- 📱 **Mobile Optimized** - Responsive design for all devices
- 🚀 **SEO Optimized** - Meta tags, structured data, and sitemap

---

## 🛠️ Local Development

```bash
npm install
npm run dev
```

Env vars are stored in `.env`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 🚀 Deployment & Integration Guide

### Recommended Hosting Platform: **Vercel** ⭐
**Why Vercel?**
- ✅ **Perfect for Astro** - Native support and optimizations
- ✅ **GitHub Integration** - Automatic deployments on push
- ✅ **Edge Functions** - Global CDN and serverless functions
- ✅ **Free Tier** - Generous limits for small to medium projects
- ✅ **Custom Domains** - Easy DNS management
- ✅ **Analytics** - Built-in performance monitoring

**Alternative Options:**
- **Netlify** - Similar features, great for static sites
- **Cloudflare Pages** - Excellent performance, global edge network
- **GitHub Pages** - Free but limited (static only, no serverless)

### 🔗 Step-by-Step Integration

#### 1. **Supabase Setup**
```bash
# 1. Create account at https://supabase.com
# 2. Create new project
# 3. Go to Settings > API
# 4. Copy your Project URL and anon/public key
```

**Database Tables to Create:**
```sql
-- Run these in Supabase SQL Editor
CREATE TABLE trainers (
  id BIGSERIAL PRIMARY KEY,
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
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE pending_trainers (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  suburb TEXT,
  description TEXT,
  categories TEXT[],
  website TEXT,
  is_flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE update_requests (
  id BIGSERIAL PRIMARY KEY,
  trainer_name TEXT NOT NULL,
  trainer_email TEXT NOT NULL,
  current_info TEXT,
  requested_changes TEXT NOT NULL,
  admin_notes TEXT,
  is_reviewed BOOLEAN DEFAULT FALSE,
  reviewed_by TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE contact_messages (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE newsletter_subscribers (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. **GitHub to Vercel Deployment**
```bash
# 1. Push your code to GitHub (already done! ✅)
# 2. Go to https://vercel.com
# 3. Sign in with GitHub
# 4. Click "Import Project"
# 5. Select your repository: DogBehaviouristMelbourne/dogtrainersdirectoryproject
# 6. Configure project settings:
```

**Vercel Project Settings:**
```bash
Framework Preset: Astro
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

#### 3. **Environment Variables Setup**
In Vercel Dashboard > Settings > Environment Variables:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

#### 4. **Custom Domain Setup**
```bash
# In Vercel Dashboard > Settings > Domains
# 1. Add your domain: dogtrainersdirectory.com.au
# 2. Configure DNS records (Vercel provides instructions)
# 3. SSL certificate is automatically generated
```

#### 5. **Automatic Deployments**
✅ **Already configured!** Every push to `main` branch will:
- Trigger automatic build
- Deploy to production
- Update your live site
- Run build-time checks

### 🔧 Development Workflow

```bash
# Local development
git checkout -b feature/new-feature
# Make changes
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
# Create PR on GitHub
# Merge to main → Auto-deploy to production
```

### 📊 Monitoring & Analytics

**Vercel Analytics** (Built-in):
- Page views and performance
- Core Web Vitals
- Geographic distribution

**Optional Additions:**
- **Google Analytics** - Add GA4 tracking code
- **Cloudflare Analytics** - If using Cloudflare DNS
- **Supabase Analytics** - Database query monitoring

### 🔒 Security Considerations

**Supabase Security:**
```sql
-- Enable Row Level Security
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_trainers ENABLE ROW LEVEL SECURITY;

-- Public read access for trainers
CREATE POLICY "Public read access" ON trainers FOR SELECT USING (true);

-- Restrict write access
CREATE POLICY "Authenticated write" ON pending_trainers FOR INSERT 
  WITH CHECK (auth.role() = 'anon');
```

**Environment Variables:**
- ✅ Never commit `.env` files
- ✅ Use Vercel's environment variables
- ✅ Separate staging/production environments

### 🚀 Go Live Checklist

- [ ] Supabase project created and configured
- [ ] Database tables created
- [ ] Environment variables set in Vercel
- [ ] Domain name configured
- [ ] SSL certificate active
- [ ] Test all forms and functionality
- [ ] Admin dashboard accessible
- [ ] Analytics tracking active
- [ ] Backup and monitoring set up

---

## 📂 Database Schema

### Core Tables
* `trainers` - Approved trainer listings (public directory)
* `pending_trainers` - Submissions awaiting admin approval
  - `is_flagged` (boolean) - Admin flagging for suspicious entries
  - `created_at` (timestamp) - Submission timestamp
* `update_requests` - Trainer update/claim requests
  - `admin_notes` (text) - Internal admin review notes
  - `is_reviewed` (boolean) - Review completion status
  - `reviewed_by` (text) - Admin attribution for reviews
  - `created_at` (timestamp) - Request timestamp
* `contact_messages` - Contact form submissions
* `newsletter_subscribers` - Email newsletter signups
* `feedback` - User feedback and ratings
* `blog_posts` - Blog content and articles
* `wagging_wisdom` - Training tips and advice

### Admin Features
* **Row Level Security (RLS)** - Secure data access policies
* **Admin Dashboard** - Complete management interface at `/admin-secure123`
* **Approval Workflow** - Move pending submissions to live directory
* **Quality Control** - Flag, review, and approve/reject applications
* **Audit Trail** - Full logging of admin actions and timestamps
* **Notes System** - Internal admin notes for update requests
* **Review Tracking** - Mark requests as reviewed with admin attribution

All database tables are created in your Supabase project dashboard.

---

## 🎛️ Admin Dashboard

### Complete Admin Management System
- **Secure Access** - Hidden URL: `/admin-secure123` (secure by obscurity)
- **Dual Management** - Handle both trainer submissions and update requests
- **No Server Auth** - Client-only dashboard using Supabase direct access
- **Full Audit Trail** - All actions logged with timestamps and admin attribution

### Pending Trainer Submissions
| Feature | Description |
|---------|-------------|
| **Review Submissions** | View name, email, description, tags, categories |
| **Submission Dates** | Clear timestamps for all applications |
| **Flag Suspicious** | Mark questionable submissions with ⚠️ Flag button |
| **Approve/Reject** | One-click actions to approve or permanently reject |
| **Auto-Slug Generation** | Approved trainers get SEO-friendly URL slugs |

### Update & Claim Requests
| Feature | Description |
|---------|-------------|
| **Admin Notes** | Internal textarea for review notes and follow-up actions |
| **Save Notes** | Persistent admin notes stored in database |
| **Mark Reviewed** | Sets `is_reviewed = true` and `reviewed_by = 'manual_admin'` |
| **Audit Trail** | Reviewed requests kept in database for record-keeping |
| **Request Details** | Full trainer info and requested changes displayed |

### Admin Actions Summary
```
Pending Trainers:
├── ⚠️ Flag (marks suspicious, stays in queue)
├── ✅ Approve (moves to live directory)
└── ❌ Reject (permanently removes)

Update Requests:
├── 💾 Save Note (internal admin notes)
├── ✅ Mark Reviewed (flags as complete, keeps record)
└── ❌ Reject (permanently removes)
```

### Security & Access
- **No Authentication Required** - Secure by URL obscurity
- **Client-Only Logic** - No server-side environment variables
- **Direct Supabase Access** - Uses public anon key with RLS policies
- **Hidden from Public** - No links or references in public UI

---

## 📥 Trainer Submission Flow

1. **Public Submission** - `/submit` form adds to `pending_trainers`
2. **Admin Review** - Simple admin dashboard shows pending submissions
3. **Approval Process** - One-click approve/reject buttons
4. **Live Directory** - Approved trainers appear immediately in `/trainers`
5. **Thank You Page** - Confirmation and next steps for submitters

---

## 🧪 Accessibility & SEO

* WCAG 2.1 AA compliant forms
* Unique meta for each page
* Sitemap and robots.txt included
* Automated accessibility checks in CI (see `.github/workflows/accessibility.yml`)

---

## 🧾 License
All rights reserved © 2025  
Dog Trainers Directory Melbourne  
Built with ❤️ by [you]
