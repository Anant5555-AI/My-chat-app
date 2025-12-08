const API_BASE_URL = 'http://192.168.0.185:3000'; // Updated to local IP

async function request(path, { method = 'GET', body, token } = {}) {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    console.log(`[API] ${method} ${path}`, body ? JSON.stringify(body) : 'No body');
    const res = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
        let message = `Request failed with status ${res.status}`;
        try {
            const errorJson = await res.json();
            if (errorJson?.message) {
                message = errorJson.message;
            }
        } catch {
            // ignore JSON parse errors
        }
        const error = new Error(message);
        error.status = res.status;
        throw error;
    }

    if (res.status === 204) return null;

    return res.json();
}

export const ApiService = {
    /**
     * Exchange a scanned QR token for a session + user on mobile.
     * Backend should verify token is single-use & not expired.
     */
    async loginWithQrToken(qrToken, mobilePublicKey) {
        return request('/api/mobile/qr-login', {
            method: 'POST',
            body: { qrToken, mobilePublicKey },
        });
    },

    /**
     * Refresh session tokens. Expects backend to validate and return fresh tokens.
     */
    async refreshSession(refreshToken) {
        return request('/api/auth/refresh', {
            method: 'POST',
            body: { refreshToken },
        });
    },

    async fetchMessages(token) {
        return request('/api/messages', { token });
    },

    async deleteMessage(id, token) {
        return request('/api/messages/delete', {
            method: 'POST',
            body: { id },
            token
        });
    },
};


