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
        // Ensure user belongs to an organization or is an admin
        const userRole = req.user?.role;
        if (userRole !== 'organization' && userRole !== 'admin') {
             return res.status(403).json({ error: 'Only Organizations and Admins can post opportunities.' });
        }

        const { title, description, category, location, type, date, duration_hours, required_skills, max_volunteers } = req.body;

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

// Get volunteers for an organization's opportunities
exports.getOrgVolunteers = async (req, res) => {
    try {
        const orgId = req.user.id;
        const { status } = req.query;

        // Fetch logs directly where the linked opportunity's org_id matches the user
        let query = supabase
            .from('volunteer_logs')
            .select(`
                id,
                status,
                hours_logged,
                created_at,
                profiles (id, full_name, email),
                opportunities!inner (id, title, date, location, duration_hours, org_id)
            `)
            .eq('opportunities.org_id', orgId)
            .order('created_at', { ascending: false });

        if (status) query = query.eq('status', status);

        const { data, error } = await query;
        if (error) throw error;
        
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update volunteer log (Organization)
exports.updateOrgVolunteerLog = async (req, res) => {
    try {
        const orgId = req.user.id;
        const { logId } = req.params;
        const { status, hours_logged } = req.body;

        // 1. Verify this log belongs to an opportunity owned by this organization
        const { data: logData, error: logError } = await supabase
            .from('volunteer_logs')
            .select('opportunities!inner(org_id)')
            .eq('id', logId)
            .single();

        if (logError || !logData) {
            return res.status(404).json({ error: 'Volunteer log not found.' });
        }

        if (logData.opportunities.org_id !== orgId) {
            return res.status(403).json({ error: 'Forbidden. You do not own this opportunity.' });
        }

        // 2. Perform the update
        const validStatuses = ['registered', 'waitlisted', 'attended', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        }

        const { data, error } = await supabase
            .from('volunteer_logs')
            .update({ status, hours_logged: parseFloat(hours_logged) || 0, feedback: 'Updated by Organization' })
            .eq('id', logId)
            .select();

        if (error) throw error;
        res.json({ message: 'Log updated successfully', log: data[0] });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
