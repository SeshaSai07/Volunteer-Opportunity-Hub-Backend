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

        if (error && error.code !== 'PGRST116') {
             throw error; 
        }

        // Return profile data. If no profile exists yet, return a basic fallback using auth details
        res.json(data || { 
            id: req.user.id,
            email: req.user.email,
            full_name: req.user?.user_metadata?.full_name || 'Volunteer',
            role: req.user.role || 'volunteer',
            skills: [],
            bio: ''
        });
        
    } catch (error) {
        console.error('Profile Load Error:', error);
        // Provide the fallback rather than a 404 block for new users
        res.json({ 
            id: req.user.id,
            email: req.user.email,
            full_name: req.user?.user_metadata?.full_name || 'Volunteer',
            role: req.user.role || 'volunteer',
            skills: [],
            bio: ''
        });
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
