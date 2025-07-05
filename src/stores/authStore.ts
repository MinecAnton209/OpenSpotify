import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': string;
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': string;
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name': string;
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': string | string[];
}

interface User {
    email: string;
    id: string;
    username: string;
    role: string | string[];
}

interface AuthState {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    setToken: (token: string | null) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    user: null,
    isAuthenticated: false,

    setToken: (token) => {
        if (token) {
            try {
                const decodedPayload: DecodedToken = jwtDecode(token);

                localStorage.setItem('authToken', token);

                const user: User = {
                    email: decodedPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
                    id: decodedPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
                    username: decodedPayload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
                    role: decodedPayload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
                };

                set({ token, user, isAuthenticated: true });

            } catch (error) {
                console.error("Failed to decode token:", error);
                localStorage.removeItem('authToken');
                set({ token: null, user: null, isAuthenticated: false });
            }
        } else {
            localStorage.removeItem('authToken');
            set({ token: null, user: null, isAuthenticated: false });
        }
    },

    logout: () => {
        set((state) => {
            state.setToken(null);
            return {};
        });
    },
}));