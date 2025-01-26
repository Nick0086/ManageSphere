import jwt from 'jsonwebtoken';
import query from '../utils/query.utils.js'; // Adjust the path as needed

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
};

export const authMiddleware = async (req, res, next) => {
    try {
        const accessToken = req.cookies?.accessToken;
        const refreshToken = req.cookies?.refreshToken;

        if (!accessToken && !refreshToken) {
            clearAuthCookies(res)
            return res.status(401).json({ code: 'UNAUTHORIZED', message: 'No tokens provided' });
        }

        if (accessToken) {
            try {
                const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
                req.user = decoded.userDetails;
                return next();
            } catch (accessTokenError) {
                if (accessTokenError.name === 'TokenExpiredError') {

                    if (!refreshToken) {
                        clearAuthCookies(res)
                        return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Access token expired, no refresh token provided' });
                    }

                    try {
                        const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_SECRET);
                        const sessionSql = `SELECT * FROM user_sessions WHERE refresh_token = ? AND is_revoke = 0 AND expires_at > NOW()`;
                        const sessionParams = [refreshToken];
                        const sessionResult = await query(sessionSql, sessionParams);

                        if (sessionResult.length === 0) {
                            clearAuthCookies(res)
                            return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Invalid or expired refresh token' });
                        }

                        // Generate a new access token
                        const newAccessToken = jwt.sign(
                            { userDetails: decodedRefresh.userDetails, type: 'access' },
                            process.env.JWT_SECRET,
                            { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
                        );

                        // Set the new access token in cookies
                        res.cookie('accessToken', newAccessToken, {
                            ...COOKIE_OPTIONS,
                            maxAge: 1000 * 60 * 60 * 24, // 1 day
                        });

                        // Set user data in req.user
                        req.user = decodedRefresh.userDetails;
                        return next(); // Proceed to the next middleware/route
                    } catch (refreshTokenError) {
                        return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Invalid or expired refresh token' });
                    }
                } else {
                    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Invalid access token' });
                }
            }
        }

        return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Unauthorized' });
    } catch (error) {
        console.error('Error in authMiddleware:', error);
        return res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', message: 'Internal server error' });
    }
};

// Helper function to clear auth cookies
const clearAuthCookies = (res) => {
    res.clearCookie('accessToken', COOKIE_OPTIONS);
    res.clearCookie('refreshToken', COOKIE_OPTIONS);
  };