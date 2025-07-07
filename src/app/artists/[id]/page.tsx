"use client";

import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';
import { useParams } from 'next/navigation';
import Link from "next/link";
import Skeleton from "@/components/ui/Skeleton";
import {CardGridSkeleton} from "@/components/CardSkeleton";

interface Album {
    id: number;
    title: string;
    coverImageUrl: string | null;
}

interface ArtistDetails {
    id: number;
    name: string;
    bio: string | null;
    profileImageUrl: string | null;
    isVerified: boolean;
    albums: Album[];
}

export default function ArtistDetailPage() {
    const params = useParams();
    const id = params.id;

    const [artist, setArtist] = useState<ArtistDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchArtistDetails = async () => {
            setIsLoading(true);
            try {
                const data = await apiClient.get<ArtistDetails>(`/api/artists/${id}`);
                setArtist(data);
            } catch (err) {
                setError('Failed to fetch artist details.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchArtistDetails();
    }, [id]);

    if (isLoading) {
        return (
            <div>
                <div className="flex items-end gap-6 mb-8">
                    <Skeleton className="w-48 h-48 rounded-full" />
                    <div className="flex-1">
                        <Skeleton className="h-8 w-1/4 mb-2" />
                        <Skeleton className="h-16 w-1/2" />
                    </div>
                </div>
                <div>
                    <h2 className="text-2xl font-bold mb-4">Albums</h2>
                    <CardGridSkeleton count={4} />
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="text-center mt-10 text-red-500">{error}</div>;
    }

    if (!artist) {
        return <div className="text-center mt-10">Artist not found.</div>;
    }

    return (
        <div>
            <div className="flex items-end gap-6 mb-8">
                <img
                    src={artist.profileImageUrl || 'https://placehold.co/150'}
                    alt={artist.name}
                    className="w-48 h-48 object-cover rounded-full shadow-lg"
                />
                <div>
                    {artist.isVerified && <p className="text-sm font-bold text-blue-400">Verified Artist</p>}
                    <h1 className="text-5xl md:text-7xl font-bold">{artist.name}</h1>
                    <p className="mt-2 text-gray-300 max-w-xl">{artist.bio}</p>
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold mb-4">Albums</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {artist.albums.map((album) => (
                        <Link href={`/albums/${album.id}`} key={album.id}>
                        <div className="bg-gray-800 p-4 rounded-lg shadow-lg hover:bg-gray-700 transition-colors cursor-pointer h-full">
                                <img
                                    src={album.coverImageUrl || 'https://placehold.co/150'}
                                    alt={album.title}
                                    className="w-full h-auto object-cover rounded-md mb-4 aspect-square"
                                />
                                <h3 className="font-bold truncate">{album.title}</h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}