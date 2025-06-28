/**
 * POST /api/admin/subscription-management
 * Enhanced subscription management for admin dashboard
 * 
 * Actions supported:
 * - toggle_premium: Toggle premium status for a trainer
 * - update_subscription: Update subscription details
 * - cancel_subscription: Cancel a subscription
 * - extend_subscription: Extend subscription period
 * - get_subscription_history: Get subscription history for a trainer
 */

import { supabaseService } from '../../../lib/supabaseClient.js';

const supabase = supabaseService;

export async function POST({ request }) {
  try {
    const { action, trainerId, data } = await request.json();

    if (!action || !trainerId) {
      return json({ error: 'Missing required parameters: action, trainerId' }, 400);
    }

    console.log(`🔧 Admin subscription action: ${action} for trainer ${trainerId}`);

    switch (action) {
      case 'toggle_premium':
        return await togglePremiumStatus(trainerId, data);
      
      case 'update_subscription':
        return await updateSubscription(trainerId, data);
      
      case 'cancel_subscription':
        return await cancelSubscription(trainerId, data);
      
      case 'extend_subscription':
        return await extendSubscription(trainerId, data);
      
      case 'get_subscription_history':
        return await getSubscriptionHistory(trainerId);
      
      case 'bulk_update':
        return await bulkUpdateSubscriptions(data);
      
      default:
        return json({ error: 'Invalid action' }, 400);
    }

  } catch (error) {
    console.error('💥 Subscription management error:', error);
    return json({ error: 'Internal server error', details: error.message }, 500);
  }
}

export async function GET({ url }) {
  try {
    const action = url.searchParams.get('action');
    
    switch (action) {
      case 'stats':
        return await getSubscriptionStats();
      
      case 'revenue':
        return await getRevenueData();
      
      case 'analytics':
        return await getAnalyticsData();
      
      default:
        return json({ error: 'Invalid action' }, 400);
    }

  } catch (error) {
    console.error('💥 Subscription data error:', error);
    return json({ error: 'Internal server error', details: error.message }, 500);
  }
}

// Toggle premium status for a trainer
async function togglePremiumStatus(trainerId, data) {
  const { currentStatus } = data;
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
  
  try {
    // Get current trainer data
    const { data: trainer, error: fetchError } = await supabase
      .from('trainers')
      .select('*')
      .eq('id', trainerId)
      .single();

    if (fetchError) throw fetchError;

    // Update premium status
    const updateData = { premium_status: newStatus };
    
    if (newStatus === 'active') {
      // Set premium start and end dates
      const now = new Date();
      const endDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
      
      updateData.premium_start_date = now.toISOString();
      updateData.premium_end_date = endDate.toISOString();
    } else {
      // Clear premium dates when deactivating
      updateData.premium_start_date = null;
      updateData.premium_end_date = null;
    }

    const { error: updateError } = await supabase
      .from('trainers')
      .update(updateData)
      .eq('id', trainerId);

    if (updateError) throw updateError;

    console.log(`✅ Premium status ${newStatus} for trainer ${trainerId}`);
    
    return json({
      success: true,
      message: `Premium status ${newStatus === 'active' ? 'activated' : 'deactivated'}`,
      newStatus,
      trainer: { ...trainer, ...updateData }
    });

  } catch (error) {
    console.error('Error toggling premium status:', error);
    return json({ error: 'Failed to toggle premium status', details: error.message }, 500);
  }
}

// Update subscription details
async function updateSubscription(trainerId, data) {
  const { subscriptionType, status, startDate, endDate } = data;
  
  try {
    const updateData = {};
    
    if (subscriptionType === 'standard') {
      updateData.payment_status = status;
      if (startDate) updateData.standard_start_date = startDate;
      if (endDate) updateData.standard_end_date = endDate;
    } else if (subscriptionType === 'premium') {
      updateData.premium_status = status;
      if (startDate) updateData.premium_start_date = startDate;
      if (endDate) updateData.premium_end_date = endDate;
    }

    const { error } = await supabase
      .from('trainers')
      .update(updateData)
      .eq('id', trainerId);

    if (error) throw error;

    console.log(`✅ Updated ${subscriptionType} subscription for trainer ${trainerId}`);
    
    return json({
      success: true,
      message: `${subscriptionType} subscription updated successfully`,
      updateData
    });

  } catch (error) {
    console.error('Error updating subscription:', error);
    return json({ error: 'Failed to update subscription', details: error.message }, 500);
  }
}

// Cancel subscription
async function cancelSubscription(trainerId, data) {
  const { subscriptionType, reason } = data;
  
  try {
    const updateData = {};
    
    if (subscriptionType === 'standard') {
      updateData.payment_status = 'expired_standard';
      updateData.premium_status = 'inactive'; // Cancel premium too if standard is cancelled
    } else if (subscriptionType === 'premium') {
      updateData.premium_status = 'cancelled';
    }

    const { error } = await supabase
      .from('trainers')
      .update(updateData)
      .eq('id', trainerId);

    if (error) throw error;

    // Log cancellation reason if provided
    if (reason) {
      console.log(`📝 Cancellation reason for ${trainerId}: ${reason}`);
    }

    console.log(`❌ Cancelled ${subscriptionType} subscription for trainer ${trainerId}`);
    
    return json({
      success: true,
      message: `${subscriptionType} subscription cancelled`,
      updateData
    });

  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return json({ error: 'Failed to cancel subscription', details: error.message }, 500);
  }
}

// Extend subscription
async function extendSubscription(trainerId, data) {
  const { subscriptionType, extensionDays } = data;
  
  try {
    // Get current trainer data
    const { data: trainer, error: fetchError } = await supabase
      .from('trainers')
      .select('*')
      .eq('id', trainerId)
      .single();

    if (fetchError) throw fetchError;

    const updateData = {};
    
    if (subscriptionType === 'standard') {
      const currentEnd = trainer.standard_end_date ? new Date(trainer.standard_end_date) : new Date();
      const newEnd = new Date(currentEnd.getTime() + extensionDays * 24 * 60 * 60 * 1000);
      updateData.standard_end_date = newEnd.toISOString();
    } else if (subscriptionType === 'premium') {
      const currentEnd = trainer.premium_end_date ? new Date(trainer.premium_end_date) : new Date();
      const newEnd = new Date(currentEnd.getTime() + extensionDays * 24 * 60 * 60 * 1000);
      updateData.premium_end_date = newEnd.toISOString();
    }

    const { error } = await supabase
      .from('trainers')
      .update(updateData)
      .eq('id', trainerId);

    if (error) throw error;

    console.log(`⏰ Extended ${subscriptionType} subscription for trainer ${trainerId} by ${extensionDays} days`);
    
    return json({
      success: true,
      message: `${subscriptionType} subscription extended by ${extensionDays} days`,
      updateData
    });

  } catch (error) {
    console.error('Error extending subscription:', error);
    return json({ error: 'Failed to extend subscription', details: error.message }, 500);
  }
}

// Get subscription history for a trainer
async function getSubscriptionHistory(trainerId) {
  try {
    // Get trainer data with subscription info
    const { data: trainer, error } = await supabase
      .from('trainers')
      .select('*')
      .eq('id', trainerId)
      .single();

    if (error) throw error;

    // Build subscription history from available data
    const history = [];
    
    if (trainer.standard_start_date) {
      history.push({
        type: 'standard',
        action: 'activated',
        date: trainer.standard_start_date,
        status: trainer.payment_status,
        endDate: trainer.standard_end_date
      });
    }
    
    if (trainer.premium_start_date) {
      history.push({
        type: 'premium',
        action: 'activated',
        date: trainer.premium_start_date,
        status: trainer.premium_status,
        endDate: trainer.premium_end_date
      });
    }

    // Sort by date
    history.sort((a, b) => new Date(a.date) - new Date(b.date));

    return json({
      success: true,
      trainer,
      history
    });

  } catch (error) {
    console.error('Error getting subscription history:', error);
    return json({ error: 'Failed to get subscription history', details: error.message }, 500);
  }
}

// Bulk update subscriptions
async function bulkUpdateSubscriptions(data) {
  const { trainerIds, action, actionData } = data;
  
  try {
    const results = [];
    
    for (const trainerId of trainerIds) {
      try {
        let result;
        
        switch (action) {
          case 'activate_premium':
            result = await togglePremiumStatus(trainerId, { currentStatus: 'inactive' });
            break;
          case 'deactivate_premium':
            result = await togglePremiumStatus(trainerId, { currentStatus: 'active' });
            break;
          case 'extend_subscription':
            result = await extendSubscription(trainerId, actionData);
            break;
          default:
            result = { success: false, error: 'Invalid bulk action' };
        }
        
        results.push({ trainerId, ...result });
        
      } catch (error) {
        results.push({ trainerId, success: false, error: error.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    
    console.log(`📊 Bulk update completed: ${successCount}/${trainerIds.length} successful`);
    
    return json({
      success: true,
      message: `Bulk update completed: ${successCount}/${trainerIds.length} successful`,
      results
    });

  } catch (error) {
    console.error('Error in bulk update:', error);
    return json({ error: 'Failed to perform bulk update', details: error.message }, 500);
  }
}

// Get subscription statistics
async function getSubscriptionStats() {
  try {
    const { data: trainers, error } = await supabase
      .from('trainers')
      .select('payment_status, premium_status, standard_start_date, premium_start_date');

    if (error) throw error;

    const stats = {
      total: trainers.length,
      standardActive: trainers.filter(t => t.payment_status === 'paid_standard').length,
      premiumActive: trainers.filter(t => t.premium_status === 'active').length,
      standardPending: trainers.filter(t => t.payment_status === 'pending_standard').length,
      standardExpired: trainers.filter(t => t.payment_status === 'expired_standard').length,
      premiumCancelled: trainers.filter(t => t.premium_status === 'cancelled').length,
      monthlyRevenue: 0,
      annualRevenue: 0
    };

    // Calculate revenue estimates
    stats.monthlyRevenue = (stats.standardActive * 79 / 12) + (stats.premiumActive * 49);
    stats.annualRevenue = (stats.standardActive * 79) + (stats.premiumActive * 49 * 12);

    return json({ success: true, stats });

  } catch (error) {
    console.error('Error getting subscription stats:', error);
    return json({ error: 'Failed to get subscription stats', details: error.message }, 500);
  }
}

// Get revenue data
async function getRevenueData() {
  try {
    const { data: trainers, error } = await supabase
      .from('trainers')
      .select('payment_status, premium_status, standard_start_date, premium_start_date, created_at');

    if (error) throw error;

    // Calculate monthly revenue breakdown
    const monthlyRevenue = {};
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
      monthlyRevenue[monthKey] = { standard: 0, premium: 0, total: 0 };
    }

    // Calculate revenue for each month
    trainers.forEach(trainer => {
      if (trainer.payment_status === 'paid_standard' && trainer.standard_start_date) {
        const startMonth = trainer.standard_start_date.slice(0, 7);
        if (monthlyRevenue[startMonth]) {
          monthlyRevenue[startMonth].standard += 79;
          monthlyRevenue[startMonth].total += 79;
        }
      }
      
      if (trainer.premium_status === 'active' && trainer.premium_start_date) {
        const startMonth = trainer.premium_start_date.slice(0, 7);
        if (monthlyRevenue[startMonth]) {
          monthlyRevenue[startMonth].premium += 49;
          monthlyRevenue[startMonth].total += 49;
        }
      }
    });

    return json({ success: true, monthlyRevenue });

  } catch (error) {
    console.error('Error getting revenue data:', error);
    return json({ error: 'Failed to get revenue data', details: error.message }, 500);
  }
}

// Get analytics data
async function getAnalyticsData() {
  try {
    const { data: trainers, error } = await supabase
      .from('trainers')
      .select('*');

    if (error) throw error;

    const { data: pending, error: pendingError } = await supabase
      .from('pending_trainers')
      .select('created_at');

    if (pendingError) console.warn('Could not fetch pending data:', pendingError);

    // Calculate conversion rate (approved / total submissions)
    const totalSubmissions = trainers.length + (pending?.length || 0);
    const conversionRate = totalSubmissions > 0 ? (trainers.length / totalSubmissions * 100).toFixed(1) : 0;

    // Calculate average revenue per user
    const activeSubscriptions = trainers.filter(t => 
      t.payment_status === 'paid_standard' || t.premium_status === 'active'
    );
    const totalRevenue = trainers.reduce((sum, trainer) => {
      let revenue = 0;
      if (trainer.payment_status === 'paid_standard') revenue += 79;
      if (trainer.premium_status === 'active') revenue += 49;
      return sum + revenue;
    }, 0);
    const avgRevenue = activeSubscriptions.length > 0 ? (totalRevenue / activeSubscriptions.length).toFixed(0) : 0;

    // Calculate churn rate (simplified - expired/cancelled vs active)
    const churnedSubscriptions = trainers.filter(t => 
      t.payment_status === 'expired_standard' || t.premium_status === 'cancelled'
    );
    const churnRate = trainers.length > 0 ? (churnedSubscriptions.length / trainers.length * 100).toFixed(1) : 0;

    const analytics = {
      conversionRate: `${conversionRate}%`,
      avgRevenue: `$${avgRevenue}`,
      churnRate: `${churnRate}%`,
      totalSubmissions,
      activeSubscriptions: activeSubscriptions.length,
      churnedSubscriptions: churnedSubscriptions.length
    };

    return json({ success: true, analytics });

  } catch (error) {
    console.error('Error getting analytics data:', error);
    return json({ error: 'Failed to get analytics data', details: error.message }, 500);
  }
}

// Utility function for JSON responses
function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}