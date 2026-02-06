import jwt from 'jsonwebtoken';
import { UnauthorizedError } from './errors.js';

/**
 * JWT payload interface
 */
export interface JWTPayload {
    id: string;
    email: string;
    [key: string]: any;
}

/**
 * Generate a JWT token
 * 
 * @param payload - Data to encode in the token
 * @param expiresIn - Token expiration time (default from env)
 * @returns Signed JWT token
 */
export function generateToken(payload: JWTPayload, expiresIn?: string): string {
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }

    const expiry = expiresIn || process.env.JWT_EXPIRES_IN || '7d';

    return jwt.sign(payload, secret, { expiresIn: expiry });
}

/**
 * Verify and decode a JWT token
 * 
 * @param token - JWT token to verify
 * @returns Decoded token payload
 * @throws UnauthorizedError if token is invalid or expired
 */
export function verifyToken(token: string): JWTPayload {
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }

    try {
        const decoded = jwt.verify(token, secret) as JWTPayload;
        return decoded;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new UnauthorizedError('Token has expired');
        } else if (error instanceof jwt.JsonWebTokenError) {
            throw new UnauthorizedError('Invalid token');
        } else {
            throw new UnauthorizedError('Token verification failed');
        }
    }
}

/**
 * Extract Bearer token from Authorization header
 * 
 * @param authHeader - Authorization header value
 * @returns Extracted token or null
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) {
        return null;
    }

    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return null;
    }

    return parts[1];
}
