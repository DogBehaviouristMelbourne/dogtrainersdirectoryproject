# Admin Dashboard Setup Guide

## Overview
The admin dashboard allows you to review and approve/reject pending trainer submissions. This ensures quality control and prevents spam while maintaining a professional directory.

## Setup Instructions

### 1. Environment Variables
Create a `.env` file in your project root with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ADMIN_KEY=your_secure_admin_password
```

**Important Security Notes:**
- Choose a strong, unique admin key (at least 20 characters)
- Never commit the `.env` file to version control
- Use different admin keys for staging and production

### 2. Supabase Database Schema

The admin system requires two tables in your Supabase database:

#### `pending_trainers` table:
```sql
CREATE TABLE pending_trainers (
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
```

#### `trainers` table:
```sql
CREATE TABLE trainers (
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Row Level Security (RLS)

Enable RLS on both tables and create policies:

```sql
-- Enable RLS
ALTER TABLE pending_trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts to pending_trainers (for form submissions)
CREATE POLICY "Allow anonymous inserts" ON pending_trainers
  FOR INSERT TO anon
  WITH CHECK (true);

-- Allow anonymous read access to trainers (for public directory)
CREATE POLICY "Allow anonymous reads" ON trainers
  FOR SELECT TO anon
  USING (status = 'approved');

-- Allow authenticated reads on pending_trainers (for admin dashboard)
CREATE POLICY "Allow authenticated reads" ON pending_trainers
  FOR SELECT TO authenticated
  USING (true);

-- Allow authenticated operations on trainers (for admin approval)
CREATE POLICY "Allow authenticated operations" ON trainers
  FOR ALL TO authenticated
  USING (true);
```

## Using the Admin Dashboard

### 1. Accessing the Dashboard
Navigate to: `your-domain.com/admin?key=your_admin_key`

**Example:** `https://dogtrainersdirectory.com/admin?key=mySecureAdminKey123`

### 2. Admin Dashboard Features

#### Pending Submissions View
- Lists all pending trainer submissions
- Shows complete trainer information including:
  - Contact details (name, email, phone, website)
  - Service categories and match tags
  - Profile image preview
  - Personal description and "why choose me" section
  - Social media links
  - Submission timestamp

#### Approval Process
1. **Review Submission**: Check all provided information for completeness and accuracy
2. **Verify Contact Details**: Ensure email and phone numbers are valid
3. **Check Website/Social Links**: Verify provided URLs are working
4. **Approve or Reject**:
   - **Approve**: Moves trainer to live directory with auto-generated slug
   - **Reject**: Permanently deletes the submission

#### What Happens When You Approve
1. Creates a URL-friendly slug from the trainer's name
2. Copies all data to the `trainers` table
3. Sets status to 'approved'
4. Removes the submission from `pending_trainers`
5. Trainer immediately appears in the public directory

#### What Happens When You Reject
1. Permanently deletes the submission
2. No notification is sent to the submitter
3. Action cannot be undone

### 3. Best Practices

#### Quality Control Checklist
- [ ] Contact information is complete and professional
- [ ] Description is well-written and informative
- [ ] Service categories match the trainer's expertise
- [ ] Website/social links are working and relevant
- [ ] Profile image is appropriate and professional
- [ ] No spam or inappropriate content

#### Security Practices
- Change admin key regularly
- Don't share admin access
- Always log out of admin sessions
- Monitor for unauthorized access attempts

### 4. Troubleshooting

#### Common Issues

**"Access Denied" Error**
- Check that admin key is correct
- Ensure key is included in URL: `/admin?key=your_key`
- Verify VITE_ADMIN_KEY in environment variables

**"Failed to fetch pending trainer data"**
- Check Supabase connection
- Verify database tables exist
- Check RLS policies are correctly configured

**Approval/Rejection Not Working**
- Check browser console for errors
- Verify Supabase permissions
- Ensure `authenticated` role has proper access

#### Database Connection Issues
1. Verify Supabase URL and API key in `.env`
2. Check that environment variables are properly loaded
3. Confirm database is accessible from your domain

### 5. Monitoring and Maintenance

#### Regular Tasks
- Review pending submissions within 24-48 hours
- Monitor for spam or inappropriate submissions
- Update admin key periodically for security

#### Analytics
Consider tracking:
- Number of submissions per week
- Approval/rejection rates
- Average time to process submissions

## Development Notes

### File Structure
- `/src/pages/admin.astro` - Main admin dashboard
- `/src/pages/submit.astro` - Trainer submission form
- `/src/pages/thank-you.astro` - Post-submission confirmation

### Key Technologies
- **Astro**: Static site generation with dynamic components
- **Supabase**: Database and authentication
- **Client-side JavaScript**: Form handling and admin actions

### Environment Variables Required
```env
VITE_SUPABASE_URL=          # Your Supabase project URL
VITE_SUPABASE_ANON_KEY=     # Supabase anonymous key
VITE_ADMIN_KEY=             # Secure admin access key
```

## Support
For technical issues or questions about the admin dashboard, refer to:
- Supabase documentation: https://supabase.io/docs
- Astro documentation: https://docs.astro.build
- This project's main README.md file
