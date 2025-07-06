"use client";

import '@/lib/polyfills';
import { useAuthStore } from '@/stores/authStore';
import { useSidebarStore } from '@/stores/sidebarStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, Fragment } from 'react';
import apiClient from '@/lib/apiClient';
import { Menu, Transition } from '@headlessui/react';
import {
    HomeIcon,
    MagnifyingGlassIcon,
    BuildingLibraryIcon,
    PlusCircleIcon,
    EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import Modal from './Modal';
import toast from "react-hot-toast";
import { useLibraryStore } from '@/stores/libraryStore';

interface Playlist {
    id: string;
    name: string;
}

const Sidebar = () => {
    const { isAuthenticated, user, logout } = useAuthStore();
    const router = useRouter();

    const { playlists, setPlaylists, addPlaylist, removePlaylist } = useSidebarStore();

    const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);
    const fetchLikedTracks = useLibraryStore(state => state.fetchLikedTracks);

    useEffect(() => {
        if (isAuthenticated) {
            fetchLikedTracks();
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
    }, [isAuthenticated, setPlaylists, fetchLikedTracks]);

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const handleCreatePlaylistClick = () => {
        setNewPlaylistName('');
        setCreateError(null);
        setIsModalOpen(true);
    };

    const handlePlaylistFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPlaylistName.trim()) {
            setCreateError("Playlist name cannot be empty.");
            return;
        }
        setIsCreating(true);
        setCreateError(null);
        try {
            const newPlaylist = await apiClient.post<Playlist>('/api/playlists', { name: newPlaylistName });
            addPlaylist(newPlaylist);
            setIsModalOpen(false);
            toast.success(`Playlist "${newPlaylist.name}" created!`);
        } catch (err) {
            setCreateError("Failed to create playlist. Please try again.");
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeletePlaylist = async (playlistId: string, playlistName: string) => {
        if (!confirm(`Are you sure you want to delete the playlist "${playlistName}"? This action cannot be undone.`)) {
            return;
        }
        try {
            await apiClient.delete(`/api/playlists/${playlistId}`);
            removePlaylist(playlistId);
            toast.success(`Playlist "${playlistName}" deleted.`);
            if (window.location.pathname === `/playlists/${playlistId}`) {
                router.push('/');
            }
        } catch (err) {
            toast.error("Could not delete the playlist.");
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

                <div className="bg-gray-900 rounded-lg mt-2 flex-1 p-2 flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center px-2 mb-2">
                        <div className="flex items-center gap-3 text-white font-bold text-md cursor-pointer">
                            <BuildingLibraryIcon className="w-6 h-6" />
                            <span>Your Library</span>
                        </div>
                        {isAuthenticated && (
                            <button onClick={handleCreatePlaylistClick} className="text-gray-400 hover:text-white" title="Create a new playlist">
                                <PlusCircleIcon className="w-6 h-6" />
                            </button>
                        )}
                    </div>

                    <div className="overflow-y-auto flex-1">
                        {isAuthenticated ? (
                            isLoadingPlaylists ? (
                                <p className="text-gray-400 text-sm px-2">Loading playlists...</p>
                            ) : (
                                <ul className="mt-2 space-y-1">
                                    {playlists.map(playlist => (
                                        <li key={playlist.id} className="group flex items-center justify-between p-2 rounded-md hover:bg-gray-800">
                                            <Link href={`/playlists/${playlist.id}`} className="text-gray-300 hover:text-white text-sm truncate flex-1">
                                                {playlist.name}
                                            </Link>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Menu as="div" className="relative">
                                                    <Menu.Button className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white">
                                                        <EllipsisHorizontalIcon className="w-5 h-5"/>
                                                    </Menu.Button>
                                                        <Transition
                                                            as={Fragment}
                                                            enter="transition ease-out duration-100"
                                                            enterFrom="transform opacity-0 scale-95"
                                                            enterTo="transform opacity-100 scale-100"
                                                            leave="transition ease-in duration-75"
                                                            leaveFrom="transform opacity-100 scale-100"
                                                            leaveTo="transform opacity-0 scale-95"
                                                        >
                                                            <Menu.Items className="fixed z-50 w-48 rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                                <div className="px-1 py-1">
                                                                    <Menu.Item>
                                                                        {({ active }) => (
                                                                            <button
                                                                                onClick={() => handleDeletePlaylist(playlist.id, playlist.name)}
                                                                                className={`${active ? 'bg-red-600 text-white' : 'text-red-400'} group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                                                            >
                                                                                Delete playlist
                                                                            </button>
                                                                        )}
                                                                    </Menu.Item>
                                                                </div>
                                                            </Menu.Items>
                                                        </Transition>
                                                </Menu>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )
                        ) : (
                            <div className="p-4 text-center">
                                <p className="text-sm font-semibold">Create your first playlist</p>
                                <p className="text-xs text-gray-400 mt-1">It's easy, we'll help you</p>
                                <button onClick={handleCreatePlaylistClick} className="mt-4 bg-white text-black font-bold py-1 px-4 rounded-full text-sm">
                                    Create playlist
                                </button>
                            </div>
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
                    {createError && <p className="text-red-500 text-sm mb-4">{createError}</p>}
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