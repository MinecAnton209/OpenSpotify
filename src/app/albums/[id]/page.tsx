"use client";

import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { usePlayerStore, TrackInfo } from '@/stores/playerStore';
import { resolveImageUrl } from '@/lib/utils';
import { ClockIcon, HashtagIcon, PlayCircleIcon } from '@heroicons/react/24/outline';
import TrackContextMenu from '@/components/TrackContextMenu';
import LikeButton from '@/components/LikeButton';
import MediaCover from '@/components/MediaCover';

interface Track {
    id: string;
    title: string;
    durationInSeconds: number;
    audioUrl: string | null;
    artistName: string;
    albumCoverImageUrl: string | null;
    albumName: string;
    albumId: string;
}
interface AlbumDetails {
    id: string;
    title: string;
    coverImageUrl: string | null;
    coverVideoUrl: string | null;
    artistId: string;
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
    const id = params.id as string;
    const [album, setAlbum] = useState<AlbumDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const setTrack = usePlayerStore((state) => state.setTrack);

    useEffect(() => {
        if (!id) return;
        const fetchAlbumDetails = async () => {
            setIsLoading(true);
            try {
                const data = await apiClient.get<AlbumDetails>(`/api/albums/${id}`);
                setAlbum(data);
            } catch (err) {
                setError('Failed to fetch album details.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAlbumDetails();
    }, [id]);

    const handleTrackClick = (track: Track) => {
        if (!album) return;
        const playbackQueue: TrackInfo[] = album.tracks.map(t => ({
            id: t.id,
            title: t.title,
            artistName: t.artistName,
            coverImageUrl: t.albumCoverImageUrl,
            audioUrl: t.audioUrl,
            durationInSeconds: t.durationInSeconds,
            canvasVideoUrl: null,
        }));
        const currentTrackInfo = playbackQueue.find(t => t.id === track.id);
        if (currentTrackInfo) {
            setTrack(currentTrackInfo, playbackQueue);
        }
    };

    if (isLoading) return <div className="text-center mt-10">Loading...</div>;
    if (error) return <div className="text-center mt-10 text-red-500">{error}</div>;
    if (!album) return <div className="text-center mt-10">Album not found.</div>;

    return (
        <div>
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-8">
                <MediaCover
                    imageUrl={album.coverImageUrl}
                    videoUrl={album.coverVideoUrl}
                    altText={album.title}
                    className="w-48 h-48 object-cover rounded-md shadow-lg shrink-0"
                />
                <div className="flex-grow text-center sm:text-left">
                    <p className="text-sm font-bold">Album</p>
                    <h1 className="text-5xl md:text-7xl font-bold break-words">{album.title}</h1>
                    <div className="flex items-center justify-center sm:justify-start mt-4 gap-2">
                        <Link href={`/artists/${album.artistId}`} className="font-bold hover:underline">
                            {album.artistName}
                        </Link>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-400">{album.tracks.length} songs</span>
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <div className="grid grid-cols-[auto,1fr,1fr,auto,auto] gap-4 text-gray-400 p-2 border-b border-gray-700 mb-2 sticky top-0 bg-zinc-900 z-10">
                    <HashtagIcon className="w-5 h-5 ml-2" />
                    <div>Title</div>
                    <div>Album</div>
                    <div />
                    <ClockIcon className="w-5 h-5 mr-2" />
                </div>
                <ul>
                    {album.tracks.map((track, index) => (
                        <li key={track.id} className="grid grid-cols-[auto,1fr,1fr,auto,auto] gap-4 p-2 rounded-md hover:bg-gray-800 items-center group">
                            <div className="w-8 text-center text-gray-400 cursor-pointer flex items-center justify-center" onClick={() => handleTrackClick(track)}>
                                <span className="group-hover:hidden">{index + 1}</span>
                                <PlayCircleIcon className="w-6 h-6 text-white hidden group-hover:block" />
                            </div>
                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleTrackClick(track)}>
                                <img src={resolveImageUrl(track.albumCoverImageUrl)} alt={track.title} className="w-10 h-10 rounded-sm" />
                                <div>
                                    <p className="font-semibold text-white">{track.title}</p>
                                    <p className="text-sm text-gray-400">{track.artistName}</p>
                                </div>
                            </div>
                            <div className="text-sm text-gray-400 truncate">
                                <Link href={`/albums/${album.id}`} className="hover:underline">{album.title}</Link>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                                <LikeButton trackId={track.id} />
                                <TrackContextMenu trackId={track.id} />
                            </div>
                            <span className="text-gray-400 text-right pr-2">{formatDuration(track.durationInSeconds)}</span>
                        </li>
                    ))}
                    {album.tracks.length === 0 && (<p className="text-gray-400 text-center py-4">This album has no tracks yet.</p>)}
                </ul>
            </div>
        </div>
    );
}