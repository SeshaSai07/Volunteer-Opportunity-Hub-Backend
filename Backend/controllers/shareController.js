const supabase = require('../config/supabaseClient.js');

// Get shareable data for an opportunity
exports.getShareData = async (req, res) => {
    try {
        const { opportunityId } = req.params;

        const { data, error } = await supabase
            .from('opportunities')
            .select('title, description, date, location')
            .eq('id', opportunityId)
            .single();

        if (error) throw error;

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const shareLink = `${frontendUrl}/opportunity/${opportunityId}`;

        const shareText = `Check out this volunteer opportunity: ${data.title}! 

📅 Date: ${new Date(data.date).toLocaleDateString()}
📍 Location: ${data.location}

Join me in making a difference! ${shareLink}`;

        res.json({
            title: data.title,
            text: shareText,
            url: shareLink
        });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
