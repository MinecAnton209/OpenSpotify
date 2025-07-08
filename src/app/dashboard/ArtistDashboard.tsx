"use client";

import { useEffect, useState, useCallback, useRef, Fragment } from 'react';
import apiClient from '@/lib/apiClient';
import toast from 'react-hot-toast';
import Skeleton from '@/components/ui/Skeleton';
import Modal from '@/components/Modal';
import Link from 'next/link';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { resolveImageUrl } from '@/lib/utils';

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
    const [newAlbumCoverFile, setNewAlbumCoverFile] = useState<File | null>(null);
    const [isSubmittingAlbum, setIsSubmittingAlbum] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchData = useCallback(async () => {
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
        setNewAlbumCoverFile(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleCreateAlbumClick = () => {
        handleCloseModal();
        setIsAlbumModalOpen(true);
    };

    const handleEditAlbumClick = (album: Album) => {
        setEditingAlbum(album);
        setNewAlbumTitle(album.title);
        setNewAlbumCoverFile(null);
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
            if (editingAlbum) {
                await apiClient.put(`/api/artist-panel/albums/${editingAlbum.id}`, { title: newAlbumTitle, coverImageUrl: editingAlbum.coverImageUrl });
                if (newAlbumCoverFile) {
                    const formData = new FormData();
                    formData.append('file', newAlbumCoverFile);
                    await apiClient.post(`/api/artist-panel/albums/${editingAlbum.id}/cover`, formData);
                }
                toast.success("Album updated successfully!");
            } else {
                const newAlbum = await apiClient.post<Album>('/api/artist-panel/albums', { title: newAlbumTitle, coverImageUrl: null });
                if (newAlbumCoverFile) {
                    const formData = new FormData();
                    formData.append('file', newAlbumCoverFile);
                    await apiClient.post(`/api/artist-panel/albums/${newAlbum.id}/cover`, formData);
                }
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
        if (!window.confirm(`Are you sure you want to delete the album "${albumTitle}"? All tracks within it will also be permanently deleted.`)) return;
        try {
            await apiClient.delete(`/api/artist-panel/albums/${albumId}`);
            toast.success("Album deleted successfully!");
            fetchData();
        } catch (error) {
            toast.error("Failed to delete album.");
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="bg-gray-800 p-6 rounded-lg space-y-4 animate-pulse">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <div className="flex justify-end">
                        <Skeleton className="h-12 w-32 rounded-full" />
                    </div>
                </div>
                <div className="bg-gray-800 p-6 rounded-lg animate-pulse">
                    <Skeleton className="h-8 w-1/4 mb-4" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i}><Skeleton className="w-full aspect-square rounded-md" /></div>
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
        <Fragment>
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
                        onClick={handleCreateAlbumClick}
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full font-bold transition-colors"
                    >
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
                                    <img src={resolveImageUrl(album.coverImageUrl)} alt={album.title} className="w-full aspect-square mb-2 rounded-md"/>
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
                        <label htmlFor="albumCoverFile" className="block text-sm font-medium mb-1">
                            Cover Image {editingAlbum ? '(Leave blank to keep current)' : ''}
                        </label>
                        <input
                            id="albumCoverFile"
                            type="file"
                            ref={fileInputRef}
                            accept="image/jpeg, image/png, image/webp"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    if (e.target.files[0].size > 5 * 1024 * 1024) {
                                        toast.error("File is too large! Maximum size is 5MB.");
                                        e.target.value = "";
                                    } else {
                                        setNewAlbumCoverFile(e.target.files[0]);
                                    }
                                }
                            }}
                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-700 cursor-pointer"
                        />
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={handleCloseModal} className="text-gray-300 hover:text-white">Cancel</button>
                        <button type="submit" disabled={isSubmittingAlbum} className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-full font-bold disabled:opacity-50">
                            {isSubmittingAlbum ? 'Saving...' : (editingAlbum ? 'Save Changes' : 'Create Album')}
                        </button>
                    </div>
                </form>
            </Modal>
        </Fragment>
    );
}