import { create } from 'zustand';

export interface TrackInfo {
    id: string;
    title: string;
    artistName: string;
    coverImageUrl: string | null;
}

interface PlayerState {
    currentTrack: TrackInfo | null;
    isPlaying: boolean;
    setTrack: (track: TrackInfo | null) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
    currentTrack: null,
    isPlaying: false,

    setTrack: (track) => {
        if (track) {
            set({ currentTrack: track, isPlaying: true });
        } else {
            set({ currentTrack: null, isPlaying: false });
        }
    },
}));