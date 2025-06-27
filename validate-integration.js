#!/usr/bin/env node

// Comprehensive validation script for Stripe integration
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Validating Stripe Integration Setup');
console.log('=====================================\n');

// 1. Check Environment Variables
console.log('1. Environment Variables:');
console.log('-------------------------');

const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
    console.log('✅ .env.local file exists');
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    const requiredVars = [
        'STRIPE_PUBLISHABLE_KEY',
        'STRIPE_SECRET_KEY', 
        'STRIPE_WEBHOOK_SECRET',
        'STRIPE_ANNUAL_PRICE_ID',
        'STRIPE_MONTHLY_PRICE_ID',
        'SUPABASE_URL',
        'SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_KEY'
    ];
    
    let missingVars = [];
    requiredVars.forEach(varName => {
        if (envContent.includes(`${varName}=`) && !envContent.includes(`${varName}=\n`)) {
            console.log(`  ✅ ${varName} is set`);
        } else {
            console.log(`  ❌ ${varName} is missing or empty`);
            missingVars.push(varName);
        }
    });
    
    if (missingVars.length === 0) {
        console.log('✅ All required environment variables are present\n');
    } else {
        console.log(`❌ Missing variables: ${missingVars.join(', ')}\n`);
    }
} else {
    console.log('❌ .env.local file not found\n');
}

// 2. Check API Endpoints
console.log('2. API Endpoint Files:');
console.log('----------------------');

const apiFiles = [
    'src/pages/api/create-checkout-session.js',
    'src/pages/api/webhooks/stripe.js'
];

apiFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file} exists`);
        
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for key imports
        if (content.includes('import Stripe from \'stripe\'')) {
            console.log(`  ✅ Stripe import found`);
        } else {
            console.log(`  ❌ Stripe import missing`);
        }
        
        if (file.includes('webhook') && content.includes('createClient')) {
            console.log(`  ✅ Supabase client found`);
        }
        
        if (content.includes('export async function POST')) {
            console.log(`  ✅ POST handler found`);
        } else {
            console.log(`  ❌ POST handler missing`);
        }
    } else {
        console.log(`❌ ${file} not found`);
    }
});

console.log('');

// 3. Check Frontend Pages
console.log('3. Frontend Integration:');
console.log('------------------------');

const frontendFiles = [
    'src/pages/premium.astro',
    'src/pages/dashboard.astro'
];

frontendFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file} exists`);
        
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for Stripe integration
        if (content.includes('stripePublishableKey')) {
            console.log(`  ✅ Stripe publishable key variable found`);
        } else {
            console.log(`  ❌ Stripe publishable key variable missing`);
        }
        
        if (content.includes('loadStripe') || content.includes('Stripe(')) {
            console.log(`  ✅ Stripe.js integration found`);
        } else {
            console.log(`  ❌ Stripe.js integration missing`);
        }
        
        if (content.includes('/api/create-checkout-session')) {
            console.log(`  ✅ Checkout API endpoint call found`);
        } else {
            console.log(`  ❌ Checkout API endpoint call missing`);
        }
    } else {
        console.log(`❌ ${file} not found`);
    }
});

console.log('');

// 4. Check Dependencies
console.log('4. Dependencies:');
console.log('----------------');

const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
    console.log('✅ package.json exists');
    
    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const requiredDeps = ['stripe', '@supabase/supabase-js', 'astro'];
    
    requiredDeps.forEach(dep => {
        if (packageContent.dependencies && packageContent.dependencies[dep]) {
            console.log(`  ✅ ${dep} v${packageContent.dependencies[dep]}`);
        } else {
            console.log(`  ❌ ${dep} not found in dependencies`);
        }
    });
} else {
    console.log('❌ package.json not found');
}

console.log('');

// 5. Check Styles
console.log('5. Style Integration:');
console.log('--------------------');

const styleFiles = [
    'src/styles/global.css',
    'src/styles/header.css'
];

styleFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ ${file} exists`);
        
        const content = fs.readFileSync(filePath, 'utf8');
        
        if (content.includes('.button')) {
            console.log(`  ✅ Button styles found`);
        }
        
        if (content.includes('.status-badge')) {
            console.log(`  ✅ Status badge styles found`);
        }
        
        if (file.includes('header') && content.includes('.burger-menu')) {
            console.log(`  ✅ Burger menu styles found`);
        }
    } else {
        console.log(`❌ ${file} not found`);
    }
});

console.log('\n🎯 Integration Validation Complete!');
console.log('====================================');

console.log('\n📋 Next Steps:');
console.log('1. Start dev server: npm run dev');
console.log('2. Test Stripe CLI: stripe listen --forward-to localhost:4321/api/webhooks/stripe');
console.log('3. Run frontend tests: ./test-frontend-integration.sh');
console.log('4. Test with browser at http://localhost:4321/premium');
