"use client";

import { useEffect, useState, useRef } from 'react';
import apiClient from '@/lib/apiClient';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePlayerStore, TrackInfo } from '@/stores/playerStore';
import { useSidebarStore } from '@/stores/sidebarStore';
import { TrashIcon, ClockIcon, HashtagIcon, MusicalNoteIcon } from '@heroicons/react/24/outline';
import TrackContextMenu from '@/components/TrackContextMenu';
import toast from 'react-hot-toast';

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
    const router = useRouter();

    const [playlist, setPlaylist] = useState<PlaylistDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const setTrackInPlayer = usePlayerStore((state) => state.setTrack);
    const updatePlaylistNameInSidebar = useSidebarStore((state) => state.updatePlaylistName);

    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!id) return;
        const fetchPlaylistDetails = async () => {
            setIsLoading(true);
            try {
                const data = await apiClient.get<PlaylistDetails>(`/api/playlists/${id}`);
                setPlaylist(data);
                setNewName(data.name);
            } catch (err) {
                setError('Failed to fetch playlist details.');
                toast.error('Failed to fetch playlist details.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchPlaylistDetails();
    }, [id]);

    useEffect(() => {
        if (isEditing) {
            inputRef.current?.select();
        }
    }, [isEditing]);

    const handleTitleClick = () => setIsEditing(true);

    const handleNameChange = async () => {
        if (!playlist || !newName.trim() || newName === playlist.name) {
            setIsEditing(false);
            return;
        }
        try {
            await apiClient.put(`/api/playlists/${playlist.id}`, { name: newName });
            setPlaylist(prev => prev ? { ...prev, name: newName } : null);
            updatePlaylistNameInSidebar(playlist.id, newName);
            toast.success('Playlist renamed.');
        } catch (err) {
            toast.error("Could not rename the playlist.");
            setNewName(playlist.name);
        } finally {
            setIsEditing(false);
        }
    };

    const handleInputBlur = () => handleNameChange();
    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleNameChange();
        if (e.key === 'Escape') {
            setIsEditing(false);
            setNewName(playlist?.name || '');
        }
    };

    const handleRemoveTrack = async (trackId: string) => {
        if (!playlist) return;
        const track = playlist.tracks.find(t => t.id === trackId);
        if (!track) return;

        const confirmed = window.confirm(`Are you sure you want to remove "${track.title}" from "${playlist.name}"?`);
        if (!confirmed) return;

        try {
            await apiClient.delete(`/api/playlists/${playlist.id}/tracks/${trackId}`);
            setPlaylist(prev => prev ? { ...prev, tracks: prev.tracks.filter(t => t.id !== trackId) } : null);
            toast.success(`Removed "${track.title}" from playlist.`);
        } catch (err) {
            toast.error("Could not remove the track.");
        }
    };

    const handleTrackClick = (track: Track) => {
        if (!playlist) return;
        const playbackQueue: TrackInfo[] = playlist.tracks.map(t => ({
            id: t.id,
            title: t.title,
            artistName: t.artistName,
            coverImageUrl: t.albumCoverImageUrl,
        }));
        const currentTrackInfo: TrackInfo = {
            id: track.id,
            title: track.title,
            artistName: track.artistName,
            coverImageUrl: track.albumCoverImageUrl,
        };
        setTrackInPlayer(currentTrackInfo, playbackQueue);
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
                    {isEditing ? (
                        <input
                            ref={inputRef}
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onBlur={handleInputBlur}
                            onKeyDown={handleInputKeyDown}
                            className="text-5xl md:text-7xl font-bold bg-transparent border-b-2 border-white outline-none w-full"
                        />
                    ) : (
                        <h1 onClick={handleTitleClick} className="text-5xl md:text-7xl font-bold break-words cursor-pointer hover:bg-white/10 p-2 rounded-md">
                            {playlist.name}
                        </h1>
                    )}
                    <p className="mt-4 font-semibold text-gray-300">{playlist.ownerName}</p>
                </div>
            </div>

            <div className="mt-6">
                {playlist.tracks.length > 0 ? (
                    <div>
                        <div className="grid grid-cols-[auto,1fr,1fr,auto,auto] gap-4 text-gray-400 p-2 border-b border-gray-700 mb-2">
                            <HashtagIcon className="w-5 h-5 ml-2" />
                            <div>Title</div>
                            <div>Album</div>
                            <div/>
                            <ClockIcon className="w-5 h-5 mr-2" />
                        </div>
                        <ul>
                            {playlist.tracks.map((track, index) => (
                                <li key={track.id} className="grid grid-cols-[auto,1fr,1fr,auto,auto] gap-4 p-2 rounded-md hover:bg-gray-800 items-center group">
                                    <div className="w-8 text-center text-gray-400 cursor-pointer" onClick={() => handleTrackClick(track)}>
                                        {index + 1}
                                    </div>
                                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleTrackClick(track)}>
                                        <img src={track.albumCoverImageUrl || 'https://placehold.co/40'} alt="album cover" className="w-10 h-10 rounded-sm"/>
                                        <div>
                                            <p className="font-semibold text-white">{track.title}</p>
                                            <p className="text-sm text-gray-400">{track.artistName}</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-400">Album Name Here</p>
                                    <span className="text-gray-400">{formatDuration(track.durationInSeconds)}</span>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                                        <TrackContextMenu trackId={track.id} />
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