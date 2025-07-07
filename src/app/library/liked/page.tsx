"use client";

import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';
import { usePlayerStore, TrackInfo } from '@/stores/playerStore';
import { useAuthStore } from '@/stores/authStore';
import { useLibraryStore } from '@/stores/libraryStore';
import { ClockIcon, HashtagIcon, HeartIcon } from '@heroicons/react/24/solid';
import TrackContextMenu from '@/components/TrackContextMenu';
import LikeButton from '@/components/LikeButton';
import Skeleton from "@/components/ui/Skeleton";
import {CardGridSkeleton} from "@/components/CardSkeleton";

interface Track {
    id: string;
    title: string;
    durationInSeconds: number;
    artistName: string;
    albumCoverImageUrl: string | null;
}

const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default function LikedSongsPage() {
    const { user } = useAuthStore();
    const [tracks, setTracks] = useState<Track[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const setTrackInPlayer = usePlayerStore((state) => state.setTrack);
    const { likedTrackIds } = useLibraryStore();

    const handleUnlikeOnPage = (trackId: string) => {
        setTracks(prevTracks => prevTracks.filter(t => t.id !== trackId));
    };

    useEffect(() => {
        const fetchLikedTracks = async () => {
            setIsLoading(true);
            try {
                const data = await apiClient.get<Track[]>('/api/me/liked-tracks');
                setTracks(data);
            } catch (err) {
                setError('Failed to fetch liked songs.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLikedTracks();
    }, [likedTrackIds]);

    const handleTrackClick = (track: Track, index: number) => {
        const playbackQueue: TrackInfo[] = tracks.map(t => ({
            id: t.id,
            title: t.title,
            artistName: t.artistName,
            coverImageUrl: t.albumCoverImageUrl,
        }));

        const trackToPlay = playbackQueue[index];

        setTrackInPlayer(trackToPlay, playbackQueue.slice(index));
    };

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
    if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;

    return (
        <div>
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-8">
                <div className="w-48 h-48 bg-gradient-to-br from-indigo-600 to-purple-400 flex items-center justify-center rounded-md shadow-lg">
                    <HeartIcon className="w-24 h-24 text-white" />
                </div>
                <div className="text-center sm:text-left">
                    <p className="text-sm font-bold">Playlist</p>
                    <h1 className="text-5xl md:text-7xl font-bold">Liked Songs</h1>
                    <p className="mt-4 font-semibold text-gray-300">{user?.username} • {tracks.length} songs</p>
                </div>
            </div>

            <div className="mt-6">
                {tracks.length > 0 ? (
                    <div>
                        <div className="grid grid-cols-[auto,1fr,auto,auto,auto] gap-4 text-gray-400 p-2 border-b border-gray-700 mb-2">
                            <HashtagIcon className="w-5 h-5 ml-2" />
                            <div>Title</div>
                            <div/>
                            <div/>
                            <ClockIcon className="w-5 h-5" />
                        </div>
                        <ul>
                            {tracks.map((track, index) => (
                                <li key={track.id} className="grid grid-cols-[auto,1fr,auto,auto,auto] gap-4 p-2 rounded-md hover:bg-gray-800 items-center group">
                                    <div className="w-8 text-center text-gray-400 cursor-pointer" onClick={() => handleTrackClick(track, index)}>
                                        {index + 1}
                                    </div>
                                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleTrackClick(track, index)}>
                                        <img src={track.albumCoverImageUrl || 'https://placehold.co/40'} alt="album cover" className="w-10 h-10 rounded-sm"/>
                                        <div>
                                            <p className="font-semibold text-white">{track.title}</p>
                                            <p className="text-sm text-gray-400">{track.artistName}</p>
                                        </div>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <LikeButton trackId={track.id} onUnlike={handleUnlikeOnPage} />
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <TrackContextMenu trackId={track.id} />
                                    </div>
                                    <span className="text-gray-400 text-right pr-2">{formatDuration(track.durationInSeconds)}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : (
                    <p className="text-gray-400 mt-6">Songs you like will appear here. Save songs by tapping the heart icon.</p>
                )}
            </div>
        </div>
    );
}