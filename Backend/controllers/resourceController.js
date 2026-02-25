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
        const userId = req.user.id;
        const { title, content, category } = req.body;

        // Check if user is admin (In real app, query profile role)
        // const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single();
        // if (profile.role !== 'admin') return res.status(403).json({ error: 'Admin only' });

        const { data, error } = await supabase
            .from('resources')
            .insert([{ title, content, category, author_id: userId }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
