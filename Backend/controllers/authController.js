const supabase = require('../config/supabaseClient.js');
const jwt = require('jsonwebtoken');

// Register a new user
exports.register = async (req, res) => {
    const { email, password, full_name, role } = req.body;

    try {
        // 1. Create user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name, role: role || 'volunteer' }, // Store metadata
            },
        });

        if (authError) throw authError;

        // 2. Profile creation is handled by Supabase Trigger (see schema),
        // but we can return the auth data.

        // Note: If email confirmation is enabled in Supabase, the user won't be able to login immediately.
        res.status(201).json({
            message: 'Registration successful. Please check your email for verification if enabled.',
            user: authData.user
        });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Login user
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        // Supabase returns its own access_token, but the prompt asks for a custom JWT mechanism 
        // or typically we use Supabase's. 
        // However, to follow the prompt's "JWT Authentication" requirement strictly 
        // and "How it validates users... JWT generation", we can either use Supabase's token 
        // OR generate our own if we were doing custom auth.
        // 
        // Since we are using Supabase Auth, it's best practice to use Supabase's token.
        // But if the prompt implies we generate it (e.g. if we were just using Supabase as a DB),
        // we would do that. Given "Login flow (Supabase Auth + profile creation)" in registration
        // and "Login flow (credential verification + JWT generation)" in prompt.
        // 
        // I will return the Supabase session which contains the JWT. 
        // If we needed to sign our own, we'd use jwt.sign(). 
        // Using Supabase's token is safer and easier for RLS.

        // Let's create a custom token IF the prompt strictly meant "Backend generates JWT".
        // But typically Supabase `signInWithPassword` returns a valid JWT.
        // We will return the session access_token.

        res.json({
            message: 'Login successful',
            token: data.session.access_token,
            user: data.user
        });

    } catch (error) {
        res.status(401).json({ error: error.message });
    }
};
