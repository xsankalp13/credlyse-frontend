/**
 * Cookie utilities for auth token management
 * 
 * Using cookies instead of localStorage for better cross-origin access
 * and security with HttpOnly option (when set by server).
 */

const TOKEN_COOKIE_NAME = 'credlyse_access_token';
const USER_COOKIE_NAME = 'credlyse_user';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

/**
 * Set a cookie with proper settings for cross-origin access
 */
export function setCookie(name: string, value: string, maxAge: number = COOKIE_MAX_AGE): void {
    if (typeof document === 'undefined') return;

    // For localhost development, we use SameSite=Lax
    // For production, this should be SameSite=None; Secure
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    const sameSite = isLocalhost ? 'Lax' : 'None';
    const secure = isLocalhost ? '' : '; Secure';

    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=${sameSite}${secure}`;
}

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;

    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const [cookieName, cookieValue] = cookie.trim().split('=');
        if (cookieName === name) {
            return decodeURIComponent(cookieValue);
        }
    }
    return null;
}

/**
 * Delete a cookie
 */
export function deleteCookie(name: string): void {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=; path=/; max-age=0`;
}

/**
 * Set auth token in cookie
 */
export function setAuthToken(token: string): void {
    setCookie(TOKEN_COOKIE_NAME, token);
    // Also keep in localStorage for backward compatibility and dashboard-sync
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('access_token', token);
        localStorage.setItem('credlyse_auth_token', token);
    }
}

/**
 * Get auth token from cookie (with localStorage fallback)
 */
export function getAuthToken(): string | null {
    // Try cookie first
    const cookieToken = getCookie(TOKEN_COOKIE_NAME);
    if (cookieToken) return cookieToken;

    // Fallback to localStorage
    if (typeof localStorage !== 'undefined') {
        return localStorage.getItem('access_token') || localStorage.getItem('credlyse_auth_token');
    }

    return null;
}

/**
 * Set user data in cookie
 */
export function setUserData(user: any): void {
    setCookie(USER_COOKIE_NAME, JSON.stringify(user));
    // Also keep in localStorage for dashboard-sync
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem('credlyse_user', JSON.stringify(user));
    }
}

/**
 * Get user data from cookie
 */
export function getUserData(): any | null {
    const userData = getCookie(USER_COOKIE_NAME);
    if (userData) {
        try {
            return JSON.parse(userData);
        } catch {
            return null;
        }
    }

    // Fallback to localStorage
    if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('credlyse_user');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch {
                return null;
            }
        }
    }

    return null;
}

/**
 * Clear all auth data (cookies and localStorage)
 */
export function clearAuthData(): void {
    deleteCookie(TOKEN_COOKIE_NAME);
    deleteCookie(USER_COOKIE_NAME);
    if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('credlyse_auth_token');
        localStorage.removeItem('credlyse_user');
    }
}
