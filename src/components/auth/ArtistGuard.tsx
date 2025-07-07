"use client";

import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ArtistGuard({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }

        const isArtist = Array.isArray(user?.role)
            ? user.role.includes('Artist')
            : user?.role === 'Artist';

        if (!isArtist) {
            toast.error("You don't have access to this page.");
            router.push('/');
        } else {
            setIsVerified(true);
        }
    }, [isAuthenticated, user, router]);

    if (isVerified) {
        return <>{children}</>;
    }

    return <div>Checking artist permissions...</div>;
}