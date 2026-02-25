const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rate Limiting: Prevent API abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Volunteer Opportunities Hub API is running!' });
});

// Import Routes
const authRoutes = require('./routes/authRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const opportunityRoutes = require('./routes/opportunityRoutes.js');
const volunteerRoutes = require('./routes/volunteerRoutes.js');
const notificationRoutes = require('./routes/notificationRoutes.js');
const reviewRoutes = require('./routes/reviewRoutes.js');
const groupRoutes = require('./routes/groupRoutes.js');
const eventRoutes = require('./routes/eventRoutes.js');
const shareRoutes = require('./routes/shareRoutes.js');
const resourceRoutes = require('./routes/resourceRoutes.js');
const messageRoutes = require('./routes/messageRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');
const errorMiddleware = require('./middleware/errorMiddleware.js');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/volunteer', volunteerRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/share', shareRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handling
app.use(errorMiddleware);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Supabase URL: ${process.env.SUPABASE_URL ? 'Set' : 'Not Set'}`);
});
