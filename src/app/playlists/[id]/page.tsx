"use client";

import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Track {
    id: string;
    title: string;
    durationInSeconds: number;
}

interface PlaylistDetails {
    id: string;
    name: string;
    ownerName: string;
    tracks: Track[];
}

const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default function PlaylistDetailPage() {
    const params = useParams();
    const id = params.id as string;

    const [playlist, setPlaylist] = useState<PlaylistDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchPlaylistDetails = async () => {
            setIsLoading(true);
            try {
                const data = await apiClient.get<PlaylistDetails>(`/api/playlists/${id}`);
                setPlaylist(data);
            } catch (err) {
                setError('Failed to fetch playlist details.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlaylistDetails();
    }, [id]);

    if (isLoading) return <div className="text-center mt-10">Loading playlist...</div>;
    if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;
    if (!playlist) return <div className="text-center mt-10">Playlist not found.</div>;

    return (
        <div>
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-8">
                <div className="w-48 h-48 bg-gray-800 flex items-center justify-center rounded-md shadow-lg">
                </div>
                <div className="text-center sm:text-left">
                    <p className="text-sm font-bold">Playlist</p>
                    <h1 className="text-5xl md:text-7xl font-bold">{playlist.name}</h1>
                    <p className="mt-4 font-semibold">{playlist.ownerName}</p>
                </div>
            </div>

            <div>
                {playlist.tracks.length > 0 ? (
                    <ul>
                        {playlist.tracks.map((track, index) => (
                            <li key={track.id} className="grid grid-cols-[auto,1fr,auto] gap-4 p-2 rounded-md hover:bg-gray-800 items-center">
                                <span className="text-gray-400">{index + 1}</span>
                                <p className="font-semibold">{track.title}</p>
                                <span className="text-gray-400">{formatDuration(track.durationInSeconds)}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400 mt-6">This playlist is empty. Let's add some songs!</p>
                )}
            </div>
        </div>
    );
}