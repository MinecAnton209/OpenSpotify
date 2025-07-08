import { useAuthStore } from "@/stores/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5055';

const apiClient = {
    get: async <T>(endpoint: string): Promise<T> => {
        return request<T>(endpoint, 'GET');
    },
    post: async <T>(endpoint: string, body: any): Promise<T> => {
        return request<T>(endpoint, 'POST', body);
    },
    delete: async (endpoint: string): Promise<void> => {
        return request<void>(endpoint, 'DELETE');
    },
    put: async <T>(endpoint: string, body: any): Promise<T> => {
        return request<T>(endpoint, 'PUT', body);
    },
};

async function request<T>(endpoint: string, method: string, body?: any): Promise<T> {
    const { token, logout } = useAuthStore.getState();
    const isFormData = body instanceof FormData;

    const headers: HeadersInit = {
        // 'Content-Type': 'application/json',
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),

    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
        method: method,
        headers: headers,
        body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);

        if (response.status === 204) {
            return Promise.resolve(undefined as T);
        }

        if (!response.ok) {
            if (response.status === 401) {
                logout();
                window.location.href = '/login';
            }
            throw new Error(`API Error: ${response.statusText}`);
        }

        return response.json() as Promise<T>;

    } catch (error) {
        console.error("API request failed:", error);
        throw error;
    }
}

export default apiClient;