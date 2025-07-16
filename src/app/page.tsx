"use client";

import { useEffect, useState, useCallback } from 'react';
import apiClient from '@/lib/apiClient';
import { CardGridSkeleton } from '@/components/CardSkeleton';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';

interface Artist {
    id: string;
    name: string;
    profileImageUrl: string | null;
    isVerified: boolean;
}

interface PaginatedArtists {
    items: Artist[];
    hasNextPage: boolean;
    totalCount: number;
}

export default function HomePage() {
    const { isAuthenticated, user } = useAuthStore();
    const [artists, setArtists] = useState<Artist[]>([]);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [isAppending, setIsAppending] = useState(false);

    const fetchArtists = useCallback(async (pageNumber: number) => {
        if (pageNumber === 1) {
            setIsLoading(true);
        } else {
            setIsAppending(true);
        }

        try {
            const data = await apiClient.get<PaginatedArtists>(`/api/artists?pageNumber=${pageNumber}&pageSize=10`);

            if (pageNumber === 1) {
                setArtists(data.items);
            } else {
                setArtists(prevArtists => {
                    const newArtists = data.items.filter(newItem => !prevArtists.some(prevItem => prevItem.id === newItem.id));
                    return [...prevArtists, ...newArtists];
                });
            }

            setHasNextPage(data.hasNextPage);

        } catch (error) {
            console.error("Failed to fetch artists", error);
        } finally {
            setIsLoading(false);
            setIsAppending(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            fetchArtists(1);
        } else {
            setIsLoading(false);
        }
    }, [isAuthenticated, fetchArtists]);

    const loadMoreArtists = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchArtists(nextPage);
    };

    if (!isAuthenticated && !isLoading) {
        return (
            <div>
                <h1 className="text-3xl font-bold">Welcome to OpenSpotify!</h1>
                <p className="mt-4">Please <Link href="/login" className="text-green-400 hover:underline">log in</Link> to see the content.</p>
            </div>
        )
    }

    if (isLoading) {
        return (
            <div>
                <h1 className="text-3xl font-bold mb-6">Hello!</h1>
                <h2 className="text-2xl font-bold mb-4">Featured Artists</h2>
                <CardGridSkeleton count={10} isCircle={true} />
            </div>
        );
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

            {hasNextPage && (
                <div className="text-center mt-8">
                    <button
                        onClick={loadMoreArtists}
                        disabled={isAppending}
                        className="bg-white text-black font-bold py-2 px-6 rounded-full hover:scale-105 transition-transform disabled:opacity-50"
                    >
                        {isAppending ? "Loading..." : "Load More"}
                    </button>
                </div>
            )}
        </div>
    );
}