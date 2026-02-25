const supabase = require('../config/supabaseClient.js');

// Get calendar events
exports.getCalendarEvents = async (req, res) => {
    try {
        const { start, end } = req.query; // FullCalendar often sends start/end dates

        // Fetch opportunities with date >= today (or within range if provided)
        let query = supabase
            .from('opportunities')
            .select('id, title, date, duration_hours')
            .order('date', { ascending: true });

        // If range is provided
        if (start) query = query.gte('date', start);
        if (end) query = query.lte('date', end);
        else query = query.gte('date', new Date().toISOString()); // Default upcoming

        const { data, error } = await query;

        if (error) throw error;

        // Format for Frontend Calendar (e.g., FullCalendar uses title, start, end)
        const events = data.map(event => {
            const startDate = new Date(event.date);
            const endDate = new Date(startDate.getTime() + (event.duration_hours * 60 * 60 * 1000));

            return {
                id: event.id,
                title: event.title,
                start: event.date,
                end: endDate.toISOString(),
                allDay: false
            };
        });

        res.json(events);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
