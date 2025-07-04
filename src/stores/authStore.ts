import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    email: string;
    sub: string;
    role: string | string[];
    name: string;
}

interface User {
    email: string;
    id: string;
    role: string | string[];
    username: string;
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
                    email: decodedPayload.email,
                    id: decodedPayload.sub,
                    role: decodedPayload.role,
                    username: decodedPayload.name
                };

                set({ token, user, isAuthenticated: true });

            } catch (error) {
                console.error("Failed to decode token or token is invalid:", error);
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