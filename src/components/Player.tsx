"use client";

import { usePlayerStore } from "@/stores/playerStore";
import { PlayCircleIcon, PauseCircleIcon, ForwardIcon, BackwardIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';

const Player = () => {
    const { currentTrack, isPlaying, togglePlayPause, playNext, playPrevious } = usePlayerStore();

    if (!currentTrack) {
        return (
            <footer className="bg-zinc-900 border-t border-gray-800 text-white p-3 grid grid-cols-3">
                <div className="flex items-center"></div>
                <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center gap-4">
                        <BackwardIcon className="w-8 h-8 text-gray-600" />
                        <PlayCircleIcon className="w-12 h-12 text-gray-600" />
                        <ForwardIcon className="w-8 h-8 text-gray-600" />
                    </div>
                </div>
                <div className="flex items-center justify-end"></div>
            </footer>
        );
    }

    return (
        <footer className="bg-zinc-900 border-t border-gray-800 text-white p-3 grid grid-cols-3">
            <div className="flex items-center gap-3">
                <img
                    src={currentTrack.coverImageUrl || 'https://placehold.co/64'}
                    alt={currentTrack.title}
                    className="w-16 h-16 rounded-md"
                />
                <div>
                    <p className="font-semibold">{currentTrack.title}</p>
                    <p className="text-sm text-gray-400">{currentTrack.artistName}</p>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center">
                <div className="flex items-center gap-4">
                    <BackwardIcon
                        onClick={playPrevious}
                        className="w-8 h-8 text-gray-400 hover:text-white cursor-pointer"
                    />
                    {isPlaying ? (
                        <PauseCircleIcon
                            onClick={togglePlayPause}
                            className="w-12 h-12 text-white hover:scale-105 cursor-pointer"
                        />
                    ) : (
                        <PlayCircleIcon
                            onClick={togglePlayPause}
                            className="w-12 h-12 text-white hover:scale-105 cursor-pointer"
                        />
                    )}
                    <ForwardIcon
                        onClick={playNext}
                        className="w-8 h-8 text-gray-400 hover:text-white cursor-pointer"
                    />
                </div>
            </div>

            <div className="flex items-center justify-end">
            </div>
        </footer>
    );
};

export default Player;