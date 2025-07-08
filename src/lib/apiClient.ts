import { useAuthStore } from "@/stores/authStore";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5055';

export class ApiError extends Error {
    status: number;
    data: any;

    constructor(message: string, status: number, data: any) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

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
        // ч'Content-Type': 'application/json',
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
            let errorData = null;
            try {
                errorData = await response.json();
            } catch (e) {
            }
            throw new ApiError(
                `API Error: ${response.statusText}`,
                response.status,
                errorData
            );
        }

        return response.json() as Promise<T>;

    } catch (error) {
        console.error("API request failed:", error);
        throw error;
    }
}

export default apiClient;