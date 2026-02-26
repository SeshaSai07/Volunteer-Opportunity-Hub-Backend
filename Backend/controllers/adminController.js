const supabase = require('../config/supabaseClient.js');
const { Parser } = require('json2csv');

// 1. User Management: Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. User Management: Update user role
exports.updateUserRole = async (req, res) => {
    try {
        const { userId, role } = req.body;

        if (!['volunteer', 'organization', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role type.' });
        }

        const { data, error } = await supabase
            .from('profiles')
            .update({ role })
            .eq('id', userId)
            .select();

        if (error) throw error;
        res.json({ message: `User role updated to ${role}`, profile: data[0] });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// 3. Verification Tool: Verify Volunteer Hours
exports.verifyVolunteerHours = async (req, res) => {
    try {
        const { logId, status, hoursLogged } = req.body;

        if (!['completed', 'attended', 'cancelled'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status for verification.' });
        }

        const { data, error } = await supabase
            .from('volunteer_logs')
            .update({
                status,
                hours_logged: hoursLogged || 0,
                feedback: 'Verified by Admin'
            })
            .eq('id', logId)
            .select();

        if (error) throw error;
        res.json({ message: 'Volunteer hours verified successfully!', log: data[0] });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// 4. Moderation: Delete Review
exports.deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from('reviews').delete().eq('id', id);

        if (error) throw error;
        res.json({ message: 'Review deleted by administrator.' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// 5. System Analytics: Get Stats
exports.getSystemStats = async (req, res) => {
    try {
        const { data: users } = await supabase.from('profiles').select('id', { count: 'exact' });
        const { data: opportunities } = await supabase.from('opportunities').select('id', { count: 'exact' });
        const { data: logs } = await supabase.from('volunteer_logs').select('hours_logged').eq('status', 'completed');

        const totalHours = logs ? logs.reduce((sum, log) => sum + (log.hours_logged || 0), 0) : 0;

        res.json({
            total_users: users?.length || 0,
            total_opportunities: opportunities?.length || 0,
            total_hours_served: totalHours,
            system_status: 'Healthy',
            timestamp: new Date()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 6. Admin Reporting: Export Volunteer Data to CSV
exports.exportVolunteerData = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('volunteer_logs')
            .select(`
                id,
                status,
                hours_logged,
                created_at,
                profiles (email, full_name),
                opportunities (title, location)
            `);

        if (error) throw error;

        // Flatten data for CSV
        const flatData = data.map(log => ({
            Log_ID: log.id,
            Volunteer_Name: log.profiles?.full_name || 'N/A',
            Volunteer_Email: log.profiles?.email || 'N/A',
            Opportunity_Title: log.opportunities?.title || 'N/A',
            Status: log.status,
            Hours: log.hours_logged,
            Joined_Date: new Date(log.created_at).toLocaleDateString()
        }));

        const fields = ['Log_ID', 'Volunteer_Name', 'Volunteer_Email', 'Opportunity_Title', 'Status', 'Hours', 'Joined_Date'];
        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(flatData);

        res.header('Content-Type', 'text/csv');
        res.attachment('volunteer_report.csv');
        return res.send(csv);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 7. Admin: Get All Volunteer Logs (with user & opportunity info)
exports.getVolunteerLogs = async (req, res) => {
    try {
        const { status } = req.query;

        let query = supabase
            .from('volunteer_logs')
            .select(`
                id,
                status,
                hours_logged,
                created_at,
                profiles (id, full_name, email),
                opportunities (id, title, date, location, duration_hours)
            `)
            .order('created_at', { ascending: false });

        if (status) query = query.eq('status', status);

        const { data, error } = await query;
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 8. Admin: Update a Volunteer Log status & hours inline
exports.updateVolunteerLog = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, hours_logged } = req.body;

        const validStatuses = ['registered', 'waitlisted', 'attended', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        }

        const { data, error } = await supabase
            .from('volunteer_logs')
            .update({ status, hours_logged: parseFloat(hours_logged) || 0, feedback: 'Updated by Admin' })
            .eq('id', id)
            .select();

        if (error) throw error;
        res.json({ message: 'Log updated successfully', log: data[0] });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// 9. Admin: Delete User
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        // The profiles table usually deletes cascade from auth.users, or deleting here removes them from the app
        const { error } = await supabase.from('profiles').delete().eq('id', id);
        if (error) throw error;
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// 10. Admin: Delete Opportunity
exports.deleteOpportunity = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from('opportunities').delete().eq('id', id);
        if (error) throw error;
        res.json({ message: 'Opportunity deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
