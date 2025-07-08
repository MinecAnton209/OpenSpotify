"use client";

import { useEffect, useState, useCallback } from 'react';
import apiClient from '@/lib/apiClient';
import toast from 'react-hot-toast';
import Skeleton from '@/components/ui/Skeleton';
import Modal from '@/components/Modal';
import Link from 'next/link';

interface ArtistProfile {
    name: string;
    bio: string | null;
    profileImageUrl: string | null;
}
interface Album {
    id: string;
    title: string;
    coverImageUrl: string | null;
}

export default function ArtistDashboard() {
    const [profile, setProfile] = useState<ArtistProfile | null>(null);
    const [albums, setAlbums] = useState<Album[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
    const [newAlbumTitle, setNewAlbumTitle] = useState('');
    const [newAlbumCoverUrl, setNewAlbumCoverUrl] = useState('');
    const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [profileData, albumsData] = await Promise.all([
                apiClient.get<ArtistProfile>('/api/artist-panel/profile'),
                apiClient.get<Album[]>('/api/artist-panel/albums')
            ]);
            setProfile(profileData);
            setAlbums(albumsData);
        } catch (error) {
            toast.error("Could not load your dashboard data.");
            console.error("Dashboard fetch error:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;

        setIsSaving(true);
        try {
            await apiClient.put('/api/artist-panel/profile', {
                bio: profile.bio,
                profileImageUrl: profile.profileImageUrl,
            });
            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error("Failed to update profile.");
            console.error("Failed to save profile:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateAlbum = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAlbumTitle.trim()) {
            toast.error("Album title is required.");
            return;
        }

        setIsCreatingAlbum(true);
        try {
            await apiClient.post('/api/artist-panel/albums', {
                title: newAlbumTitle,
                coverImageUrl: newAlbumCoverUrl,
            });
            toast.success(`Album "${newAlbumTitle}" created successfully!`);
            setIsAlbumModalOpen(false);
            setNewAlbumTitle('');
            setNewAlbumCoverUrl('');
            fetchData();
        } catch (error) {
            toast.error("Failed to create album.");
            console.error("Failed to create album:", error);
        } finally {
            setIsCreatingAlbum(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="bg-gray-800 p-6 rounded-lg space-y-4">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <div className="flex justify-end">
                        <Skeleton className="h-12 w-32 rounded-full" />
                    </div>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg">
                    <Skeleton className="h-8 w-1/4 mb-4" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i}><Skeleton className="w-full aspect-square" /></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) {
        return <p className="text-red-500">Could not find your artist profile. Please contact support.</p>;
    }

    return (
        <>
            <form onSubmit={handleSaveProfile} className="bg-gray-800 p-6 rounded-lg space-y-4 mb-8">
                <h2 className="text-xl font-bold">Edit Your Profile ({profile.name})</h2>
                <div>
                    <label htmlFor="bio" className="block text-sm font-medium mb-1">Your Bio</label>
                    <textarea
                        id="bio"
                        rows={5}
                        className="w-full bg-gray-700 p-2 rounded-md border border-gray-600 focus:ring-green-500 focus:border-green-500"
                        value={profile.bio || ''}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        placeholder="Tell your fans a little bit about yourself..."
                    />
                </div>
                <div>
                    <label htmlFor="imageUrl" className="block text-sm font-medium mb-1">Profile Image URL</label>
                    <input
                        id="imageUrl"
                        type="text"
                        className="w-full bg-gray-700 p-2 rounded-md border border-gray-600 focus:ring-green-500 focus:border-green-500"
                        value={profile.profileImageUrl || ''}
                        onChange={(e) => setProfile({ ...profile, profileImageUrl: e.target.value })}
                        placeholder="https://example.com/your-image.jpg"
                    />
                </div>
                <div className="text-right">
                    <button type="submit" disabled={isSaving} className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-full font-bold disabled:opacity-50 transition-colors">
                        {isSaving ? 'Saving...' : 'Save Profile'}
                    </button>
                </div>
            </form>

            <div className="bg-gray-800 p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Your Albums</h2>
                    <button
                        type="button"
                        onClick={() => setIsAlbumModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full font-bold transition-colors"
                    >
                        Create New Album
                    </button>
                </div>
                {albums.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {albums.map(album => (
                            <Link href={`/dashboard/albums/${album.id}`} key={album.id} title={album.title}>
                                <div className="p-2 hover:bg-gray-700 rounded-md transition-colors">
                                    <img src={album.coverImageUrl || 'https://placehold.co/150'} alt={album.title} className="w-full aspect-square mb-2 rounded-md"/>
                                    <p className="font-semibold truncate">{album.title}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400 mt-4">You haven't created any albums yet.</p>
                )}
            </div>

            <Modal
                isOpen={isAlbumModalOpen}
                onClose={() => setIsAlbumModalOpen(false)}
                title="Create New Album"
            >
                <form onSubmit={handleCreateAlbum} className="space-y-4">
                    <div>
                        <label htmlFor="albumTitle" className="block text-sm font-medium mb-1">Album Title</label>
                        <input
                            id="albumTitle"
                            type="text"
                            value={newAlbumTitle}
                            onChange={(e) => setNewAlbumTitle(e.target.value)}
                            className="w-full bg-gray-700 p-2 rounded-md border border-gray-600 focus:ring-green-500 focus:border-green-500"
                            required
                            autoFocus
                        />
                    </div>
                    <div>
                        <label htmlFor="albumCover" className="block text-sm font-medium mb-1">Cover Image URL</label>
                        <input
                            id="albumCover"
                            type="text"
                            value={newAlbumCoverUrl}
                            onChange={(e) => setNewAlbumCoverUrl(e.target.value)}
                            className="w-full bg-gray-700 p-2 rounded-md border border-gray-600 focus:ring-green-500 focus:border-green-500"
                            placeholder="https://example.com/album-cover.jpg"
                        />
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={() => setIsAlbumModalOpen(false)} className="px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700">Cancel</button>
                        <button type="submit" disabled={isCreatingAlbum} className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-full font-bold disabled:opacity-50">
                            {isCreatingAlbum ? 'Creating...' : 'Create Album'}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
}