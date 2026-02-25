const supabase = require('../config/supabaseClient.js');

// Send message
exports.sendMessage = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { receiverId, content } = req.body;

        if (!receiverId || !content) {
            return res.status(400).json({ error: 'receiverId and content are required' });
        }

        const { data, error } = await supabase
            .from('messages')
            .insert([{ sender_id: senderId, receiver_id: receiverId, content }])
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get conversation with another user
exports.getConversation = async (req, res) => {
    try {
        const userId = req.user.id;
        const { otherUserId } = req.params;

        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
            .order('created_at', { ascending: true });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
