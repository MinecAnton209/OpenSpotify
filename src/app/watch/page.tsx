"use client";

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { usePlayerStore, TrackInfo } from '@/stores/playerStore';
import { useEffect, useState, useRef } from 'react';
import { resolveImageUrl } from '@/lib/utils';
import apiClient from '@/lib/apiClient';
import toast from 'react-hot-toast';
import { PlayCircleIcon, PauseCircleIcon } from '@heroicons/react/24/solid';
import LikeButton from '@/components/LikeButton';
import TrackContextMenu from '@/components/TrackContextMenu';

export default function WatchPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const trackIdFromUrl = searchParams.get('v');

    const {
        queue,
        currentTrack,
        isPlaying,
        setTrack,
        togglePlayPause
    } = usePlayerStore();

    const [isLoading, setIsLoading] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const setupTrack = async () => {
            if (currentTrack?.id === trackIdFromUrl) {
                setIsLoading(false);
                return;
            }

            const trackInQueue = queue.find(t => t.id === trackIdFromUrl);
            if (trackInQueue) {
                setTrack(trackInQueue, queue);
                setIsLoading(false);
                return;
            }

            try {
                const trackData = await apiClient.get<TrackInfo>(`/api/tracks/${trackIdFromUrl}`);
                setTrack(trackData, [trackData]);
            } catch (error) {
                toast.error("Could not load this track.");
                router.push('/');
            } finally {
                setIsLoading(false);
            }
        };

        if (trackIdFromUrl) {
            setupTrack();
        } else {
            router.push('/');
        }
    }, [trackIdFromUrl]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (isPlaying) {
            video.play().catch(e => console.warn("Video play was prevented:", e.name));
        } else {
            video.pause();
        }
    }, [isPlaying, currentTrack]);

    if (isLoading || !currentTrack) {
        return <div className="text-center p-10">Loading Player...</div>;
    }

    const currentIndexInQueue = queue.findIndex(t => t.id === currentTrack.id);

    const handleQueueItemClick = (track: TrackInfo) => {
        setTrack(track, queue);
        router.replace(`${pathname}?v=${track.id}`);
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 p-4 sm:p-6">
            <div className="flex-grow">
                <div
                    className="relative aspect-video bg-black rounded-lg overflow-hidden group cursor-pointer"
                    onClick={togglePlayPause}
                >
                    {currentTrack.canvasVideoUrl ? (
                        <video
                            ref={videoRef}
                            src={resolveImageUrl(currentTrack.canvasVideoUrl)}
                            className="w-full h-full object-cover"
                            key={currentTrack.id}
                            muted
                            loop
                            playsInline
                        />
                    ) : (
                        <img
                            src={resolveImageUrl(currentTrack.coverImageUrl)}
                            alt={currentTrack.title}
                            className="w-full h-full object-cover"
                        />
                    )}

                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100 focus-within:opacity-100">
                        {isPlaying ?
                            <PauseCircleIcon className="w-24 h-24 text-white/70" /> :
                            <PlayCircleIcon className="w-24 h-24 text-white/70" />
                        }
                    </div>
                </div>

                <div className="mt-4 p-2 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">{currentTrack.title}</h1>
                        <p className="text-lg text-gray-400">{currentTrack.artistName}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <LikeButton trackId={currentTrack.id} />
                        <TrackContextMenu trackId={currentTrack.id} />
                    </div>
                </div>
            </div>

            <div className="w-full lg:w-96 lg:shrink-0">
                <div className="bg-gray-800 rounded-lg p-2">
                    <h2 className="font-bold p-2 text-lg">Up Next</h2>
                    <ul className="max-h-[80vh] overflow-y-auto">
                        {queue.slice(currentIndexInQueue + 1).map((track) => (
                            <li key={track.id}>
                                <div
                                    onClick={() => handleQueueItemClick(track)}
                                    className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded-md cursor-pointer"
                                >
                                    <img src={resolveImageUrl(track.coverImageUrl)} alt={track.title} className="w-12 h-12 rounded-md shrink-0" />
                                    <div className="truncate">
                                        <p className="font-semibold text-white">{track.title}</p>
                                        <p className="text-sm text-gray-400">{track.artistName}</p>
                                    </div>
                                </div>
                            </li>
                        ))}
                        {queue.slice(currentIndexInQueue + 1).length === 0 && (
                            <p className="p-4 text-center text-gray-400">End of queue.</p>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}