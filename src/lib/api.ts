const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = {
    async post(endpoint: string, data: any) {
        const token = this.getToken();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (!response.ok) {
            const errorMsg = result.error || result.message || 'Something went wrong';
            throw new Error(errorMsg);
        }
        return result;
    },

    async get(endpoint: string) {
        const token = this.getToken();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers,
        });

        const result = await response.json();
        if (!response.ok) {
            const errorMsg = result.error || result.message || 'Something went wrong';
            throw new Error(errorMsg);
        }
        return result;
    },

    setToken(token: string) {
        localStorage.setItem('umurava_token', token);
    },

    getToken() {
        return localStorage.getItem('umurava_token');
    },

    setUser(user: any) {
        localStorage.setItem('umurava_user', JSON.stringify(user));
    },

    getUser() {
        const user = localStorage.getItem('umurava_user');
        return user ? JSON.parse(user) : null;
    },

    logout() {
        localStorage.removeItem('umurava_token');
        localStorage.removeItem('umurava_user');
    }
};
