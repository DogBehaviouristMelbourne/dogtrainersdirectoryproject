# Dog Trainers Directory Melbourne - Deployment Guide

**Complete Deployment Instructions for Production Environment**

## Overview

This deployment guide provides comprehensive instructions for deploying the Dog Trainers Directory Melbourne website to production environments. The website is built as a static site using Astro, making it compatible with a wide range of hosting solutions from traditional web servers to modern static site hosting services.

## Pre-Deployment Checklist

Before deploying the website to production, ensure that all the following requirements are met:

### System Requirements
- Node.js version 18.0.0 or higher
- npm version 8.0.0 or higher
- Git for version control
- Access to your chosen hosting platform

### Build Verification
1. Verify that the production build completes successfully without errors
2. Test all functionality in the built version using a local server
3. Confirm that all assets (images, fonts, icons) are properly included
4. Validate that all links and navigation work correctly
5. Test responsive design across different device sizes
6. Verify accessibility compliance using browser developer tools

### Content Review
1. Review all trainer information for accuracy and completeness
2. Verify that contact information is current and functional
3. Test the Paw-sonality Quiz with various input combinations
4. Confirm that search and filtering functionality works as expected
5. Review all static content for spelling and grammar

## Building for Production

The production build process optimizes the website for deployment by minifying assets, optimizing images, and generating static HTML files for all pages.

### Build Command
```bash
npm run build
```

This command will:
- Generate optimized static HTML files for all pages
- Minify and bundle CSS and JavaScript
- Optimize images and other assets
- Create a `dist/` directory containing all deployment files

### Build Output Structure
The build process creates the following structure in the `dist/` directory:
```
dist/
├── index.html                 # Homepage
├── about/
│   └── index.html            # About page
├── contact/
│   └── index.html            # Contact page
├── trainers/
│   └── index.html            # Trainers directory page
├── _astro/                   # Optimized CSS and JS bundles
├── images/                   # Optimized images and icons
├── sounds/                   # Audio files for sound effects
├── favicon.png               # Website favicon
└── favicon.svg               # SVG favicon
```

### Build Verification
After building, you can test the production version locally:
```bash
npm run preview
```

This starts a local server serving the built files, allowing you to verify that everything works correctly in the production environment.

## Hosting Platform Options

The static nature of the website makes it compatible with numerous hosting solutions. Here are the recommended options:

### Option 1: Netlify (Recommended)

Netlify provides excellent support for static sites with automatic builds, global CDN, and SSL certificates.

#### Deployment Steps:
1. Create a Netlify account at netlify.com
2. Connect your Git repository to Netlify
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18 or higher
4. Deploy the site

#### Netlify Configuration
Create a `netlify.toml` file in the project root:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/images/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/_astro/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Option 2: Vercel

Vercel offers similar features to Netlify with excellent performance and developer experience.

#### Deployment Steps:
1. Create a Vercel account at vercel.com
2. Import your Git repository
3. Configure project settings:
   - Framework Preset: Astro
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Deploy the project

#### Vercel Configuration
Create a `vercel.json` file in the project root:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "astro",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

### Option 3: GitHub Pages

GitHub Pages provides free hosting for static sites directly from GitHub repositories.

#### Deployment Steps:
1. Ensure your repository is public or you have GitHub Pro
2. Create a GitHub Actions workflow file at `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

3. Enable GitHub Pages in repository settings
4. Select "GitHub Actions" as the source
5. Push changes to trigger deployment

### Option 4: Traditional Web Hosting

For traditional web hosting services, you can upload the built files directly via FTP or hosting control panels.

#### Deployment Steps:
1. Build the project locally: `npm run build`
2. Upload all contents of the `dist/` directory to your web server's public directory
3. Ensure the web server is configured to serve static files
4. Configure appropriate MIME types for all file extensions

#### Web Server Configuration

For Apache servers, create a `.htaccess` file in the root directory:
```apache
# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Set cache headers
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header always set X-Frame-Options DENY
    Header always set X-Content-Type-Options nosniff
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>
```

For Nginx servers, add to your server configuration:
```nginx
# Compression
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

# Cache static assets
location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Security headers
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";
```

## Domain Configuration

### Custom Domain Setup

Most hosting platforms support custom domains. Here's how to configure your domain:

1. **Purchase and configure your domain** (e.g., dogtrainersdirectory.com.au)
2. **Update DNS settings** to point to your hosting provider
3. **Configure SSL certificate** (most modern hosts provide this automatically)
4. **Test the domain** to ensure proper routing and SSL functionality

### DNS Configuration Example
For most hosting providers, you'll need to configure these DNS records:
```
Type: A
Name: @
Value: [Your hosting provider's IP address]

Type: CNAME
Name: www
Value: [Your hosting provider's domain]
```

### SSL Certificate
Ensure that SSL is properly configured and that all traffic is redirected to HTTPS. Most modern hosting platforms handle this automatically, but verify that:
- The site loads correctly over HTTPS
- HTTP traffic is redirected to HTTPS
- The SSL certificate is valid and trusted

## Performance Optimization

### Content Delivery Network (CDN)

For optimal global performance, consider using a CDN to serve static assets:

1. **Cloudflare** - Free tier available with excellent performance
2. **AWS CloudFront** - Integrates well with other AWS services
3. **Google Cloud CDN** - Good performance with competitive pricing

### Monitoring and Analytics

Consider implementing privacy-respecting analytics to monitor site performance:

1. **Google Analytics 4** - Comprehensive analytics with privacy controls
2. **Plausible** - Privacy-focused alternative
3. **Fathom Analytics** - Simple, privacy-focused analytics

### Performance Testing

After deployment, test your site's performance using:
- Google PageSpeed Insights
- GTmetrix
- WebPageTest
- Lighthouse (built into Chrome DevTools)

Target metrics:
- First Contentful Paint: < 1.5 seconds
- Largest Contentful Paint: < 2.5 seconds
- Cumulative Layout Shift: < 0.1
- First Input Delay: < 100 milliseconds

## Maintenance and Updates

### Content Updates

The website is designed for monthly content updates. To update trainer information:

1. Modify the JSON files in the `src/data/` directory
2. Commit changes to your Git repository
3. The hosting platform will automatically rebuild and deploy the updated site

### Regular Maintenance Tasks

1. **Monthly**: Update trainer information and verify contact details
2. **Quarterly**: Review and update Wagging Wisdom content
3. **Annually**: Review and update all static content, check for broken links
4. **As needed**: Update dependencies and rebuild for security patches

### Backup Strategy

Implement a backup strategy that includes:
- Regular Git repository backups
- Database backups (if using a CMS in the future)
- Asset backups (images, documents)
- Configuration file backups

### Security Updates

Stay informed about security updates for:
- Node.js and npm packages
- Hosting platform security features
- Domain and SSL certificate renewals

## Troubleshooting Common Issues

### Build Failures

If the build process fails:
1. Check Node.js and npm versions
2. Clear npm cache: `npm cache clean --force`
3. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
4. Check for syntax errors in modified files
5. Verify that all required dependencies are installed

### Missing Assets

If images or other assets don't load:
1. Verify that files exist in the `public/` directory
2. Check file paths in the code for typos
3. Ensure proper case sensitivity in file names
4. Verify that the build process includes all necessary files

### JavaScript Errors

If interactive features don't work:
1. Check browser console for JavaScript errors
2. Verify that all required scripts are loading
3. Test in different browsers to identify compatibility issues
4. Check for conflicts with browser extensions or ad blockers

### Performance Issues

If the site loads slowly:
1. Optimize images using tools like ImageOptim or TinyPNG
2. Enable compression on your web server
3. Implement proper caching headers
4. Consider using a CDN for static assets
5. Minimize the number of external resources

## Support and Resources

### Documentation
- Astro Documentation: https://docs.astro.build/
- Web.dev Performance Guide: https://web.dev/performance/
- MDN Web Docs: https://developer.mozilla.org/

### Community Support
- Astro Discord: https://astro.build/chat
- Stack Overflow: Tag questions with 'astro'
- GitHub Issues: For framework-specific problems

### Professional Support
For complex deployment scenarios or custom requirements, consider consulting with:
- Web development professionals familiar with static site deployment
- DevOps specialists for advanced hosting configurations
- Performance optimization experts for high-traffic scenarios

This deployment guide provides comprehensive instructions for successfully deploying the Dog Trainers Directory Melbourne website to production environments. Follow these guidelines to ensure a smooth deployment process and optimal performance for your users.

## Step 2: Update Your Webhook in the Stripe Dashboard

> **Note:** The Stripe CLI is currently authenticated to account `acct_1R9c0aDEY1RddZfI`. This session will expire on **September 25 2025**, at which point you must run `stripe login` again to re-authenticate.

1. **Log in** to your [Stripe Dashboard](https://dashboard.stripe.com) with your live account.
2. **Navigate** to **Developers → Webhooks**.
3. **Select** your existing webhook endpoint (e.g. `https://your-domain.com/api/webhooks/stripe`).
4. **Edit** the endpoint URL to point to your production site (replace any `localhost` URL).
5. **Verify** the subscribed events: ensure only **checkout.session.completed** and **customer.subscription.deleted** are checked.
6. **Save** the endpoint.
7. **Reveal** the **Signing Secret** and copy it.
8. **Add** the secret to your production environment variables (e.g. in Vercel):
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_live_your_live_signing_secret
   ```
9. **Redeploy** your production app so the new URL and secret take effect.

