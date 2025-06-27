#!/usr/bin/env node

// Simple Stripe configuration test
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env.local') });

console.log('🔧 Testing Stripe Configuration');
console.log('==============================\n');

// Test environment variables
const requiredEnvVars = {
    'STRIPE_PUBLISHABLE_KEY': process.env.STRIPE_PUBLISHABLE_KEY,
    'STRIPE_SECRET_KEY': process.env.STRIPE_SECRET_KEY,
    'STRIPE_WEBHOOK_SECRET': process.env.STRIPE_WEBHOOK_SECRET,
    'STRIPE_ANNUAL_PRICE_ID': process.env.STRIPE_ANNUAL_PRICE_ID,
    'STRIPE_MONTHLY_PRICE_ID': process.env.STRIPE_MONTHLY_PRICE_ID,
    'SUPABASE_URL': process.env.SUPABASE_URL,
    'SUPABASE_ANON_KEY': process.env.SUPABASE_ANON_KEY,
    'SUPABASE_SERVICE_KEY': process.env.SUPABASE_SERVICE_KEY
};

console.log('Environment Variables:');
console.log('---------------------');

let allGood = true;
Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (value && value.trim() !== '') {
        // Show partial value for security
        let displayValue = value;
        if (key.includes('KEY') || key.includes('SECRET')) {
            displayValue = value.substring(0, 8) + '...' + value.slice(-4);
        }
        console.log(`✅ ${key}: ${displayValue}`);
    } else {
        console.log(`❌ ${key}: NOT SET`);
        allGood = false;
    }
});

console.log('');

if (allGood) {
    console.log('✅ All environment variables are configured!');
    
    // Test Stripe import
    try {
        const Stripe = await import('stripe');
        console.log('✅ Stripe package can be imported');
        
        // Initialize Stripe (this validates the secret key format)
        const stripe = new Stripe.default(process.env.STRIPE_SECRET_KEY);
        console.log('✅ Stripe client initialized successfully');
        
        // Test price ID format
        if (process.env.STRIPE_ANNUAL_PRICE_ID?.startsWith('price_')) {
            console.log('✅ Annual price ID format is correct');
        } else {
            console.log('⚠️ Annual price ID might be incorrect format');
        }
        
        if (process.env.STRIPE_MONTHLY_PRICE_ID?.startsWith('price_')) {
            console.log('✅ Monthly price ID format is correct');
        } else {
            console.log('⚠️ Monthly price ID might be incorrect format');
        }
        
    } catch (error) {
        console.log('❌ Stripe package import failed:', error.message);
        allGood = false;
    }
    
    // Test Supabase import
    try {
        const { createClient } = await import('@supabase/supabase-js');
        console.log('✅ Supabase package can be imported');
        
        // Initialize Supabase client
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY
        );
        console.log('✅ Supabase client initialized successfully');
        
    } catch (error) {
        console.log('❌ Supabase package import failed:', error.message);
        allGood = false;
    }
    
} else {
    console.log('❌ Some environment variables are missing. Please check .env.local file.');
}

console.log('\n📋 Configuration Status:');
console.log('========================');

if (allGood) {
    console.log('🎉 SUCCESS: All configurations are valid!');
    console.log('\nNext steps:');
    console.log('1. Start development server: npm run dev');
    console.log('2. Test premium page: http://localhost:4321/premium');
    console.log('3. Test dashboard: http://localhost:4321/dashboard');
    console.log('4. Start Stripe webhook listener: stripe listen --forward-to localhost:4321/api/webhooks/stripe');
} else {
    console.log('🔧 SETUP NEEDED: Please fix the configuration issues above.');
    console.log('\nConfiguration checklist:');
    console.log('- Ensure .env.local file exists in project root');
    console.log('- Add all required Stripe keys from your Stripe dashboard');
    console.log('- Add all required Supabase keys from your Supabase project');
    console.log('- Verify all package dependencies are installed (npm install)');
}

console.log('');
