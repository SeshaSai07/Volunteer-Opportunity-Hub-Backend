const supabase = require('../config/supabaseClient.js');

// Join an opportunity
exports.joinOpportunity = async (req, res) => {
    try {
        const userId = req.user.id;
        let { opportunityId } = req.body;

        // Handle case where user accidentally sends an array (e.g., pasting all Search results)
        if (Array.isArray(req.body) && req.body.length > 0) {
            opportunityId = req.body[0].id || req.body[0].opportunityId;
            console.log('Detected array input, extracted opportunityId:', opportunityId);
        }

        if (!opportunityId) {
            return res.status(400).json({
                error: 'Missing opportunityId in request body.',
                details: 'Make sure your JSON body looks like { "opportunityId": "ID_HERE" }. Do not paste the brackets [ ] from the search results.'
            });
        }

        console.log(`Join attempt: User ${userId} joining Opp ${opportunityId}`);

        // 1. Check Opportunity Capacity
        const { data: opportunity, error: oppError } = await supabase
            .from('opportunities')
            .select('spots_available')
            .eq('id', opportunityId)
            .single();

        if (oppError) throw oppError;

        // 2. Count current active signups
        const { count: currentCount, error: countError } = await supabase
            .from('volunteer_logs')
            .select('*', { count: 'exact', head: true })
            .eq('opportunity_id', opportunityId)
            .in('status', ['registered', 'attended', 'completed']);

        if (countError) throw countError;

        // 3. Determine status
        const isFull = currentCount >= (opportunity.spots_available || 10);
        const finalStatus = isFull ? 'waitlisted' : 'registered';

        const { data, error } = await supabase
            .from('volunteer_logs')
            .insert([
                { user_id: userId, opportunity_id: opportunityId, status: finalStatus }
            ])
            .select();

        if (error) {
            console.error('Join error detail:', error);
            throw error;
        }

        const message = isFull
            ? 'Opportunity is full! You have been added to the waitlist.'
            : 'Successfully joined!';

        res.status(201).json({ message, log: data[0] });

    } catch (error) {
        console.error('Join failed:', error.message);

        // Handle specific Postgres errors
        if (error.code === '23505') {
            return res.status(400).json({ error: 'You have already joined this opportunity.' });
        }
        if (error.code === '23503') {
            return res.status(400).json({
                error: 'Invalid ID reference.',
                details: 'The opportunityId you provided does not exist in the database. Please copy a fresh ID from Step 6.'
            });
        }
        if (error.code === '22P02') {
            return res.status(400).json({
                error: 'Malformed ID.',
                details: 'The opportunityId must be a valid UUID (e.g., a8c6...). Make sure you are not pasting a title or email by mistake.'
            });
        }

        res.status(400).json({ error: error.message, details: error.details });
    }
};

// Get volunteer hours/history with Pagination
exports.getVolunteerHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10 } = req.query;

        // Calculate pagination offset
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        const { data, count, error } = await supabase
            .from('volunteer_logs')
            .select(`
                *,
                opportunities (title, date, location)
            `, { count: 'exact' })
            .eq('user_id', userId)
            .range(from, to)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Calculate totals (independent of pagination for accuracy)
        const { data: allHistory } = await supabase
            .from('volunteer_logs')
            .select('hours_logged, status')
            .eq('user_id', userId);

        const totalHours = allHistory
            ? allHistory
                .filter(log => log.status === 'completed')
                .reduce((sum, log) => sum + (log.hours_logged || 0), 0)
            : 0;

        res.json({
            total_logs: count,
            total_hours: totalHours,
            page: parseInt(page),
            limit: parseInt(limit),
            history: data
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
