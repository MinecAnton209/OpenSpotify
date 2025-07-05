"use client";

import { usePlayerStore } from "@/stores/playerStore";
import { PlayCircleIcon, PauseCircleIcon, ForwardIcon, BackwardIcon } from '@heroicons/react/24/solid';

const Player = () => {
    // Отримуємо поточний трек зі стору
    const { currentTrack, isPlaying } = usePlayerStore();

    // Якщо треку немає, показуємо заглушку
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

    // Якщо трек є, показуємо інформацію про нього
    return (
        <footer className="bg-zinc-900 border-t border-gray-800 text-white p-3 grid grid-cols-3">
            {/* Інформація про трек */}
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

            {/* Кнопки управління */}
            <div className="flex flex-col items-center justify-center">
                <div className="flex items-center gap-4">
                    <BackwardIcon className="w-8 h-8 text-gray-400 hover:text-white cursor-pointer" />
                    {isPlaying ? (
                        <PauseCircleIcon className="w-12 h-12 text-white hover:scale-105 cursor-pointer" />
                    ) : (
                        <PlayCircleIcon className="w-12 h-12 text-white hover:scale-105 cursor-pointer" />
                    )}
                    <ForwardIcon className="w-8 h-8 text-gray-400 hover:text-white cursor-pointer" />
                </div>
            </div>

            {/* Додаткові налаштування (гучність і т.д.) */}
            <div className="flex items-center justify-end">
                {/* Тут в майбутньому буде повзунок гучності */}
            </div>
        </footer>
    );
};

export default Player;