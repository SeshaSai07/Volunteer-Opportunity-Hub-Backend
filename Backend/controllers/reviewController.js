const supabase = require('../config/supabaseClient.js');

// Add a review
exports.createReview = async (req, res) => {
    try {
        const userId = req.user.id;
        const { opportunityId, rating, comment } = req.body;

        // 1. Verify user completed the event
        const { data: logs, error: logError } = await supabase
            .from('volunteer_logs')
            .select('*')
            .eq('user_id', userId)
            .eq('opportunity_id', opportunityId)
            .eq('status', 'completed');

        if (logError) throw logError;

        if (!logs || logs.length === 0) {
            return res.status(403).json({ error: 'You can only review events you have completed.' });
        }

        // 2. Prevent duplicate reviews (Checked by table constraint normally, but good to check here)
        const { data: existing, error: existError } = await supabase
            .from('reviews')
            .select('*')
            .eq('reviewer_id', userId)
            .eq('opportunity_id', opportunityId);

        if (existing && existing.length > 0) {
            return res.status(400).json({ error: 'You have already reviewed this event.' });
        }

        // 3. Insert review
        const { data: review, error: reviewError } = await supabase
            .from('reviews')
            .insert([{ reviewer_id: userId, opportunity_id: opportunityId, rating, comment }])
            .select();

        if (reviewError) throw reviewError;

        res.status(201).json(review[0]);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get reviews for an opportunity
exports.getReviews = async (req, res) => {
    try {
        const { opportunityId } = req.params;

        const { data, error } = await supabase
            .from('reviews')
            .select('*, profiles(full_name, avatar_url)')
            .eq('opportunity_id', opportunityId);

        if (error) throw error;

        // Calculate Average
        const averageRating = data.length > 0
            ? data.reduce((acc, curr) => acc + curr.rating, 0) / data.length
            : 0;

        res.json({
            averageRating: averageRating.toFixed(1),
            reviews: data
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
