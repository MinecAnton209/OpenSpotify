"use client";

import { usePlayerStore } from "@/stores/playerStore";
import { PlayCircleIcon, PauseCircleIcon, ForwardIcon, BackwardIcon } from '@heroicons/react/24/solid';

const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const Player = () => {
    const {
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        togglePlayPause,
        playNext,
        playPrevious,
        seek
    } = usePlayerStore();

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        seek(time);
    };

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
                    <div className="flex items-center gap-2 w-full max-w-md mt-2">
                        <span className="text-xs text-gray-600">0:00</span>
                        <div className="w-full h-1 bg-gray-700 rounded-lg"></div>
                        <span className="text-xs text-gray-600">0:00</span>
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
                    <BackwardIcon onClick={playPrevious} className="w-8 h-8 text-gray-400 hover:text-white cursor-pointer" />
                    {isPlaying ? (
                        <PauseCircleIcon onClick={togglePlayPause} className="w-12 h-12 text-white hover:scale-105 cursor-pointer" />
                    ) : (
                        <PlayCircleIcon onClick={togglePlayPause} className="w-12 h-12 text-white hover:scale-105 cursor-pointer" />
                    )}
                    <ForwardIcon onClick={playNext} className="w-8 h-8 text-gray-400 hover:text-white cursor-pointer" />
                </div>

                <div className="flex items-center gap-2 w-full max-w-md mt-2">
                    <span className="text-xs text-gray-400">{formatTime(currentTime)}</span>
                    <input
                        type="range"
                        min="0"
                        max={isNaN(duration) ? 0 : duration}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-green-500"
                    />
                    <span className="text-xs text-gray-400">{formatTime(duration || 0)}</span>
                </div>
            </div>

            <div className="flex items-center justify-end">
            </div>
        </footer>
    );
};

export default Player;