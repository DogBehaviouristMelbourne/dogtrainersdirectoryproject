/**
 * GET/POST /api/admin/premium-slots
 * Premium slot management for admin dashboard
 * 
 * Manages the 10-slot limit per suburb/category combination
 * Provides slot usage analytics and enforcement
 */

import { supabaseService } from '../../../lib/supabaseClient.js';

const supabase = supabaseService;
const MAX_PREMIUM_SLOTS = 10;

// Helper function to create JSON responses
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function GET({ url }) {
  try {
    const action = url.searchParams.get('action');
    
    switch (action) {
      case 'usage':
        return await getPremiumSlotUsage();
      
      case 'availability':
        const suburb = url.searchParams.get('suburb');
        const category = url.searchParams.get('category');
        return await checkSlotAvailability(suburb, category);
      
      case 'analytics':
        return await getPremiumSlotAnalytics();
      
      default:
        return await getPremiumSlotUsage();
    }

  } catch (error) {
    console.error('💥 Premium slots error:', error);
    return json({ error: 'Internal server error', details: error.message }, 500);
  }
}

export async function POST({ request }) {
  try {
    const { action, data } = await request.json();

    switch (action) {
      case 'check_availability':
        return await checkSlotAvailability(data.suburb, data.category);
      
      case 'reserve_slot':
        return await reservePremiumSlot(data.trainerId, data.suburb, data.category);
      
      case 'release_slot':
        return await releasePremiumSlot(data.trainerId);
      
      case 'bulk_manage':
        return await bulkManageSlots(data);
      
      default:
        return json({ error: 'Invalid action' }, 400);
    }

  } catch (error) {
    console.error('💥 Premium slot management error:', error);
    return json({ error: 'Internal server error', details: error.message }, 500);
  }
}

// Get premium slot usage across all suburb/category combinations
async function getPremiumSlotUsage() {
  try {
    // Check if we're in build mode or missing env vars
    const isBuildTime = typeof window === 'undefined' && (!import.meta.env.PUBLIC_SUPABASE_URL || !import.meta.env.PUBLIC_SUPABASE_ANON_KEY);
    const isServiceKeyMissing = !import.meta.env.SUPABASE_SERVICE_KEY;
    
    if (!supabase || isBuildTime || isServiceKeyMissing) {
      console.log('⚠️ Database not available - returning safe fallback response');
      return json({
        success: false,
        error: 'Database not available during build',
        usage: [],
        summary: {
          total_combinations: 0,
          full_combinations: 0,
          total_premium_slots_used: 0,
          total_premium_slots_available: 0,
          average_utilization: 0
        }
      });
    }

    // Get all premium trainers with their suburb and categories
    let premiumTrainers = [];
    try {
      const { data, error } = await supabase
        .from('trainers')
        .select('id, name, suburb, categories, premium_status')
        .eq('premium_status', 'active');

      if (error) throw error;
      premiumTrainers = data || [];
    } catch (dbError) {
      console.error('Error getting premium slot usage:', {
        message: dbError.message,
        details: dbError.stack,
        hint: '',
        code: ''
      });
      
      // Return safe fallback if database query fails during build
      return json({
        success: false,
        error: 'Database connection failed during build',
        usage: [],
        summary: {
          total_combinations: 0,
          full_combinations: 0,
          total_premium_slots_used: 0,
          total_premium_slots_available: 0,
          average_utilization: 0
        }
      });
    }

    // Calculate usage by suburb/category combination
    const usageMap = new Map();
    
    premiumTrainers.forEach(trainer => {
      if (trainer.categories && trainer.suburb) {
        trainer.categories.forEach(category => {
          const key = `${trainer.suburb}|${category}`;
          
          if (!usageMap.has(key)) {
            usageMap.set(key, {
              suburb: trainer.suburb,
              category: category,
              active_premiums: 0,
              trainers: []
            });
          }
          
          const usage = usageMap.get(key);
          usage.active_premiums++;
          usage.trainers.push({
            id: trainer.id,
            name: trainer.name
          });
        });
      }
    });

    // Convert to array and add availability info
    const usage = Array.from(usageMap.values()).map(slot => ({
      ...slot,
      available_slots: MAX_PREMIUM_SLOTS - slot.active_premiums,
      is_full: slot.active_premiums >= MAX_PREMIUM_SLOTS,
      utilization_percentage: Math.round((slot.active_premiums / MAX_PREMIUM_SLOTS) * 100)
    }));

    // Sort by utilization (highest first)
    usage.sort((a, b) => b.utilization_percentage - a.utilization_percentage);

    return json({
      success: true,
      usage,
      summary: {
        total_combinations: usage.length,
        full_combinations: usage.filter(u => u.is_full).length,
        total_premium_slots_used: usage.reduce((sum, u) => sum + u.active_premiums, 0),
        total_premium_slots_available: usage.length * MAX_PREMIUM_SLOTS,
        average_utilization: usage.length > 0 
          ? Math.round(usage.reduce((sum, u) => sum + u.utilization_percentage, 0) / usage.length)
          : 0
      }
    });

  } catch (error) {
    console.error('Error getting premium slot usage:', error);
    // Return safe fallback during build
    return json({ 
      success: false,
      error: 'Database unavailable', 
      details: error.message,
      usage: [],
      summary: {
        total_combinations: 0,
        full_combinations: 0,
        total_premium_slots_used: 0,
        total_premium_slots_available: 0,
        average_utilization: 0
      }
    }, 200); // Return 200 during build to prevent failures
  }
}

// Check slot availability for a specific suburb/category
async function checkSlotAvailability(suburb, category) {
  try {
    if (!suburb || !category) {
      return json({ error: 'Suburb and category are required' }, 400);
    }

    // Check if we're in build mode or missing env vars
    if (!supabase || process.env.NODE_ENV === 'production' && !import.meta.env.SUPABASE_SERVICE_KEY) {
      return json({
        success: false,
        error: 'Database not available during build',
        suburb,
        category,
        current_usage: 0,
        max_slots: MAX_PREMIUM_SLOTS,
        available_slots: MAX_PREMIUM_SLOTS,
        is_available: true,
        utilization_percentage: 0,
        current_trainers: []
      });
    }

    // Count current premium trainers in this suburb/category
    const { data: trainers, error } = await supabase
      .from('trainers')
      .select('id, name')
      .eq('premium_status', 'active')
      .eq('suburb', suburb)
      .contains('categories', [category]);

    if (error) throw error;

    const currentUsage = trainers.length;
    const availableSlots = MAX_PREMIUM_SLOTS - currentUsage;
    const isAvailable = availableSlots > 0;

    return json({
      success: true,
      suburb,
      category,
      current_usage: currentUsage,
      max_slots: MAX_PREMIUM_SLOTS,
      available_slots: availableSlots,
      is_available: isAvailable,
      utilization_percentage: Math.round((currentUsage / MAX_PREMIUM_SLOTS) * 100),
      current_trainers: trainers
    });

  } catch (error) {
    console.error('Error checking slot availability:', error);
    // Return safe fallback during build
    return json({ 
      success: false,
      error: 'Database unavailable', 
      details: error.message,
      suburb: suburb || 'unknown',
      category: category || 'unknown',
      current_usage: 0,
      max_slots: MAX_PREMIUM_SLOTS,
      available_slots: MAX_PREMIUM_SLOTS,
      is_available: true,
      utilization_percentage: 0,
      current_trainers: []
    }, 200); // Return 200 during build to prevent failures
  }
}

// Reserve a premium slot for a trainer
async function reservePremiumSlot(trainerId, suburb, category) {
  try {
    // First check if slot is available
    const availabilityCheck = await checkSlotAvailability(suburb, category);
    const availability = await availabilityCheck.json();
    
    if (!availability.success || !availability.is_available) {
      return json({
        success: false,
        error: 'No premium slots available for this suburb/category combination',
        current_usage: availability.current_usage,
        max_slots: MAX_PREMIUM_SLOTS
      }, 409);
    }

    // Get trainer data to verify suburb and category
    const { data: trainer, error: trainerError } = await supabase
      .from('trainers')
      .select('*')
      .eq('id', trainerId)
      .single();

    if (trainerError) throw trainerError;

    // Verify trainer is in the correct suburb and has the category
    if (trainer.suburb !== suburb) {
      return json({
        success: false,
        error: 'Trainer suburb does not match requested slot suburb'
      }, 400);
    }

    if (!trainer.categories || !trainer.categories.includes(category)) {
      return json({
        success: false,
        error: 'Trainer does not have the requested category'
      }, 400);
    }

    // Activate premium status
    const now = new Date();
    const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    const { error: updateError } = await supabase
      .from('trainers')
      .update({
        premium_status: 'active',
        premium_start_date: now.toISOString(),
        premium_end_date: endDate.toISOString()
      })
      .eq('id', trainerId);

    if (updateError) throw updateError;

    console.log(`✅ Reserved premium slot for trainer ${trainerId} in ${suburb}/${category}`);

    return json({
      success: true,
      message: 'Premium slot reserved successfully',
      trainer_id: trainerId,
      suburb,
      category,
      premium_start_date: now.toISOString(),
      premium_end_date: endDate.toISOString(),
      remaining_slots: availability.available_slots - 1
    });

  } catch (error) {
    console.error('Error reserving premium slot:', error);
    return json({ error: 'Failed to reserve premium slot', details: error.message }, 500);
  }
}

// Release a premium slot for a trainer
async function releasePremiumSlot(trainerId) {
  try {
    // Get trainer data first
    const { data: trainer, error: trainerError } = await supabase
      .from('trainers')
      .select('*')
      .eq('id', trainerId)
      .single();

    if (trainerError) throw trainerError;

    if (trainer.premium_status !== 'active') {
      return json({
        success: false,
        error: 'Trainer does not have an active premium subscription'
      }, 400);
    }

    // Deactivate premium status
    const { error: updateError } = await supabase
      .from('trainers')
      .update({
        premium_status: 'inactive',
        premium_start_date: null,
        premium_end_date: null
      })
      .eq('id', trainerId);

    if (updateError) throw updateError;

    console.log(`❌ Released premium slot for trainer ${trainerId}`);

    return json({
      success: true,
      message: 'Premium slot released successfully',
      trainer_id: trainerId,
      trainer_name: trainer.name,
      suburb: trainer.suburb,
      categories: trainer.categories
    });

  } catch (error) {
    console.error('Error releasing premium slot:', error);
    return json({ error: 'Failed to release premium slot', details: error.message }, 500);
  }
}

// Bulk manage premium slots
async function bulkManageSlots(data) {
  try {
    const { action, trainer_ids, suburb, category } = data;
    const results = [];

    for (const trainerId of trainer_ids) {
      try {
        let result;
        
        switch (action) {
          case 'activate':
            result = await reservePremiumSlot(trainerId, suburb, category);
            break;
          case 'deactivate':
            result = await releasePremiumSlot(trainerId);
            break;
          default:
            result = { success: false, error: 'Invalid bulk action' };
        }
        
        const resultData = await result.json();
        results.push({ trainer_id: trainerId, ...resultData });
        
      } catch (error) {
        results.push({ 
          trainer_id: trainerId, 
          success: false, 
          error: error.message 
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    
    console.log(`📊 Bulk slot management completed: ${successCount}/${trainer_ids.length} successful`);
    
    return json({
      success: true,
      message: `Bulk slot management completed: ${successCount}/${trainer_ids.length} successful`,
      results
    });

  } catch (error) {
    console.error('Error in bulk slot management:', error);
    return json({ error: 'Failed to perform bulk slot management', details: error.message }, 500);
  }
}

// Get premium slot analytics
async function getPremiumSlotAnalytics() {
  try {
    const usageResponse = await getPremiumSlotUsage();
    const usageData = await usageResponse.json();
    
    if (!usageData.success) {
      throw new Error('Failed to get usage data');
    }

    const { usage, summary } = usageData;

    // Calculate additional analytics
    const analytics = {
      ...summary,
      
      // Slot distribution
      high_utilization_slots: usage.filter(u => u.utilization_percentage >= 80).length,
      medium_utilization_slots: usage.filter(u => u.utilization_percentage >= 50 && u.utilization_percentage < 80).length,
      low_utilization_slots: usage.filter(u => u.utilization_percentage < 50).length,
      
      // Top performing combinations
      top_combinations: usage.slice(0, 5).map(u => ({
        suburb: u.suburb,
        category: u.category,
        usage: u.active_premiums,
        utilization: u.utilization_percentage
      })),
      
      // Suburb analysis
      suburb_performance: calculateSuburbPerformance(usage),
      
      // Category analysis
      category_performance: calculateCategoryPerformance(usage),
      
      // Revenue impact
      premium_revenue_monthly: usage.reduce((sum, u) => sum + (u.active_premiums * 49), 0),
      potential_revenue_monthly: summary.total_premium_slots_available * 49,
      revenue_efficiency: summary.total_premium_slots_available > 0 
        ? Math.round((usage.reduce((sum, u) => sum + (u.active_premiums * 49), 0) / (summary.total_premium_slots_available * 49)) * 100)
        : 0
    };

    return json({
      success: true,
      analytics,
      detailed_usage: usage
    });

  } catch (error) {
    console.error('Error getting premium slot analytics:', error);
    return json({ error: 'Failed to get premium slot analytics', details: error.message }, 500);
  }
}

// Calculate suburb performance metrics
function calculateSuburbPerformance(usage) {
  const suburbMap = new Map();
  
  usage.forEach(slot => {
    if (!suburbMap.has(slot.suburb)) {
      suburbMap.set(slot.suburb, {
        suburb: slot.suburb,
        total_slots: 0,
        used_slots: 0,
        categories: 0
      });
    }
    
    const suburbData = suburbMap.get(slot.suburb);
    suburbData.total_slots += MAX_PREMIUM_SLOTS;
    suburbData.used_slots += slot.active_premiums;
    suburbData.categories++;
  });
  
  return Array.from(suburbMap.values()).map(suburb => ({
    ...suburb,
    utilization: suburb.total_slots > 0 ? Math.round((suburb.used_slots / suburb.total_slots) * 100) : 0
  })).sort((a, b) => b.utilization - a.utilization);
}

// Calculate category performance metrics
function calculateCategoryPerformance(usage) {
  const categoryMap = new Map();
  
  usage.forEach(slot => {
    if (!categoryMap.has(slot.category)) {
      categoryMap.set(slot.category, {
        category: slot.category,
        total_slots: 0,
        used_slots: 0,
        suburbs: 0
      });
    }
    
    const categoryData = categoryMap.get(slot.category);
    categoryData.total_slots += MAX_PREMIUM_SLOTS;
    categoryData.used_slots += slot.active_premiums;
    categoryData.suburbs++;
  });
  
  return Array.from(categoryMap.values()).map(category => ({
    ...category,
    utilization: category.total_slots > 0 ? Math.round((category.used_slots / category.total_slots) * 100) : 0
  })).sort((a, b) => b.utilization - a.utilization);
}