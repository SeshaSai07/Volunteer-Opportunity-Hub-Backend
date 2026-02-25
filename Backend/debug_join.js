const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function debugJoin() {
    console.log('--- Debugging Join Opportunity (Step 7) ---');

    // 1. Get an existing opportunity
    const { data: opportunities, error: oppError } = await supabase
        .from('opportunities')
        .select('id, title')
        .limit(1);

    if (oppError || !opportunities || opportunities.length === 0) {
        console.error('❌ Could not find an opportunity to join. Error:', oppError);
        return;
    }
    const oppId = opportunities[0].id;
    console.log(`Found Opportunity: ${opportunities[0].title} (${oppId})`);

    // 2. Get a user profile (to simulate authentication)
    const { data: profiles, error: profError } = await supabase
        .from('profiles')
        .select('id, email')
        .limit(1);

    if (profError || !profiles || profiles.length === 0) {
        console.error('❌ Could not find a profile to use. Error:', profError);
        return;
    }
    const userId = profiles[0].id;
    console.log(`Using Profile: ${profiles[0].email} (${userId})`);

    // 3. Attempt Join
    console.log('Attempting insert into volunteer_logs...');
    const { data: joinData, error: joinError } = await supabase
        .from('volunteer_logs')
        .insert([
            { user_id: userId, opportunity_id: oppId, status: 'registered' }
        ])
        .select();

    if (joinError) {
        console.error('❌ Join Failed!');
        console.error('Error Code:', joinError.code);
        console.error('Error Message:', joinError.message);
        console.error('Error Detail:', joinError.details);

        if (joinError.code === '42P01') {
            console.error('💡 TIP: Table "volunteer_logs" might not exist or is in the wrong schema.');
        } else if (joinError.message.includes('row-level security')) {
            console.error('💡 TIP: RLS is blocking this insert. Make sure you are using the service_role key or have added a policy.');
        }
    } else {
        console.log('✅ Join Successful!', joinData);
    }
}

debugJoin();
