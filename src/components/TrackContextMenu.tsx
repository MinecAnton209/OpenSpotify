// src/components/TrackContextMenu.tsx
"use client";

import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { PlusIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast'; // Повертаємось до react-hot-toast
import { useSidebarStore } from '@/stores/sidebarStore';
import { useAuthStore } from '@/stores/authStore';

// 1. Описуємо пропси, які компонент приймає
interface TrackContextMenuProps {
    trackId: string;
}

// 2. Використовуємо React.FC<...> для типізації
const TrackContextMenu: React.FC<TrackContextMenuProps> = ({ trackId }) => {
    const { isAuthenticated } = useAuthStore();
    const playlists = useSidebarStore((state) => state.playlists);
    const addTrackToPlaylist = useSidebarStore((state) => state.addTrackToPlaylist);

    if (!isAuthenticated) {
        return null;
    }

    const handleAddToPlaylist = async (playlistId: string) => {
        try {
            await addTrackToPlaylist(playlistId, trackId);
            const playlistName = playlists.find(p => p.id === playlistId)?.name || 'playlist';

            // setTimeout тут більше не потрібен, оскільки ми вирішили основну проблему
            toast.success(`Added to ${playlistName}`);

        } catch (error) {
            toast.error("Failed to add track. It might already be in this playlist.");
        }
    };

    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <Menu.Button className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white">
                    <EllipsisHorizontalIcon className="w-5 h-5" />
                </Menu.Button>
            </div>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
                    <div className="px-1 py-1">
                        {/* Вкладене меню реалізоване через CSS group-hover */}
                        <div className="relative group/add">
                            <div className='group flex w-full items-center rounded-md px-2 py-2 text-sm text-white cursor-default'>
                                <PlusIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                                Add to playlist
                            </div>
                            <div className="absolute left-full -top-2 w-56 p-1 rounded-md bg-gray-700 shadow-lg hidden group-hover/add:block">
                                {playlists.length > 0 ? (
                                    playlists.map(playlist => (
                                        <Menu.Item key={playlist.id}>
                                            {({ active, close }) => ( // Отримуємо 'close'
                                                <button
                                                    onClick={() => {
                                                        handleAddToPlaylist(playlist.id);
                                                        close(); // Закриваємо меню після кліку
                                                    }}
                                                    className={`${active ? 'bg-gray-600' : ''} group flex w-full items-center rounded-md px-2 py-2 text-sm text-left text-white`}
                                                >
                                                    {playlist.name}
                                                </button>
                                            )}
                                        </Menu.Item>
                                    ))
                                ) : (
                                    <p className="text-gray-400 text-sm p-2">You have no playlists yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
};

export default TrackContextMenu;