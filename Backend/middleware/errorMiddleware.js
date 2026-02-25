/**
 * GLOBAL ERROR HANDLING MIDDLEWARE
 * 
 * This middleware catches any unhandled errors in the request-response cycle
 * and returns a clean JSON response instead of a crash or HTML error page.
 */
const errorMiddleware = (err, req, res, next) => {
    console.error('SERVER_ERROR:', err.stack);

    const statusCode = err.status || 500;

    res.status(statusCode).json({
        error: err.name || 'Internal Server Error',
        message: err.message || 'Something went wrong on the server.',
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
};

module.exports = errorMiddleware;
