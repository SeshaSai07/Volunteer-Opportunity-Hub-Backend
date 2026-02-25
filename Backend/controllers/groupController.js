const supabase = require('../config/supabaseClient.js');

// Create a group
exports.createGroup = async (req, res) => {
    try {
        const leaderId = req.user.id;
        const { name, description, opportunityId } = req.body;

        const { data, error } = await supabase
            .from('groups')
            .insert([{ name, description, leader_id: leaderId, opportunity_id: opportunityId }])
            .select();

        if (error) throw error;

        // Add leader as member
        await supabase.from('group_members').insert([{ group_id: data[0].id, user_id: leaderId }]);

        res.status(201).json(data[0]);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Join a group
exports.joinGroup = async (req, res) => {
    try {
        const userId = req.user.id;
        const { groupId } = req.body;

        if (!groupId) {
            return res.status(400).json({
                error: 'Missing groupId in request body.',
                details: 'Make sure your JSON body is { "groupId": "PASTE_ID_HERE" }'
            });
        }

        console.log(`Join Group Attempt: User ${userId} joining Group ${groupId}`);

        const { data, error } = await supabase
            .from('group_members')
            .insert([{ group_id: groupId, user_id: userId }])
            .select();

        if (error) {
            console.error('Join Group Database Error:', error);
            throw error;
        }

        res.status(201).json({ message: 'Joined group successfully', member: data[0] });

    } catch (error) {
        console.error('Join Group Failed:', error.message);

        // Handle specific Postgres errors
        if (error.code === '23505') {
            return res.status(400).json({ error: 'You are already a member of this group.' });
        }
        if (error.code === '23503') {
            return res.status(400).json({
                error: 'Invalid ID reference.',
                details: 'The groupId you provided does not exist. Please use the ID return from Step 9 (Create Group).'
            });
        }
        if (error.code === '22P02') {
            return res.status(400).json({
                error: 'Malformed ID.',
                details: 'The groupId must be a valid UUID. Did you copy-paste the whole thing?'
            });
        }

        res.status(400).json({ error: error.message, details: error.details });
    }
};

// Get group with aggregated hours
exports.getGroupDetails = async (req, res) => {
    try {
        const { id } = req.params;

        // Get group info
        const { data: group, error: groupError } = await supabase
            .from('groups')
            .select('*, group_members(user_id)')
            .eq('id', id)
            .single();

        if (groupError) throw groupError;

        // Calculate total hours of all members for the LINKED opportunity
        let totalGroupHours = 0;
        if (group.opportunity_id) {
            const memberIds = group.group_members.map(m => m.user_id);

            const { data: logs, error: logError } = await supabase
                .from('volunteer_logs')
                .select('hours_logged')
                .eq('opportunity_id', group.opportunity_id)
                .in('user_id', memberIds)
                .eq('status', 'completed');

            if (!logError && logs) {
                totalGroupHours = logs.reduce((sum, log) => sum + (log.hours_logged || 0), 0);
            }
        }

        res.json({ ...group, totalGroupHours });

    } catch (error) {
        res.status(404).json({ error: 'Group not found' });
    }
};
