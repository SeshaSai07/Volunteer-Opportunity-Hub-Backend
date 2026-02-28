const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_KEY in environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to create a scoped Supabase client with the user's JWT
// This ensures that PostgreSQL Row-Level Security (RLS) policies see the user's auth.uid()
const getAuthClient = (token) => {
    return createClient(supabaseUrl, supabaseKey, {
        global: {
            headers: {
                Authorization: `Bearer ${token}`
            }
        },
        auth: {
            persistSession: false // Critical for backend environments to not leak sessions
        }
    });
};

module.exports = { supabase, getAuthClient };
