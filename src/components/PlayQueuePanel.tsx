"use client";

import { usePlayerStore } from "@/stores/playerStore";
import { AnimatePresence, motion } from "framer-motion";
import { XMarkIcon, ArrowsUpDownIcon, BarsArrowUpIcon, BarsArrowDownIcon } from "@heroicons/react/24/solid";

interface PlayQueuePanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function PlayQueuePanel({ isOpen, onClose }: PlayQueuePanelProps) {
    const { queue, currentTrack, sortBy, sortDirection, setSortMode, toggleSortDirection, setTrack } = usePlayerStore();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-40"
                    />

                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
                        className="fixed top-0 right-0 h-full w-full max-w-sm bg-gray-900 shadow-lg z-50 flex flex-col p-4"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Up Next</h2>
                            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex items-center gap-2 border-b border-gray-700 pb-2 mb-2">
                            <span className="text-sm text-gray-400">Sort by:</span>
                            <button onClick={() => setSortMode('title')} className={`px-2 py-1 text-xs rounded-full ${sortBy === 'title' ? 'bg-green-500 text-white' : 'bg-gray-700'}`}>Title</button>
                            <button onClick={() => setSortMode('duration')} className={`px-2 py-1 text-xs rounded-full ${sortBy === 'duration' ? 'bg-green-500 text-white' : 'bg-gray-700'}`}>Duration</button>
                            <button onClick={() => setSortMode('default')} className={`px-2 py-1 text-xs rounded-full ${sortBy === 'default' ? 'bg-gray-700' : ''}`}>Default</button>
                            <button onClick={toggleSortDirection} className="ml-auto p-1">
                                {sortDirection === 'asc' ? <BarsArrowUpIcon className="w-5 h-5"/> : <BarsArrowDownIcon className="w-5 h-5"/>}
                            </button>
                        </div>

                        <ul className="overflow-y-auto flex-1">
                            {queue.map((track) => (
                                <li
                                    key={track.id}
                                    onClick={() => setTrack(track, queue)}
                                    className={`flex items-center gap-3 p-2 rounded-md cursor-pointer ${currentTrack?.id === track.id ? 'bg-green-500/20' : 'hover:bg-gray-800'}`}
                                >
                                    <img src={track.coverImageUrl || 'https://placehold.co/40'} alt={track.title} className="w-10 h-10 rounded-md" />
                                    <div className="truncate">
                                        <p className={`font-semibold ${currentTrack?.id === track.id ? 'text-green-500' : ''}`}>{track.title}</p>
                                        <p className="text-sm text-gray-400">{track.artistName}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}