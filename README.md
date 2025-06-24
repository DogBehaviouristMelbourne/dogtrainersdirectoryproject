# 🐾 Dog Trainers Directory Melbourne

A behaviour-first, community-powered directory for certified dog trainers and services in Melbourne, Australia.

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

