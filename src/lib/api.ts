let API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Ensure the URL does not have a trailing slash and ends with /api
if (API_BASE_URL.endsWith('/')) {
    API_BASE_URL = API_BASE_URL.slice(0, -1);
}

if (!API_BASE_URL.endsWith('/api')) {
    API_BASE_URL = `${API_BASE_URL}/api`;
}

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

        if (response.status === 401) {
            this.logout();
            window.location.href = '/sign-up-login-screen';
            return;
        }

        const result = await response.json();
        if (!response.ok) {
            const errorMsg = result.error || result.message || 'Something went wrong';
            throw new Error(errorMsg);
        }
        return result;
    },

    async put(endpoint: string, data: any) {
        const token = this.getToken();
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data),
        });

        if (response.status === 401) {
            this.logout();
            window.location.href = '/sign-up-login-screen';
            return;
        }

        const result = await response.json();
        if (!response.ok) {
            const errorMsg = result.error || result.message || 'Something went wrong';
            throw new Error(errorMsg);
        }
        return result;
    },

    async postForm(endpoint: string, formData: FormData) {
        const token = this.getToken();
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers,
            body: formData,
        });

        if (response.status === 401) {
            this.logout();
            window.location.href = '/sign-up-login-screen';
            return;
        }

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

        if (response.status === 401) {
            this.logout();
            window.location.href = '/sign-up-login-screen';
            return;
        }

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
