"use client";

import { Menu, Transition } from '@headlessui/react';
import { EllipsisHorizontalIcon, PlusIcon } from '@heroicons/react/24/solid';
import { Fragment } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSidebarStore } from '@/stores/sidebarStore';

interface TrackContextMenuProps {
    trackId: string;
}

export default function TrackContextMenu({ trackId }: TrackContextMenuProps) {
    const { isAuthenticated } = useAuthStore();
    const playlists = useSidebarStore((state) => state.playlists);
    const addTrackToPlaylist = useSidebarStore((state) => state.addTrackToPlaylist);

    if (!isAuthenticated) return null;

    const handleAddToPlaylist = async (playlistId: string) => {
        await addTrackToPlaylist(playlistId, trackId);
        alert('Track added to playlist!');
    };

    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <Menu.Button className="p-1 rounded-full hover:bg-gray-700">
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
                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-600 rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                    <div className="px-1 py-1">
                        <Menu as="div" className="relative">
                            <Menu.Button as="div">
                                <Menu.Item>
                                    {({ active }) => (
                                        <button className={`${active ? 'bg-gray-700' : ''} group flex w-full items-center rounded-md px-2 py-2 text-sm`}>
                                            <PlusIcon className="mr-2 h-5 w-5" />
                                            Add to playlist
                                        </button>
                                    )}
                                </Menu.Item>
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
                                <Menu.Items className="absolute top-0 left-full ml-1 w-56 origin-top-left rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    {playlists.map((playlist) => (
                                        <Menu.Item key={playlist.id}>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => handleAddToPlaylist(playlist.id)}
                                                    className={`${active ? 'bg-gray-700' : ''} group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                                >
                                                    {playlist.name}
                                                </button>
                                            )}
                                        </Menu.Item>
                                    ))}
                                </Menu.Items>
                            </Transition>
                        </Menu>
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
}