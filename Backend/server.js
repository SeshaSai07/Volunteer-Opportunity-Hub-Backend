const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

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

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

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
});
