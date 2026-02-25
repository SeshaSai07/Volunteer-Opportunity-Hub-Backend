const supabase = require('./config/supabaseClient');

async function checkRLS() {
    console.log('--- Checking RLS Policies ---');

    // 1. Try to fetch ANY profile anonymously (Should likely fail if RLS is on)
    const { data: anonData, error: anonError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

    console.log('Anonymous Access:', anonError ? `❌ Blocked (${anonError.message})` : '✅ Allowed');

    // 2. We can't easily check authenticated RLS from here without a valid user token,
    // but if the user says profiles exist and the backend says "Not found",
    // it means the backend (which uses the anon key by default in some contexts?) 
    // or the specific user token doesn't have permission to SELECT their own row.

    // The policy "Public profiles are viewable by everyone" should exist.
    // If it doesn't, that's the issue.

    console.log('\nRecommendation: Run this SQL in Supabase to fix RLS:');
    console.log(`
    -- Ensure profiles are readable
    DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
    CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
    
    -- Ensure users can update their own profile
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
  `);
}

checkRLS();
