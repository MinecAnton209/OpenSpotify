"use client";

import { useEffect, useState, useCallback } from 'react';
import apiClient from '@/lib/apiClient';
import toast from 'react-hot-toast';
import Skeleton from '@/components/ui/Skeleton';
import Modal from '@/components/Modal';
import Link from 'next/link';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

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
    const [editingAlbum, setEditingAlbum] = useState<Album | null>(null);
    const [newAlbumTitle, setNewAlbumTitle] = useState('');
    const [newAlbumCoverUrl, setNewAlbumCoverUrl] = useState('');
    const [isSubmittingAlbum, setIsSubmittingAlbum] = useState(false);

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
            await apiClient.put('/api/artist-panel/profile', { bio: profile.bio, profileImageUrl: profile.profileImageUrl });
            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error("Failed to update profile.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCloseModal = () => {
        setIsAlbumModalOpen(false);
        setEditingAlbum(null);
        setNewAlbumTitle('');
        setNewAlbumCoverUrl('');
    };

    const handleCreateAlbumClick = () => {
        handleCloseModal();
        setIsAlbumModalOpen(true);
    };

    const handleEditAlbumClick = (album: Album) => {
        setEditingAlbum(album);
        setNewAlbumTitle(album.title);
        setNewAlbumCoverUrl(album.coverImageUrl || '');
        setIsAlbumModalOpen(true);
    };

    const handleAlbumFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAlbumTitle.trim()) {
            toast.error("Album title is required.");
            return;
        }
        setIsSubmittingAlbum(true);
        try {
            const albumData = { title: newAlbumTitle, coverImageUrl: newAlbumCoverUrl };
            if (editingAlbum) {
                await apiClient.put(`/api/artist-panel/albums/${editingAlbum.id}`, albumData);
                toast.success("Album updated successfully!");
            } else {
                await apiClient.post('/api/artist-panel/albums', albumData);
                toast.success(`Album "${newAlbumTitle}" created successfully!`);
            }
            handleCloseModal();
            fetchData();
        } catch (error) {
            toast.error(editingAlbum ? "Failed to update album." : "Failed to create album.");
        } finally {
            setIsSubmittingAlbum(false);
        }
    };

    const handleDeleteAlbum = async (albumId: string, albumTitle: string) => {
        if (!confirm(`Are you sure you want to delete the album "${albumTitle}"? All tracks within it will also be permanently deleted.`)) return;
        try {
            await apiClient.delete(`/api/artist-panel/albums/${albumId}`);
            toast.success("Album deleted successfully!");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete album.");
        }
    };

    if (isLoading) { /* ... скелетон ... */ }
    if (!profile) return <p>Could not find your artist profile.</p>;

    return (
        <>
            <form onSubmit={handleSaveProfile} className="bg-gray-800 p-6 rounded-lg space-y-4 mb-8">
                <h2 className="text-xl font-bold mb-4">Your Profile</h2>
                <div className="flex items-center gap-4">
                    <img
                        src={profile.profileImageUrl || 'https://placehold.co/100x100?text=No+Image'}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover"
                    />
                    <div className="flex-1">
                        <label htmlFor="profileImageUrl" className="block text-sm font-medium mb-1">Profile Image URL</label>
                        <input
                            id="profileImageUrl"
                            type="text"
                            value={profile.profileImageUrl || ''}
                            onChange={(e) => setProfile(prev => prev ? { ...prev, profileImageUrl: e.target.value } : null)}
                            className="w-full bg-gray-700 p-2 rounded-md"
                            placeholder="https://example.com/your-image.jpg"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="bio" className="block text-sm font-medium mb-1">Bio</label>
                    <textarea
                        id="bio"
                        value={profile.bio || ''}
                        onChange={(e) => setProfile(prev => prev ? { ...prev, bio: e.target.value } : null)}
                        rows={4}
                        className="w-full bg-gray-700 p-2 rounded-md"
                        placeholder="Tell us about yourself..."
                    ></textarea>
                </div>
                <button type="submit" disabled={isSaving} className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-full font-bold disabled:opacity-50">
                    {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
            </form>

            <div className="bg-gray-800 p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Your Albums</h2>
                    <button type="button" onClick={handleCreateAlbumClick} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full font-bold">
                        Create New Album
                    </button>
                </div>

                {albums.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {albums.map(album => (
                            <div key={album.id} className="group relative rounded-md overflow-hidden">
                                <Link href={`/dashboard/albums/${album.id}`} title={`Manage "${album.title}"`} className="absolute inset-0 z-10">
                                    <span className="sr-only">Manage album {album.title}</span>
                                </Link>

                                <div className="p-2 bg-gray-800 group-hover:bg-gray-700 transition-colors">
                                    <img src={album.coverImageUrl || 'https://placehold.co/150'} alt={album.title} className="w-full aspect-square mb-2 rounded-md"/>
                                    <p className="font-semibold truncate">{album.title}</p>
                                </div>

                                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                    <button onClick={() => handleEditAlbumClick(album)} className="bg-gray-900/50 p-1.5 rounded-full hover:bg-gray-900" title="Edit Album">
                                        <PencilIcon className="w-4 h-4 text-white"/>
                                    </button>
                                    <button onClick={() => handleDeleteAlbum(album.id, album.title)} className="bg-gray-900/50 p-1.5 rounded-full hover:bg-red-500" title="Delete Album">
                                        <TrashIcon className="w-4 h-4 text-white"/>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400 mt-4">You haven't created any albums yet.</p>
                )}
            </div>

            <Modal isOpen={isAlbumModalOpen} onClose={handleCloseModal} title={editingAlbum ? "Edit Album" : "Create New Album"}>
                <form onSubmit={handleAlbumFormSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="albumTitle" className="block text-sm font-medium mb-1">Album Title</label>
                        <input id="albumTitle" type="text" value={newAlbumTitle} onChange={(e) => setNewAlbumTitle(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md" required autoFocus />
                    </div>
                    <div>
                        <label htmlFor="albumCover" className="block text-sm font-medium mb-1">Cover Image URL</label>
                        <input id="albumCover" type="text" value={newAlbumCoverUrl} onChange={(e) => setNewAlbumCoverUrl(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md" />
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={handleCloseModal} className="text-gray-300 hover:text-white">Cancel</button>
                        <button type="submit" disabled={isSubmittingAlbum} className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-full font-bold disabled:opacity-50">
                            {isSubmittingAlbum ? 'Saving...' : (editingAlbum ? 'Save Changes' : 'Create Album')}
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    );
}