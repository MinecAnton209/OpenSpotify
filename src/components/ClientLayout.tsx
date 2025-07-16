"use client";

// import { useAuthStore } from "@/stores/authStore";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Player from "./Player";
import { Toaster } from 'react-hot-toast';
import AudioProvider from "@/components/AudioProvider";
import PageTransition from './PageTransition';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    // const { isAuthenticated } = useAuthStore();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return null;
    }

    return (
        <div className="flex h-screen flex-col">
            <AudioProvider />
            <Toaster
                position="bottom-center"
                toastOptions={{
                    style: {
                        background: '#333',
                        color: '#fff',
                    },
                }}
            />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-8">
                    <PageTransition>
                        {children}
                    </PageTransition>
                </main>
            </div>
            <Player />
        </div>
    );
}