"use client";

import { useAuthStore } from '@/stores/authStore';
import { useSidebarStore } from '@/stores/sidebarStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, Fragment } from 'react';
import apiClient from '@/lib/apiClient';
import { HomeIcon, MagnifyingGlassIcon, BuildingLibraryIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import Modal from './Modal';

interface Playlist {
    id: string;
    name: string;
}

const Sidebar = () => {
    const { isAuthenticated, user, logout } = useAuthStore();
    const router = useRouter();

    const { playlists, setPlaylists } = useSidebarStore();

    const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isAuthenticated) {
            setIsLoadingPlaylists(true);
            const fetchPlaylists = async () => {
                try {
                    const data = await apiClient.get<Playlist[]>('/api/playlists');
                    setPlaylists(data);
                } catch (error) {
                    console.error("Failed to fetch playlists", error);
                } finally {
                    setIsLoadingPlaylists(false);
                }
            };
            fetchPlaylists();
        } else {
            setPlaylists([]);
            setIsLoadingPlaylists(false);
        }
    }, [isAuthenticated, setPlaylists]);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const handleCreatePlaylistClick = () => {
        setNewPlaylistName('');
        setError(null);
        setIsModalOpen(true);
    };

    const handlePlaylistFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPlaylistName.trim()) {
            setError("Playlist name cannot be empty.");
            return;
        }

        setIsCreating(true);
        setError(null);

        try {
            const newPlaylist = await apiClient.post<Playlist>('/api/playlists', { name: newPlaylistName });
            setPlaylists([...playlists, newPlaylist]);
            setIsModalOpen(false);
        } catch (err) {
            setError("Failed to create playlist. Please try again.");
            console.error(err);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <Fragment>
            <aside className="w-64 bg-black p-2 shrink-0 flex flex-col">
                <div className="bg-gray-900 rounded-lg p-4 space-y-4">
                    <Link href="/" className="flex items-center gap-3 text-white font-bold text-md hover:text-gray-300">
                        <HomeIcon className="w-6 h-6" />
                        <span>Home</span>
                    </Link>
                    <Link href="/search" className="flex items-center gap-3 text-white font-bold text-md hover:text-gray-300 cursor-pointer">
                        <MagnifyingGlassIcon className="w-6 h-6" />
                        <span>Search</span>
                    </Link>
                </div>

                <div className="bg-gray-900 rounded-lg mt-2 flex-1 p-2 flex flex-col">
                    <div className="flex justify-between items-center px-2 mb-2">
                        <div className="flex items-center gap-3 text-white font-bold text-md cursor-pointer">
                            <BuildingLibraryIcon className="w-6 h-6" />
                            <span>Your Library</span>
                        </div>
                        <button onClick={handleCreatePlaylistClick} className="text-gray-400 hover:text-white" title="Create a new playlist">
                            <PlusCircleIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="overflow-y-auto flex-1">
                        {isAuthenticated ? (
                            isLoadingPlaylists ? (
                                <p className="text-gray-400 text-sm px-2">Loading playlists...</p>
                            ) : (
                                <ul className="mt-2 space-y-1">
                                    {playlists.map(playlist => (
                                        <li key={playlist.id}>
                                            <Link
                                                href={`/playlists/${playlist.id}`}
                                                className="block p-2 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white text-sm truncate"
                                            >
                                                {playlist.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )
                        ) : (
                            <p className="text-gray-400 text-sm p-4 bg-gray-800 rounded-md">Log in to see your playlists.</p>
                        )}
                    </div>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-800">
                    {isAuthenticated ? (
                        <div className="text-white p-2">
                            <p className="text-sm">Logged in as:</p>
                            <p className="font-bold truncate">{user?.username}</p>
                            <button
                                onClick={handleLogout}
                                className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Log Out
                            </button>
                        </div>
                    ) : (
                        <div className="p-2">
                            <Link href="/login">
                                <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                                    Log In
                                </button>
                            </Link>
                        </div>
                    )}
                </div>
            </aside>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Create a new playlist"
            >
                <form onSubmit={handlePlaylistFormSubmit}>
                    <div className="mb-4">
                        <label htmlFor="playlistName" className="block text-sm font-medium text-gray-300 mb-1">
                            Playlist Name
                        </label>
                        <input
                            type="text"
                            id="playlistName"
                            value={newPlaylistName}
                            onChange={(e) => setNewPlaylistName(e.target.value)}
                            className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring focus:ring-indigo-500"
                            placeholder="My Awesome Mix"
                            autoFocus
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 rounded-md text-white hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isCreating}
                            className="px-4 py-2 rounded-md bg-green-600 text-white font-bold hover:bg-green-700 disabled:bg-gray-500"
                        >
                            {isCreating ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </form>
            </Modal>
        </Fragment>
    );
};

export default Sidebar;