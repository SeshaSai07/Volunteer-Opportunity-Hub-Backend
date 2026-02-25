const supabase = require('../config/supabaseClient.js');

// Send a message
exports.sendMessage = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { receiverId, content } = req.body;

        if (!receiverId || !content) {
            return res.status(400).json({
                error: 'Missing fields.',
                details: 'Both receiverId and content are required in the request body.'
            });
        }

        console.log(`Message attempt: From ${senderId} to ${receiverId}`);

        const { data, error } = await supabase
            .from('messages')
            .insert([{ sender_id: senderId, receiver_id: receiverId, content }])
            .select();

        if (error) {
            console.error('Message Database Error:', error);
            throw error;
        }
        res.status(201).json(data[0]);

    } catch (error) {
        console.error('Message Send Failed:', error.message);

        // Handle specific Postgres errors
        if (error.code === '23503') {
            return res.status(400).json({
                error: 'Invalid Receiver ID.',
                details: 'The receiverId you provided does not exist. Make sure you use a valid user UUID.'
            });
        }
        if (error.code === '22P02') {
            return res.status(400).json({
                error: 'Malformed ID.',
                details: 'The receiverId must be a valid UUID string.'
            });
        }

        res.status(400).json({ error: error.message, details: error.details });
    }
};

// Get conversation with a specific user
exports.getConversation = async (req, res) => {
    try {
        const userId = req.user.id;
        const { otherUserId } = req.params;

        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`) // Messages involved user
            .or(`sender_id.eq.${otherUserId},receiver_id.eq.${otherUserId}`) // Messages involving other user
            .order('created_at', { ascending: true });

        if (error) throw error;

        // Filter strictly for the conversation between these two
        const conversation = data.filter(msg =>
            (msg.sender_id === userId && msg.receiver_id === otherUserId) ||
            (msg.sender_id === otherUserId && msg.receiver_id === userId)
        );

        res.json(conversation);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
