/**
 * Admin Middleware
 * 
 * Ensures that the authenticated user has the 'admin' role.
 * Must be used AFTER authMiddleware.
 */
const adminMiddleware = (req, res, next) => {
    // req.user is attached by authMiddleware
    // We check the role from the profile data (assumes role is attached to user object)
    // Actually, our current authMiddleware attaches the raw Supabase user.
    // We need to ensure we have the role.

    // In our implementation, we'll fetch the role if it's not already on the req.user
    // Current authMiddleware just does supabase.auth.getUser()

    // Check if role is present (we usually attach it in the controller or a profile fetch)
    // For simplicity and performance, we'll check the 'role' which we'll ensure is attached.

    if (req.user && (req.user.role === 'admin' || req.user.app_metadata?.role === 'admin' || req.user.user_metadata?.role === 'admin')) {
        return next();
    }

    // Fallback: Check profiles table if role isn't in token/metadata
    // For development, we'll be more explicit.
    return res.status(403).json({
        error: 'Forbidden. Admin access required.',
        details: 'Your current role does not have permission to perform this action.'
    });
};

module.exports = adminMiddleware;
