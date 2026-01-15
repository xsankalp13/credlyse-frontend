/**
 * Extension Integration for Credlyse Dashboard App
 * 
 * Provides utilities to sync auth state with the Chrome extension.
 * Uses chrome.runtime.sendMessage to communicate with the extension.
 */

// Check if Chrome extension API is available
function isChromeExtensionAvailable(): boolean {
    return typeof chrome !== 'undefined' &&
        typeof chrome.runtime !== 'undefined' &&
        typeof chrome.runtime.sendMessage === 'function';
}

// Discover extension ID by checking known extension IDs or using a discovery endpoint
async function discoverExtensionId(): Promise<string | null> {
    // Try common development extension IDs pattern
    // In Chrome, unpacked extensions have a unique ID based on the load path

    // Check if the extension set its ID in a known location
    const storedId = localStorage.getItem('credlyse_extension_id');
    if (storedId) {
        return storedId;
    }

    return null;
}

/**
 * Sync auth token with the Chrome extension
 * This is called after successful login in the dashboard app
 */
export async function syncTokenWithExtension(token: string, user: any): Promise<boolean> {
    console.log('[Credlyse] Attempting to sync token with extension...');

    // Always store in localStorage as fallback for same-origin scenarios
    // and for the extension to potentially poll
    try {
        localStorage.setItem('credlyse_auth_token', token);
        localStorage.setItem('credlyse_user', JSON.stringify(user));
        console.log('[Credlyse] Token stored in localStorage');
    } catch (e) {
        console.error('[Credlyse] Failed to store in localStorage:', e);
    }

    // If Chrome extension API is not available, we're done
    if (!isChromeExtensionAvailable()) {
        console.log('[Credlyse] Chrome extension API not available');
        return false;
    }

    // Try to get the extension ID
    const extensionId = await discoverExtensionId();

    if (extensionId) {
        // Send message to specific extension
        try {
            return new Promise((resolve) => {
                chrome.runtime.sendMessage(
                    extensionId,
                    { type: 'SET_AUTH_TOKEN', token, user },
                    (response) => {
                        if (chrome.runtime.lastError) {
                            console.log('[Credlyse] Extension message failed:', chrome.runtime.lastError.message);
                            resolve(false);
                        } else {
                            console.log('[Credlyse] Token synced via extension message');
                            resolve(response?.success || false);
                        }
                    }
                );
            });
        } catch (error) {
            console.error('[Credlyse] Extension messaging error:', error);
            return false;
        }
    }

    // If no extension ID, store token data for extension to discover
    // The extension will poll this when the user visits YouTube
    console.log('[Credlyse] No extension ID found, token stored for polling');
    return true;
}

/**
 * Clear auth from extension on logout
 */
export async function clearExtensionAuth(): Promise<void> {
    try {
        localStorage.removeItem('credlyse_auth_token');
        localStorage.removeItem('credlyse_user');
        console.log('[Credlyse] Cleared auth from localStorage');

        if (isChromeExtensionAvailable()) {
            const extensionId = await discoverExtensionId();
            if (extensionId) {
                chrome.runtime.sendMessage(extensionId, { type: 'LOGOUT' });
            }
        }
    } catch (error) {
        console.error('[Credlyse] Failed to clear extension auth:', error);
    }
}

/**
 * Store extension ID (called by extension during initialization)
 */
export function setExtensionId(id: string): void {
    localStorage.setItem('credlyse_extension_id', id);
}
