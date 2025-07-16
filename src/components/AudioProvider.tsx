"use client";

import { usePlayerStore } from '@/stores/playerStore';
import { useEffect, useRef } from 'react';

export default function AudioProvider() {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const {
        currentTrack,
        isPlaying,
        volume,
        playNext,
        setCurrentTime,
        setDuration,
        repeatMode,
        seek,
        playbackRate,
    } = usePlayerStore();

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5055';

    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.preload = 'metadata';
        }
        const audio = audioRef.current;

        console.log('[AudioProvider] Appending native audio player to the body for debugging.');
        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleLoadedMetadata = () => setDuration(audio.duration);
        const handleEnded = () => playNext();

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);

        usePlayerStore.setState({
            seek: (time) => { if (audio) audio.currentTime = time; }
        });

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
        };
    }, [setCurrentTime, setDuration, playNext]);


    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (currentTrack?.id && currentTrack.audioUrl) {
            audio.src = `${API_URL}/api/tracks/${currentTrack.id}/stream`;
            audio.load();
            if (isPlaying) {
                audio.play().catch(e => console.error("Audio play failed on track change:", e));
            }
        } else {
            audio.src = '';
        }

        const handleEnded = () => {
            if (usePlayerStore.getState().repeatMode === 'track') {
                seek(0);
                audio.play();
            } else {
                playNext();
            }
        };
    }, [currentTrack?.id, API_URL]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.play().catch(e => console.error("Audio play failed on toggle:", e));
        } else {
            audio.pause();
        }
    }, [isPlaying]);

    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.volume = volume;
        }
    }, [volume]);

    useEffect(() => {
        const audio = audioRef.current;
        if (audio) {
            audio.playbackRate = playbackRate;
        }
    }, [playbackRate]);


    return null;
}