#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * Validates that all required environment variables are properly configured
 * for both local development and production deployment.
 */

console.log('🔍 Validating environment configuration...\n');

const isStrictMode = process.argv.includes('--strict');
const isBuildMode = process.env.NODE_ENV === 'production' || process.env.CI;

if (isStrictMode) {
  console.log('🔒 Running in STRICT mode - all variables must be present');
} else if (isBuildMode) {
  console.log('🏗️ Build mode detected - allowing missing variables with warnings');
} else {
  console.log('🚀 Development mode - checking for optimal configuration');
}

// Required environment variables
const requiredVars = {
  // Public variables (available to client-side code)
  'PUBLIC_SUPABASE_URL': {
    required: true,
    description: 'Supabase project URL',
    example: 'https://your-project.supabase.co'
  },
  'PUBLIC_SUPABASE_ANON_KEY': {
    required: true,
    description: 'Supabase anonymous key',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  },
  
  // Server-side variables
  'SUPABASE_SERVICE_KEY': {
    required: true,
    description: 'Supabase service role key (server-side only)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  },
  
  // Stripe configuration
  'STRIPE_SECRET_KEY': {
    required: true,
    description: 'Stripe secret key',
    example: 'sk_test_... or sk_live_...'
  },
  'STRIPE_PUBLISHABLE_KEY': {
    required: true,
    description: 'Stripe publishable key',
    example: 'pk_test_... or pk_live_...'
  },
  'STRIPE_WEBHOOK_SECRET': {
    required: true,
    description: 'Stripe webhook endpoint secret',
    example: 'whsec_...'
  },
  'STRIPE_ANNUAL_PRICE_ID': {
    required: true,
    description: 'Stripe price ID for annual subscription',
    example: 'price_...'
  },
  'STRIPE_MONTHLY_PRICE_ID': {
    required: true,
    description: 'Stripe price ID for monthly subscription',
    example: 'price_...'
  },
  
  // Admin configuration
  'VITE_ADMIN_KEY': {
    required: true,
    description: 'Admin dashboard access key',
    example: 'your_secure_admin_password'
  }
};

const errors = [];
const warnings = [];
let validCount = 0;

// Check each required variable
Object.entries(requiredVars).forEach(([varName, config]) => {
  const value = process.env[varName];
  
  if (!value) {
    if (config.required && (isStrictMode || (!isBuildMode && !isStrictMode))) {
      errors.push(`❌ ${varName} is required but not set\n   Description: ${config.description}\n   Example: ${config.example}`);
    } else {
      warnings.push(`⚠️  ${varName} is optional or missing (build mode)\n   Description: ${config.description}`);
    }
  } else {
    validCount++;
    
    // Basic validation
    if (varName.includes('SUPABASE_URL') && !value.includes('supabase.co')) {
      warnings.push(`⚠️  ${varName} may not be a valid Supabase URL: ${value.substring(0, 30)}...`);
    }
    
    if (varName.includes('STRIPE_') && varName.includes('KEY') && value.length < 20) {
      warnings.push(`⚠️  ${varName} seems too short to be a valid Stripe key`);
    }
    
    console.log(`✅ ${varName}: ${value.substring(0, 20)}${value.length > 20 ? '...' : ''}`);
  }
});

console.log(`\n📊 Validation Summary:`);
console.log(`   ✅ Valid: ${validCount}/${Object.keys(requiredVars).length}`);
console.log(`   ❌ Missing: ${errors.length}`);
console.log(`   ⚠️  Warnings: ${warnings.length}`);

if (warnings.length > 0) {
  console.log('\n⚠️  Warnings:');
  warnings.forEach(warning => console.log(`   ${warning}`));
}

if (errors.length > 0) {
  console.log('\n❌ Errors:');
  errors.forEach(error => console.log(`   ${error}`));
  console.log('\n💡 To fix these issues:');
  console.log('   1. Check your .env file in the project root');
  console.log('   2. Copy .env.example to .env if it doesn\'t exist');
  console.log('   3. Fill in the missing values');
  console.log('   4. For production deployment, set these in your Vercel dashboard');
  
  if (isStrictMode || (!isBuildMode && !isStrictMode)) {
    process.exit(1);
  } else {
    console.log('\n⚠️ Build mode: Continuing with warnings (some features may not work)');
  }
} else {
  console.log('\n🎉 All required environment variables are configured!');
  
  if (warnings.length === 0) {
    console.log('🚀 Ready for deployment!');
  } else {
    console.log('✨ Ready for deployment (with warnings noted above)');
  }
}
