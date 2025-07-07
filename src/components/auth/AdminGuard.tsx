"use client";

import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        const isAdmin = Array.isArray(user?.role)
            ? user.role.includes('Admin')
            : user?.role === 'Admin';

        if (!isAdmin) {
            router.push('/');
        } else {
            setIsVerified(true);
        }
    }, [isAuthenticated, user, router]);

    if (isVerified) {
        return <>{children}</>;
    }

    return <div>Checking permissions...</div>;
}