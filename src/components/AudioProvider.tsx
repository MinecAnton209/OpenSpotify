"use client";

import { usePlayerStore } from '@/stores/playerStore';
import { useEffect, useRef } from 'react';

export default function AudioProvider() {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5055';

    useEffect(() => {
        if (!audioRef.current) {
            console.log('[AudioProvider] Creating new Audio element.');
            audioRef.current = new Audio();
            audioRef.current.preload = 'metadata';
        }
        const audio = audioRef.current;

        const unsubscribe = usePlayerStore.subscribe(
            (state, prevState) => {
                console.log('[AudioProvider] Zustand state changed.');

                if (state.currentTrack?.id !== prevState.currentTrack?.id) {
                    console.log('[AudioProvider] Track ID changed from', prevState.currentTrack?.id, 'to', state.currentTrack?.id);
                    if (state.currentTrack?.audioUrl) {
                        const newSrc = `${API_URL}/api/tracks/${state.currentTrack.id}/stream`;
                        console.log('[AudioProvider] Setting new src:', newSrc);
                        audio.src = newSrc;
                        audio.load();
                    } else {
                        console.log('[AudioProvider] Clearing src because new track has no audioUrl.');
                        audio.src = '';
                    }
                }

                if (state.isPlaying !== prevState.isPlaying) {
                    console.log('[AudioProvider] isPlaying changed to:', state.isPlaying);
                    if (state.isPlaying && state.currentTrack) {
                        audio.play().catch(e => console.error("Audio play failed:", e));
                    } else {
                        audio.pause();
                    }
                }
            }
        );

        const { setCurrentTime, setDuration, playNext } = usePlayerStore.getState();
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
            console.log('[AudioProvider] Cleaning up and unsubscribing.');
            unsubscribe();
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);

    return null;
}