
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import apiClient from '@/lib/apiClient';
import toast from 'react-hot-toast';
import ArtistGuard from '@/components/auth/ArtistGuard';
import Link from 'next/link';

interface Track {
  id: string;
  title: string;
  durationInSeconds: number;
}
interface AlbumDetails {
  id: string;
  title: string;
  artistId: string;
  artistName: string;
  tracks: Track[];
}

export default function ManageAlbumPage() {
  const params = useParams();
  const albumId = params.albumId as string;

  const [album, setAlbum] = useState<AlbumDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [newTrackTitle, setNewTrackTitle] = useState('');
  const [newTrackDuration, setNewTrackDuration] = useState('');
  const [isAddingTrack, setIsAddingTrack] = useState(false);

  const fetchAlbum = useCallback(async () => {
    if (!albumId) return;
    setIsLoading(true);
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
toast.success("Track added successfully!");
setNewTrackTitle('');
setNewTrackDuration('');
fetchAlbum();
} catch (error) {
    toast.error("Failed to add track.");
} finally {
    setIsAddingTrack(false);
}
};

if (isLoading) return <p>Loading album...</p>;
if (!album) return <p>Album not found.</p>;

return (
    <ArtistGuard>
        <div className="space-y-6">
            <div>
                <Link href="/dashboard" className="text-sm text-gray-400 hover:underline">
                    ← Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold mt-2">Manage Album: {album.title}</h1>
            </div>

            <form onSubmit={handleAddTrack} className="bg-gray-800 p-4 rounded-lg flex items-end gap-4">
                <div className="flex-1">
                    <label htmlFor="trackTitle" className="block text-sm font-medium">Track Title</label>
                    <input id="trackTitle" type="text" value={newTrackTitle} onChange={e => setNewTrackTitle(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md mt-1" required />
                </div>
                <div className="w-32">
                    <label htmlFor="trackDuration" className="block text-sm font-medium">Duration (sec)</label>
                    <input id="trackDuration" type="number" value={newTrackDuration} onChange={e => setNewTrackDuration(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md mt-1" required />
                </div>
                <button type="submit" disabled={isAddingTrack} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md font-bold disabled:opacity-50 h-11">
                    {isAddingTrack ? 'Adding...' : 'Add Track'}
                </button>
            </form>

            <div>
                <h2 className="text-xl font-bold mb-2">Tracks in this Album ({album.tracks.length})</h2>
                <ul className="bg-gray-800 p-4 rounded-lg space-y-2">
                    {album.tracks.map((track, index) => (
                        <li key={track.id} className="flex justify-between items-center">
                            <span>{index + 1}. {track.title}</span>
                            <span className="text-gray-400">{Math.floor(track.durationInSeconds / 60)}:{String(track.durationInSeconds % 60).padStart(2, '0')}</span>
                        </li>
                    ))}
                    {album.tracks.length === 0 && <p className="text-gray-400">This album has no tracks yet.</p>}
                </ul>
            </div>
        </div>
    </ArtistGuard>
);
}