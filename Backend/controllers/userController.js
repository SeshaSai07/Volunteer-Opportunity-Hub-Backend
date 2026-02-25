const supabase = require('../config/supabaseClient.js');

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        // When using getUser(), the ID is in req.user.id
        const userId = req.user.id;

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error) {
        res.status(404).json({ error: 'Profile not found' });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const updates = req.body;

        // Prevent updating ID or Email directly via this endpoint if not desired
        delete updates.id;
        delete updates.email;

        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', userId)
            .select();

        if (error) throw error;

        res.json({ message: 'Profile updated', profile: data[0] });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
