// Robust Auth Diagnosis Script
// Run via: node diagnose_auth.js

async function diagnose() {
    const email = `test_org_${Date.now()}@example.com`;
    const password = 'Password123!';
    let token = '';

    console.log('🔍 Starting Diagnosis...');

    // 1. Register
    console.log('\n--> 1. Registering new user...');
    try {
        const res = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, full_name: 'Test Org' })
        });
        const data = await res.json();
        if (res.ok) {
            console.log('✅ Registered:', data.user.email);
        } else {
            console.log('⚠️ Registration note:', data.error || data);
        }
    } catch (e) { console.error('❌ Register failed:', e.message); }

    // 2. Login
    console.log('\n--> 2. Logging in...');
    try {
        const res = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (!res.ok) {
            console.error('❌ Login Failed:', data);
            return;
        }
        token = data.token;
        console.log('✅ Login Successful. Token present.');
    } catch (e) { console.error('❌ Login network error:', e.message); return; }

    // 3. Check Profile & Role
    console.log('\n--> 3. Checking Profile Role...');
    let currentRole = 'unknown';
    try {
        const res = await fetch('http://localhost:3000/api/users/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const profile = await res.json();

        if (res.ok) {
            currentRole = profile.role;
            console.log(`✅ Profile Found. Role: '${currentRole}'`);

            if (currentRole !== 'organization' && currentRole !== 'admin') {
                console.error(`❌ CRITICAL: Role is '${currentRole}'.`);
                console.error(`   You MUST change this to 'organization' or 'admin' in Supabase SQL Editor to create opportunities.`);
                console.error(`   Run: UPDATE public.profiles SET role = 'organization' WHERE email = '${email}';`);
            } else {
                console.log('✅ Role is correct for creating opportunities.');
            }
        } else {
            console.error('❌ Failed to get profile:', profile);
        }
    } catch (e) { console.error('❌ Profile check failed:', e.message); }

    // 4. Create Opportunity
    console.log('\n--> 4. Testing Create Opportunity...');
    try {
        const res = await fetch('http://localhost:3000/api/opportunities', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                title: "Test Event " + Date.now(),
                description: "Test Description",
                category: "Test",
                location: "Test Loc",
                type: "Virtual",
                date: new Date().toISOString(),
                duration_hours: 2
            })
        });

        const data = await res.json();

        if (res.ok) {
            console.log('✅ Opportunity Created Successfully!');
            console.log('   ID:', data.id);
        } else {
            console.error(`❌ Create failed with status ${res.status}:`, data);
            if (res.status === 401 || res.status === 403) {
                console.error('   -> This confirms RLS or Auth is blocking the request.');
            } else if (res.status === 500) {
                console.error('   -> Server Error. Check terminal logs for RLS policy violation details.');
            }
        }
    } catch (e) { console.error('❌ Create Opportunity network error:', e.message); }
}

diagnose();
