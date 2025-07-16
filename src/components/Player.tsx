"use client";

import { useState, useEffect, Fragment } from "react";
import { usePlayerStore } from "@/stores/playerStore";
import {
    PlayCircleIcon,
    PauseCircleIcon,
    ForwardIcon,
    BackwardIcon,
    SpeakerWaveIcon,
    SpeakerXMarkIcon,
    ArrowsRightLeftIcon,
    ArrowPathIcon,
    QueueListIcon
} from '@heroicons/react/24/solid';
import AnimatedTime from './ui/AnimatedTime';
import PlayQueuePanel from './PlayQueuePanel';
import { Menu, Transition } from '@headlessui/react';

const Player = () => {
    const {
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        repeatMode,
        isShuffled,
        togglePlayPause,
        playNext,
        playPrevious,
        seek,
        setVolume,
        toggleRepeatMode,
        toggleShuffle,
        playbackRate,
        setPlaybackRate
    } = usePlayerStore();

    const [isSeeking, setIsSeeking] = useState(false);
    const [localSeek, setLocalSeek] = useState(currentTime);

    const [isQueueOpen, setIsQueueOpen] = useState(false);

    const availableRates = [0.75, 1, 1.25, 1.5, 2];

    useEffect(() => {
        if (!isSeeking) {
            setLocalSeek(currentTime);
        }
    }, [currentTime, isSeeking]);

    const progressPercent = duration > 0 ? (localSeek / duration) * 100 : 0;
    const trackStyle = {
        background: `linear-gradient(to right, #1DB954 ${progressPercent}%, #4d4d4d ${progressPercent}%)`
    };

    const handleRateToggle = () => {
        const rates = [1, 1.25, 1.5, 2, 0.75];
        const currentIndex = rates.indexOf(playbackRate);
        const nextIndex = (currentIndex + 1) % rates.length;
        setPlaybackRate(rates[nextIndex]);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
    };

    if (!currentTrack) {
        return (
            <footer className="bg-zinc-900 border-t border-gray-800 text-white p-3 grid grid-cols-3 h-24">
                <div className="flex items-center"></div>
                <div className="flex flex-col items-center justify-center">
                    <div className="flex items-center gap-4">
                        <button className="text-gray-600" disabled><ArrowsRightLeftIcon className="w-5 h-5" /></button>
                        <button className="text-gray-600" disabled><BackwardIcon className="w-8 h-8" /></button>
                        <button className="text-gray-600" disabled><PlayCircleIcon className="w-12 h-12" /></button>
                        <button className="text-gray-600" disabled><ForwardIcon className="w-8 h-8" /></button>
                        <button className="text-gray-600" disabled><ArrowPathIcon className="w-5 h-5" /></button>
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
        <Fragment>
            <footer className="bg-zinc-900 border-t border-gray-800 text-white p-3 grid grid-cols-3 h-24">
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
                        <button onClick={toggleShuffle} title="Shuffle">
                            <ArrowsRightLeftIcon className={`w-5 h-5 ${isShuffled ? 'text-green-500' : 'text-gray-400'} hover:text-white transition-colors`} />
                        </button>
                        <button onClick={playPrevious} title="Previous">
                            <BackwardIcon className="w-8 h-8 text-gray-400 hover:text-white" />
                        </button>
                        {isPlaying ? (
                            <button onClick={togglePlayPause} title="Pause">
                                <PauseCircleIcon className="w-12 h-12 text-white hover:scale-105 transition-transform" />
                            </button>
                        ) : (
                            <button onClick={togglePlayPause} title="Play">
                                <PlayCircleIcon className="w-12 h-12 text-white hover:scale-105 transition-transform" />
                            </button>
                        )}
                        <button onClick={playNext} title="Next">
                            <ForwardIcon className="w-8 h-8 text-gray-400 hover:text-white" />
                        </button>
                        <button onClick={toggleRepeatMode} title={`Repeat: ${repeatMode}`}>
                            <div className="relative">
                                <ArrowPathIcon className={`w-5 h-5 ${repeatMode !== 'none' ? 'text-green-500' : 'text-gray-400'} hover:text-white transition-colors`} />
                                {repeatMode === 'track' && (
                                    <span className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></span>
                                )}
                            </div>
                        </button>
                    </div>

                    <div className="flex items-center gap-2 w-full max-w-md mt-2">
                        <AnimatedTime timeInSeconds={localSeek} />
                        <input
                            type="range"
                            min="0"
                            max={isNaN(duration) ? 0 : duration}
                            value={localSeek}
                            onMouseDown={() => setIsSeeking(true)}
                            onMouseUp={() => {
                                setIsSeeking(false);
                                seek(localSeek);
                            }}
                            onChange={(e) => setLocalSeek(parseFloat(e.target.value))}
                            style={trackStyle}
                            className="w-full h-1 rounded-lg appearance-none cursor-pointer bg-transparent focus:outline-none"
                        />
                        <AnimatedTime timeInSeconds={duration || 0} />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4">
                    <Menu as="div" className="relative">
                        <Menu.Button
                            className="text-sm font-semibold w-12 text-center text-gray-400 hover:text-white"
                            title={`Playback speed: ${playbackRate}x`}
                        >
                            {playbackRate.toFixed(2)}x
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
                            <Menu.Items className="absolute right-0 bottom-full mb-2 w-24 origin-bottom-right rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-30">
                                <div className="py-1">
                                    {availableRates.map((rate) => (
                                        <Menu.Item key={rate}>
                                            {({ active }) => (
                                                <button
                                                    onClick={() => setPlaybackRate(rate)}
                                                    className={`${
                                                        active ? 'bg-gray-700' : ''
                                                    } ${
                                                        playbackRate === rate ? 'font-bold text-green-500' : 'text-white'
                                                    } group flex w-full justify-center rounded-md px-2 py-2 text-sm`}
                                                >
                                                    {rate.toFixed(2)}x
                                                </button>
                                            )}
                                        </Menu.Item>
                                    ))}
                                </div>
                            </Menu.Items>
                        </Transition>
                    </Menu>
                    <button onClick={() => setIsQueueOpen(true)} title="Play Queue">
                        <QueueListIcon className="w-5 h-5 text-gray-400 hover:text-white" />
                    </button>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setVolume(volume > 0 ? 0 : 0.75)} title="Mute/Unmute">
                            {volume === 0 ? (
                                <SpeakerXMarkIcon className="w-6 h-6 text-gray-400 hover:text-white" />
                            ) : (
                                <SpeakerWaveIcon className="w-6 h-6 text-gray-400 hover:text-white" />
                            )}
                        </button>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={handleVolumeChange}
                            style={{
                                background: `linear-gradient(to right, #ffffff ${volume * 100}%, #4d4d4d ${volume * 100}%)`,
                            }}
                            className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>
            </footer>

            <PlayQueuePanel isOpen={isQueueOpen} onClose={() => setIsQueueOpen(false)} />
        </Fragment>
    );
};

export default Player;