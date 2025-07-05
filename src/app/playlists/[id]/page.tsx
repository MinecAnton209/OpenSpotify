"use client";

import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { usePlayerStore } from '@/stores/playerStore';
import { TrashIcon, ClockIcon, HashtagIcon, MusicalNoteIcon } from '@heroicons/react/24/outline';

interface Track {
    id: string;
    title: string;
    durationInSeconds: number;
    artistName: string;
    albumCoverImageUrl: string | null;
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

    const setTrack = usePlayerStore((state) => state.setTrack);

    useEffect(() => {
        if (!id) return;

        const fetchPlaylistDetails = async () => {
            setIsLoading(true);
            try {
                const data = await apiClient.get<PlaylistDetails>(`/api/playlists/${id}`);
                setPlaylist(data);
            } catch (err) {
                setError('Failed to fetch playlist details.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlaylistDetails();
    }, [id]);

    const handleRemoveTrack = async (trackId: string) => {
        if (!playlist) return;
        if (!confirm(`Are you sure you want to remove this track from "${playlist.name}"?`)) {
            return;
        }
        try {
            await apiClient.delete(`/api/playlists/${playlist.id}/tracks/${trackId}`);
            setPlaylist(prev => prev ? { ...prev, tracks: prev.tracks.filter(t => t.id !== trackId) } : null);
        } catch (err) {
            alert("Error: Could not remove the track.");
        }
    };

    const handleTrackClick = (track: Track) => {
        setTrack({
            id: track.id,
            title: track.title,
            artistName: track.artistName,
            coverImageUrl: track.albumCoverImageUrl,
        });
    };

    if (isLoading) return <div className="text-center mt-10">Loading playlist...</div>;
    if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;
    if (!playlist) return <div className="text-center mt-10">Playlist not found.</div>;

    return (
        <div>
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-8">
                <div className="w-48 h-48 bg-gradient-to-br from-green-600 to-gray-800 flex items-center justify-center rounded-md shadow-lg">
                    <MusicalNoteIcon className="w-24 h-24 text-white opacity-75" />
                </div>
                <div className="text-center sm:text-left">
                    <p className="text-sm font-bold">Playlist</p>
                    <h1 className="text-5xl md:text-7xl font-bold break-words">{playlist.name}</h1>
                    <p className="mt-4 font-semibold text-gray-300">{playlist.ownerName}</p>
                </div>
            </div>

            <div className="mt-6">
                {playlist.tracks.length > 0 ? (
                    <div>
                        <div className="grid grid-cols-[auto,1fr,auto,auto] gap-4 text-gray-400 p-2 border-b border-gray-700 mb-2">
                            <HashtagIcon className="w-5 h-5 ml-2" />
                            <div>Title</div>
                            <div/>
                            <ClockIcon className="w-5 h-5 mr-2" />
                        </div>
                        <ul>
                            {playlist.tracks.map((track, index) => (
                                <li key={track.id} className="grid grid-cols-[auto,1fr,auto,auto] gap-4 p-2 rounded-md hover:bg-gray-800 items-center group">
                                    <div className="w-8 text-center text-gray-400 cursor-pointer" onClick={() => handleTrackClick(track)}>
                                        {index + 1}
                                    </div>
                                    <div className="cursor-pointer" onClick={() => handleTrackClick(track)}>
                                        <p className="font-semibold text-white">{track.title}</p>
                                        <p className="text-sm text-gray-400">{track.artistName}</p>
                                    </div>
                                    <span className="text-gray-400">{formatDuration(track.durationInSeconds)}</span>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleRemoveTrack(track.id)} className="p-1 text-gray-400 hover:text-red-500" title="Remove from playlist">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <p className="text-gray-400 mt-6">This playlist is empty. Let's add some songs!</p>
                )}
            </div>
        </div>
    );
}