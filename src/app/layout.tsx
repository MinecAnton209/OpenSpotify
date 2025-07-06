import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import AuthInitializer from "@/components/AuthInitializer";
import ClientLayout from "@/components/ClientLayout";
import '@/lib/polyfills';

const inter = Inter({subsets: ["latin"]});

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
        <AuthInitializer/>
        <ClientLayout>
            {children}
        </ClientLayout>
        </body>
        </html>
    );
}