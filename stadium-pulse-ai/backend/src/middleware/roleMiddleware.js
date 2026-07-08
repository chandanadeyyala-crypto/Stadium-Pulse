/**
 * Role authorization middleware.
 * Verifies if the request's authenticated user possesses the correct roles.
 * 
 * Roles available:
 * - 'fan' (default viewer)
 * - 'volunteer' (staff reporting access)
 * - 'staff' (approves alerts, views details)
 * - 'organizer' (admin / full command control)
 */
export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication session is missing.'
      });
    }

    const userRole = req.user.role || 'fan';

    // Organizers have superuser status and bypass all checks
    if (userRole === 'organizer') {
      return next();
    }

    if (allowedRoles.includes(userRole)) {
      return next();
    }

    return res.status(403).json({
      error: 'Forbidden',
      message: `Access denied. Role '${userRole}' does not possess sufficient privileges.`
    });
  };
}
