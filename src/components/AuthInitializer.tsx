// src/components/AuthInitializer.tsx
"use client";

import { useAuthStore } from '@/stores/authStore';
import { useEffect } from 'react';

function AuthInitializer() {
    let initialized = false;

    useEffect(() => {
        if (!initialized) {
            const token = localStorage.getItem('authToken');
            if (token) {
                useAuthStore.getState().setToken(token);
            }
            initialized = true;
        }
    }, []);

    return null;
}

export default AuthInitializer;