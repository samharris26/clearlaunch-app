// Simple test script to check usage tracking
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUsageTracking() {
  console.log('Testing usage tracking...');
  
  try {
    // Check if columns exist
    console.log('1. Checking if plan columns exist...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('plan, ai_calls_used, ai_calls_reset_date')
      .limit(1);
    
    if (usersError) {
      console.error('Error checking users table:', usersError);
      return;
    }
    
    console.log('✅ Users table columns exist');
    
    // Check if usage_logs table exists
    console.log('2. Checking if usage_logs table exists...');
    const { data: logs, error: logsError } = await supabase
      .from('usage_logs')
      .select('*')
      .limit(1);
    
    if (logsError) {
      console.error('Error checking usage_logs table:', logsError);
      return;
    }
    
    console.log('✅ Usage_logs table exists');
    
    // Test getting a user's usage
    console.log('3. Testing user usage retrieval...');
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('userId, plan, ai_calls_used, ai_calls_reset_date')
      .limit(5);
    
    if (allUsersError) {
      console.error('Error getting users:', allUsersError);
      return;
    }
    
    console.log('Users found:', allUsers?.length || 0);
    allUsers?.forEach(user => {
      console.log(`- User ${user.userId}: Plan=${user.plan || 'free'}, AI calls=${user.ai_calls_used || 0}`);
    });
    
    // Test launches count
    console.log('4. Testing launches count...');
    if (allUsers && allUsers.length > 0) {
      const testUserId = allUsers[0].userId;
      const { data: launches, error: launchesError } = await supabase
        .from('launches')
        .select('id')
        .eq('userId', testUserId)
        .neq('status', 'completed');
      
      if (launchesError) {
        console.error('Error getting launches:', launchesError);
      } else {
        console.log(`✅ User ${testUserId} has ${launches?.length || 0} active launches`);
      }
    }
    
    console.log('✅ Usage tracking test completed successfully');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testUsageTracking();

