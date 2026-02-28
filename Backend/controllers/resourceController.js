const supabase = require('../config/supabaseClient.js');

// Get all resources
exports.getAllResources = async (req, res) => {
    try {
        const { category } = req.query;
        let query = supabase.from('resources').select('*, profiles(full_name)');

        if (category) query = query.eq('category', category);

        const { data, error } = await query;

        if (error) throw error;
        res.json(data);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get single resource
exports.getResourceById = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('resources')
            .select('*, profiles(full_name)')
            .eq('id', id)
            .single();

        if (error) throw error;
        res.json(data);

    } catch (error) {
        res.status(404).json({ error: 'Resource not found' });
    }
};

// Create resource (Admin only - simplified check)
exports.createResource = async (req, res) => {
    try {
        const { title, content, category } = req.body;
        
        // Ensure user belongs to an organization or is an admin
        const userRole = req.user?.role;
        if (userRole !== 'organization' && userRole !== 'admin') {
             return res.status(403).json({ error: 'Only Organizations and Admins can post resources.' });
        }

        const author_id = req.user.id; 

        const { data, error } = await supabase
            .from('resources')
            .insert([{ title, content, category, author_id }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete resource (Admin only)
exports.deleteResource = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from('resources').delete().eq('id', id);

        if (error) throw error;
        res.json({ message: 'Resource deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
