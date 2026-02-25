const supabase = require('../config/supabaseClient.js');

// Get personalized notifications/matches
exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Get user profile (interests and location)
        const { data: profile, error: profError } = await supabase
            .from('profiles')
            .select('interests, location')
            .eq('id', userId)
            .single();

        if (profError) throw profError;

        // 2. Find opportunities that match interests or location
        const { data, error } = await supabase
            .from('opportunities')
            .select('*')
            .or(`category.in.(${profile.interests.join(',')}),location.ilike.%${profile.location}%`)
            .order('date', { ascending: true })
            .limit(10);

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
