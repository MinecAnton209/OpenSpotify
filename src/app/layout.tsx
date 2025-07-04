// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Player from "@/components/Player";
import AuthInitializer from "@/components/AuthInitializer"; // <-- Імпорт

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "OpenSpotify",
    description: "A Spotify clone with C# and Next.js",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body className={inter.className}>
        <AuthInitializer />
        <div className="flex h-screen flex-col">
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-8">
                    {children}
                </main>
            </div>
            <Player />
        </div>
        </body>
        </html>
    );
}