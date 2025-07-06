"use client";

import React, { Fragment, useEffect, useRef, useState } from 'react';
import { PlusIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useAuthStore } from '@/stores/authStore';
import { createPortal } from 'react-dom';

interface TrackContextMenuProps {
    trackId: string;
}

const TrackContextMenu: React.FC<TrackContextMenuProps> = ({ trackId }) => {
    const { isAuthenticated } = useAuthStore();
    const playlists = useSidebarStore((state) => state.playlists);
    const addTrackToPlaylist = useSidebarStore((state) => state.addTrackToPlaylist);

    const buttonRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const calculatePosition = () => {
        const rect = buttonRef.current?.getBoundingClientRect();
        if (!rect) return;

        const menuWidth = 250;
        const spaceRight = window.innerWidth - rect.right;
        const openLeft = spaceRight < menuWidth;

        setMenuPosition({
            top: rect.top + rect.height + 4,
            left: openLeft ? rect.right - menuWidth : rect.left,
        });
    };

    const handleOpen = () => {
        calculatePosition();
        setIsOpen(true);
    };

    const handleClose = () => setIsOpen(false);

    const handleAddToPlaylist = async (playlistId: string) => {
        try {
            await addTrackToPlaylist(playlistId, trackId);
            const playlistName = playlists.find(p => p.id === playlistId)?.name || 'playlist';
            toast.success(`Added to ${playlistName}`);
        } catch (error) {
            toast.error("Failed to add track. It might already be in this playlist.");
        }
        handleClose();
    };

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(e.target as Node)
            ) {
                handleClose();
            }
        };

        const handleScrollOrResize = () => {
            if (isOpen) calculatePosition();
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            window.addEventListener("scroll", handleScrollOrResize, true);
            window.addEventListener("resize", handleScrollOrResize);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", handleScrollOrResize, true);
            window.removeEventListener("resize", handleScrollOrResize);
        };
    }, [isOpen]);

    if (!isAuthenticated) return null;

    return (
        <>
            <button
                ref={buttonRef}
                onClick={isOpen ? handleClose : handleOpen}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white"
            >
                <EllipsisHorizontalIcon className="w-5 h-5" />
            </button>

            {isOpen && menuPosition &&
                createPortal(
                    <div
                        ref={menuRef}
                        className="fixed w-56 rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 z-[9999]"
                        style={{
                            top: `${menuPosition.top}px`,
                            left: `${menuPosition.left}px`,
                        }}
                    >
                        <div className="px-1 py-1">
                            {playlists.length > 0 ? (
                                playlists.map((playlist) => (
                                    <button
                                        key={playlist.id}
                                        onClick={() => handleAddToPlaylist(playlist.id)}
                                        className="w-full flex items-center gap-2 text-sm text-white px-2 py-2 hover:bg-gray-700 rounded-md"
                                    >
                                        <PlusIcon className="h-5 w-5" />
                                        Add to {playlist.name}
                                    </button>
                                ))
                            ) : (
                                <p className="text-gray-400 text-sm p-2">You have no playlists yet.</p>
                            )}
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
};

export default TrackContextMenu;