const supabase = require('../config/supabaseClient.js');

exports.getShareData = async (req, res) => {
    try {
        const { id } = req.params;

        const { data: opportunity, error } = await supabase
            .from('opportunities')
            .select('title, description, location, date')
            .eq('id', id)
            .single();

        if (error) throw error;

        // Generate share content
        const shareText = `Check out this volunteer opportunity: ${opportunity.title} at ${opportunity.location}! #VolunteerHub`;
        const shareUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/opportunities/${id}`;

        res.json({
            title: opportunity.title,
            text: shareText,
            url: shareUrl,
            hashtags: ['Volunteer', 'Community', 'Impact']
        });

    } catch (error) {
        res.status(404).json({ error: 'Opportunity not found' });
    }
};
