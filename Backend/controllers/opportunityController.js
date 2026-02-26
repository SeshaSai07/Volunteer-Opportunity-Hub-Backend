const supabase = require('../config/supabaseClient.js');

// Get all opportunities with filters & Pagination
exports.getAllOpportunities = async (req, res) => {
    try {
        const { location, type, category, search, page = 1, limit = 10 } = req.query;

        // Calculate pagination offset
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabase.from('opportunities').select('*', { count: 'exact' });

        if (location) query = query.ilike('location', `%${location}%`);
        if (type) query = query.eq('type', type);
        if (category) query = query.eq('category', category);

        // Full-Text Search Simulation: Search title OR description
        if (search) {
            query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
        }

        // Apply Pagination
        query = query.range(from, to).order('created_at', { ascending: false });

        const { data, count, error } = await query;

        if (error) throw error;

        res.json({
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            results: data
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get single opportunity
exports.getOpportunityById = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('opportunities')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(404).json({ error: 'Opportunity not found' });
    }
};

// Create opportunity (Org/Admin only)
exports.createOpportunity = async (req, res) => {
    try {
        // Ideally check if user role is 'organization' or 'admin'
        // For now assuming middleware handles role check or we check here
        // const userRole = req.user.role; // if we added role to JWT

        const { title, description, category, location, type, date, duration_hours, required_skills } = req.body;

        // Normalize 'type' to lowercase to match the DB check constraint
        // DB constraint should accept: 'in-person', 'remote', 'hybrid'
        const validTypes = ['in-person', 'remote', 'hybrid'];
        const normalizedType = type ? type.toLowerCase().trim() : '';

        if (!validTypes.includes(normalizedType)) {
            return res.status(400).json({
                error: `Invalid type "${type}". Must be one of: in-person, remote, hybrid`
            });
        }

        // Auto-assign org_id to current user
        const org_id = req.user.id;

        const { data, error } = await supabase
            .from('opportunities')
            .insert([
                { org_id, title, description, category, location, type: normalizedType, date, duration_hours, required_skills }
            ])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);

    } catch (error) {
        console.error('Create Opportunity Error:', error.message);
        res.status(400).json({ error: error.message });
    }
};
