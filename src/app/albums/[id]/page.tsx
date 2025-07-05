"use client";

import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ClockIcon, HashtagIcon } from '@heroicons/react/24/outline';
import TrackContextMenu from '@/components/TrackContextMenu';

interface Track {
    id: number;
    title: string;
    durationInSeconds: number;
}

interface AlbumDetails {
    id: number;
    title: string;
    coverImageUrl: string | null;
    artistId: number;
    artistName: string;
    tracks: Track[];
}

const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default function AlbumDetailPage() {
    const params = useParams();
    const id = params.id;

    const [album, setAlbum] = useState<AlbumDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchAlbumDetails = async () => {
            setIsLoading(true);
            try {
                const data = await apiClient.get<AlbumDetails>(`/api/albums/${id}`);
                setAlbum(data);
            } catch (err) {
                setError('Failed to fetch album details.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAlbumDetails();
    }, [id]);

    if (isLoading) {
        return <div className="text-center mt-10">Loading album...</div>;
    }

    if (error) {
        return <div className="text-center mt-10 text-red-500">{error}</div>;
    }

    if (!album) {
        return <div className="text-center mt-10">Album not found.</div>;
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-8">
                <img
                    src={album.coverImageUrl || 'https://placehold.co/200'}
                    alt={album.title}
                    className="w-48 h-48 object-cover rounded-md shadow-lg"
                />
                <div className="text-center sm:text-left">
                    <p className="text-sm font-bold">Album</p>
                    <h1 className="text-5xl md:text-7xl font-bold">{album.title}</h1>
                    <div className="flex items-center justify-center sm:justify-start mt-4 gap-2">
                        <Link href={`/artists/${album.artistId}`} className="font-bold hover:underline">
                            {album.artistName}
                        </Link>
                        <span>•</span>
                        <span>{album.tracks.length} songs</span>
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <div className="grid grid-cols-[auto,1fr,auto] gap-4 text-gray-400 p-2 border-b border-gray-700">
                    <HashtagIcon className="w-5 h-5" />
                    <div>Title</div>
                    <ClockIcon className="w-5 h-5" />
                </div>
                <ul>
                    {album.tracks.map((track, index) => (
                        <li key={track.id} className="grid grid-cols-[auto,1fr,auto,auto] gap-4 p-2 rounded-md hover:bg-gray-800 items-center group">
                            <span className="text-gray-400">{index + 1}</span>
                            <p className="font-semibold">{track.title}</p>
                            <span className="text-gray-400">{formatDuration(track.durationInSeconds)}</span>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <TrackContextMenu trackId={track.id} />
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}