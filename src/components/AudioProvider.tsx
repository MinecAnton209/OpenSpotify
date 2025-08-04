"use client";

import { usePlayerStore } from '@/stores/playerStore';
import { useEffect, useRef } from 'react';

export default function AudioProvider() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5055';

    const { isPlaying, currentTrack, volume, playbackRate } = usePlayerStore();

    const { setCurrentTime, setDuration, playNext, seek } = usePlayerStore.getState();

    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.preload = 'metadata';
        }
        const audio = audioRef.current;

        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleLoadedMetadata = () => setDuration(audio.duration);
        const handleEnded = () => playNext();

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);

        usePlayerStore.setState({ seek });

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [setCurrentTime, setDuration, playNext, seek]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (currentTrack?.audioUrl && !currentTrack.canvasVideoUrl) {
            const newSrc = `${API_URL}/api/tracks/${currentTrack.id}/stream`;
            if (audio.src !== newSrc) {
                audio.src = newSrc;
                audio.load();
            }
        } else {
            audio.removeAttribute('src');
            audio.load();
        }
    }, [currentTrack?.id, currentTrack?.audioUrl, currentTrack?.canvasVideoUrl, API_URL]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying && currentTrack?.audioUrl && !currentTrack.canvasVideoUrl) {
            audio.play().catch(e => console.error("Play failed:", e.name, e.message));
        } else {
            audio.pause();
        }
    }, [isPlaying, currentTrack?.audioUrl, currentTrack?.canvasVideoUrl]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.playbackRate = playbackRate;
        }
    }, [playbackRate]);

    return null;
}