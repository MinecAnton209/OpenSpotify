"use client";

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import apiClient from '@/lib/apiClient';
import Link from 'next/link';

interface Artist {
    id: string;
    name: string;
    profileImageUrl: string | null;
    isVerified: boolean;
}

export default function HomePage() {
    const { isAuthenticated, user } = useAuthStore();
    const [artists, setArtists] = useState<Artist[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            setIsLoading(false);
            return;
        }

        const fetchArtists = async () => {
            try {
                const data = await apiClient.get<Artist[]>('/api/artists');
                console.log("Artists from API:", data);
                setArtists(data);
            } catch (err) {
                setError('Failed to fetch artists.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchArtists();
    }, [isAuthenticated]);

    if (isLoading) {
        return <div className="text-center">Loading...</div>;
    }

    if (!isAuthenticated) {
        return (
            <div>
                <h1 className="text-3xl font-bold">Welcome to OpenSpotify!</h1>
                <p className="mt-4">Please <Link href="/login" className="text-green-400 hover:underline">log in</Link> to see the content.</p>
            </div>
        )
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Hello, {user?.username}!</h1>
            <h2 className="text-2xl font-bold mb-4">Featured Artists</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {artists.map((artist) => (
                    <Link href={`/artists/${artist.id}`} key={artist.id}>
                        <div className="bg-gray-800 p-4 rounded-lg shadow-lg hover:bg-gray-700 transition-colors cursor-pointer h-full flex flex-col items-center text-center">
                            <img
                                src={artist.profileImageUrl || 'https://placehold.co/150'}
                                alt={artist.name}
                                className="w-32 h-32 object-cover rounded-full mb-4 shadow-md"
                            />
                            <div className="flex flex-col justify-center">
                                <h3 className="text-lg font-bold truncate w-full">{artist.name}</h3>
                                {artist.isVerified && (
                                    <div className="flex items-center justify-center mt-1">
                                        <span className="text-blue-400 text-xs">Verified Artist</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}