const supabase = require('../config/supabaseClient.js');

exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Get user preferences
        const { data: user, error: userError } = await supabase
            .from('profiles')
            .select('interests, location')
            .eq('id', userId)
            .single();

        if (userError) throw userError;

        // 2. Find matching opportunities
        // Logic: Opportunity category IN user interests OR location matches
        // Note: Supabase/PostgREST uses specific syntax for array overlaps
        // 'cs' = contains, 'ov' = overlap (&& in SQL)
        // Here we use a simpler approach: get recent opportunities and filter in code 
        // OR use raw SQL via .rpc() if we had a function. 
        // To keep it simple and demonstrative as requested:

        const { data: opportunities, error: oppError } = await supabase
            .from('opportunities')
            .select('*')
            .eq('status', 'open')
            .order('created_at', { ascending: false })
            .limit(50); // Fetch recent ones

        if (oppError) throw oppError;

        // matching logic
        if (!user.interests && !user.location) {
            return res.json([{
                message: "Update your profile (Step 4) with interests or location to see matched opportunities!",
                link: "/api/users/profile",
                date: new Date()
            }]);
        }

        // Perform matching logic in JS (Rule-based)
        const notifications = opportunities.filter(opp => {
            const matchesLocation = user.location && opp.location.toLowerCase().includes(user.location.toLowerCase());
            const matchesInterest = user.interests ? user.interests.includes(opp.category) : false;
            return matchesLocation || matchesInterest;
        }).map(opp => ({
            message: `New Opportunity: ${opp.title} matches your profile!`,
            link: `/opportunities/${opp.id}`,
            date: opp.created_at
        }));

        res.json(notifications);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
