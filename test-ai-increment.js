// Test AI usage increment
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAiIncrement() {
  console.log('Testing AI usage increment...');
  
  try {
    // Get a user
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('userId, ai_calls_used, ai_calls_reset_date')
      .limit(1);
    
    if (usersError || !users || users.length === 0) {
      console.error('No users found:', usersError);
      return;
    }
    
    const user = users[0];
    console.log(`Testing with user: ${user.userId}`);
    console.log(`Current AI calls: ${user.ai_calls_used || 0}`);
    
    // Increment AI usage
    const newUsage = (user.ai_calls_used || 0) + 1;
    const { error: updateError } = await supabase
      .from('users')
      .update({
        ai_calls_used: newUsage,
        ai_calls_reset_date: new Date().toISOString().split('T')[0]
      })
      .eq('userId', user.userId);
    
    if (updateError) {
      console.error('Error updating AI usage:', updateError);
      return;
    }
    
    console.log(`✅ Updated AI usage to: ${newUsage}`);
    
    // Log the usage
    const { error: logError } = await supabase
      .from('usage_logs')
      .insert({
        user_id: user.userId,
        action_type: 'ai_call',
        metadata: { timestamp: new Date().toISOString() }
      });
    
    if (logError) {
      console.error('Error logging usage:', logError);
    } else {
      console.log('✅ Logged usage in usage_logs');
    }
    
    // Verify the update
    const { data: updatedUser, error: verifyError } = await supabase
      .from('users')
      .select('ai_calls_used')
      .eq('userId', user.userId)
      .single();
    
    if (verifyError) {
      console.error('Error verifying update:', verifyError);
    } else {
      console.log(`✅ Verified: AI calls now = ${updatedUser.ai_calls_used}`);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAiIncrement();

