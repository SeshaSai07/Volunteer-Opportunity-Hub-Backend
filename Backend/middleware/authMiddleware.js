const { supabase } = require('../config/supabaseClient.js');

const authMiddleware = async (req, res, next) => {
    const authHeader = req.header('Authorization');

    // Improved extraction: handles Bearer (any case) and trims whitespace
    const token = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();

    console.log('--- Auth Debug ---');
    console.log('Token present:', !!token);
    if (token) console.log('Token length:', token.length);

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        // Verify token by asking Supabase directly
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            console.log('Supabase Auth Error:', error?.message || 'No user found');
            return res.status(401).json({
                error: 'Invalid or expired token.',
                details: error?.message || 'User not found'
            });
        }

        console.log('User verified email:', user.email);

        // Fetch additional profile data (like role)
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        req.user = {
            ...user,
            role: profile?.role || 'volunteer'
        };
        req.token = token; // Make token available for RLS-scoped Supabase client

        console.log('User role attached:', req.user.role);
        next();
    } catch (error) {
        console.log('Auth Exception:', error.message);
        res.status(401).json({
            error: 'Authentication exception.',
            details: error.message
        });
    }
};

module.exports = authMiddleware;
