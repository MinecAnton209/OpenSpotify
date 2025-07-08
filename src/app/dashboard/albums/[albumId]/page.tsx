"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import apiClient, { ApiError } from '@/lib/apiClient';
import toast from 'react-hot-toast';
import ArtistGuard from '@/components/auth/ArtistGuard';
import Link from 'next/link';
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

interface Track {
    id: string;
    title: string;
    durationInSeconds: number;
    audioUrl: string | null;
}

interface AlbumDetails {
    id: string;
    title: string;
    artistId: string;
    artistName:string;
    tracks: Track[];
}

const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export default function ManageAlbumPage() {
    const params = useParams();
    const albumId = params.albumId as string;

    const [album, setAlbum] = useState<AlbumDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [newTrackTitle, setNewTrackTitle] = useState('');
    const [newTrackDuration, setNewTrackDuration] = useState('');
    const [isAddingTrack, setIsAddingTrack] = useState(false);

    const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
    const [editingTrackTitle, setEditingTrackTitle] = useState('');
    const [editingTrackDuration, setEditingTrackDuration] = useState('');
    const editTitleInputRef = useRef<HTMLInputElement>(null);

    const audioFileInputRef = useRef<HTMLInputElement>(null);

    const fetchAlbum = useCallback(async () => {
        if (!albumId) return;
        try {
            const data = await apiClient.get<AlbumDetails>(`/api/albums/${albumId}`);
            setAlbum(data);
        } catch (error) {
            toast.error("Could not load album details.");
        } finally {
            setIsLoading(false);
        }
    }, [albumId]);

    useEffect(() => {
        fetchAlbum();
    }, [fetchAlbum]);

    useEffect(() => {
        if (editingTrackId && editTitleInputRef.current) {
            editTitleInputRef.current.focus();
        }
    }, [editingTrackId]);

    const handleAddTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTrackTitle.trim() || !newTrackDuration.trim()) {
            toast.error("Both title and duration are required.");
            return;
        }
        setIsAddingTrack(true);
        try {
            await apiClient.post(`/api/artist-panel/albums/${albumId}/tracks`, {
                title: newTrackTitle,
                durationInSeconds: parseInt(newTrackDuration, 10),
            });
            toast.success("Track added successfully! Now you can upload the audio file.");
            setNewTrackTitle('');
            setNewTrackDuration('');
            fetchAlbum();
        } catch (error) {
            toast.error("Failed to add track.");
        } finally {
            setIsAddingTrack(false);
        }
    };

    const handleEditTrackClick = (track: Track) => {
        setEditingTrackId(track.id);
        setEditingTrackTitle(track.title);
        setEditingTrackDuration(String(track.durationInSeconds));
    };
    const handleCancelEdit = () => setEditingTrackId(null);

    const handleSaveTrack = async (trackId: string) => {
        try {
            await apiClient.put(`/api/artist-panel/tracks/${trackId}`, {
                title: editingTrackTitle,
                durationInSeconds: parseInt(editingTrackDuration, 10),
            });
            toast.success("Track updated!");
            setEditingTrackId(null);
            fetchAlbum();
        } catch (error) {
            toast.error("Failed to update track.");
        }
    };

    const handleDeleteTrack = async (trackId: string, trackTitle: string) => {
        if (!window.confirm(`Are you sure you want to permanently delete the track "${trackTitle}"?`)) return;
        try {
            await apiClient.delete(`/api/artist-panel/tracks/${trackId}`);
            toast.success("Track deleted!");
            fetchAlbum();
        } catch (error) {
            toast.error("Failed to delete track.");
        }
    };

    const triggerAudioFileInput = (trackId: string) => {
        if (audioFileInputRef.current) {
            audioFileInputRef.current.dataset.trackId = trackId;
            audioFileInputRef.current.click();
        }
    };

    const handleAudioUpload = async (trackId: string, file: File) => {
        if (file.size > 20 * 1024 * 1024) {
            toast.error("Audio file is too large! Maximum size is 20MB.");
            return;
        }
        const toastId = toast.loading("Uploading audio...");
        const formData = new FormData();
        formData.append('file', file);
        try {
            await apiClient.post(`/api/artist-panel/tracks/${trackId}/audio`, formData);
            toast.success("Audio uploaded successfully!", { id: toastId });
            fetchAlbum();
        } catch (error) {
            if (error instanceof ApiError) {
                if (error.status === 409) {
                    toast.error("Audio has already been uploaded for this track.", { id: toastId });
                } else {
                    const message = error.data?.message || "Failed to upload audio.";
                    toast.error(message, { id: toastId });
                }
            } else {
                toast.error("An unexpected error occurred.", { id: toastId });
            }
        }
    };

    if (isLoading) return <p className="text-center mt-10">Loading album data...</p>;
    if (!album) return <p className="text-center text-red-500 mt-10">Album not found.</p>;

    return (
        <ArtistGuard>
            <input
                type="file"
                ref={audioFileInputRef}
                className="hidden"
                accept="audio/mpeg, audio/wav, audio/ogg"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    const trackId = e.target.dataset.trackId;
                    if (file && trackId) {
                        handleAudioUpload(trackId, file);
                    }
                    if(e.target) e.target.value = "";
                }}
            />
            <div className="space-y-6">
                <div>
                    <Link href="/dashboard" className="text-sm text-gray-400 hover:underline">← Back to Dashboard</Link>
                    <h1 className="text-3xl font-bold mt-2">Manage Album: {album.title}</h1>
                    <p className="text-gray-400">by {album.artistName}</p>
                </div>

                <form onSubmit={handleAddTrack} className="bg-gray-800 p-4 rounded-lg flex flex-col sm:flex-row sm:items-end gap-4">
                    <div className="flex-1">
                        <label htmlFor="trackTitle" className="block text-sm font-medium mb-1">Track Title</label>
                        <input id="trackTitle" type="text" value={newTrackTitle} onChange={e => setNewTrackTitle(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md" required />
                    </div>
                    <div className="sm:w-32">
                        <label htmlFor="trackDuration" className="block text-sm font-medium mb-1">Duration (sec)</label>
                        <input id="trackDuration" type="number" value={newTrackDuration} onChange={e => setNewTrackDuration(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md" required />
                    </div>
                    <button type="submit" disabled={isAddingTrack} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md font-bold disabled:opacity-50 h-11 w-full sm:w-auto">
                        {isAddingTrack ? 'Adding...' : 'Add Track'}
                    </button>
                </form>

                <div>
                    <h2 className="text-xl font-bold mb-2">Tracks ({album.tracks.length})</h2>
                    <div className="bg-gray-800 p-4 rounded-lg">
                        <ul className="space-y-2">
                            {album.tracks.map((track, index) => (
                                <li key={track.id} className="flex justify-between items-center p-2 hover:bg-gray-700/50 rounded-md min-h-[48px]">
                                    {editingTrackId === track.id ? (
                                        <div className="flex-1 flex items-center gap-2">
                                            <input ref={editTitleInputRef} type="text" value={editingTrackTitle} onChange={e => setEditingTrackTitle(e.target.value)} className="flex-1 bg-gray-600 p-1 rounded-md" />
                                            <input type="number" value={editingTrackDuration} onChange={e => setEditingTrackDuration(e.target.value)} className="w-24 bg-gray-600 p-1 rounded-md" />
                                            <button onClick={() => handleSaveTrack(track.id)} className="p-1 text-green-400 hover:text-green-300" title="Save"><CheckIcon className="w-5 h-5"/></button>
                                            <button onClick={handleCancelEdit} className="p-1 text-gray-400 hover:text-white" title="Cancel"><XMarkIcon className="w-5 h-5"/></button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-3 flex-1">
                                                <span className="w-8 text-gray-400">{index + 1}.</span>
                                                <span>{track.title}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-gray-400">{formatDuration(track.durationInSeconds)}</span>
                                                {track.audioUrl ? (
                                                    <div className="w-8 h-8 flex items-center justify-center" title="Audio uploaded">
                                                        <CheckIcon className="w-5 h-5 text-green-500" />
                                                    </div>
                                                ) : (
                                                    <button onClick={() => triggerAudioFileInput(track.id)} title="Upload audio file" className="p-1 w-8 h-8 flex items-center justify-center">
                                                        <ArrowUpTrayIcon className="w-5 h-5 text-gray-400 hover:text-white" />
                                                    </button>
                                                )}
                                                <button onClick={() => handleEditTrackClick(track)} title="Edit track" className="p-1">
                                                    <PencilIcon className="w-5 h-5 text-gray-400 hover:text-white" />
                                                </button>
                                                <button onClick={() => handleDeleteTrack(track.id, track.title)} title="Delete track" className="p-1">
                                                    <TrashIcon className="w-5 h-5 text-gray-400 hover:text-red-500" />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </li>
                            ))}
                            {album.tracks.length === 0 && <p className="text-gray-400 text-center py-4">This album has no tracks yet. Add one using the form above.</p>}
                        </ul>
                    </div>
                </div>
            </div>
        </ArtistGuard>
    );
}