import { create } from 'zustand';

export interface TrackInfo {
    id: string;
    title: string;
    artistName: string;
    coverImageUrl: string | null;
    audioUrl: string | null;
}

interface PlayerState {
    currentTrack: TrackInfo | null;
    queue: TrackInfo[];
    isPlaying: boolean;
    duration: number;
    currentTime: number;
    volume: number;

    setTrack: (track: TrackInfo, playlist?: TrackInfo[]) => void;
    togglePlayPause: () => void;
    playNext: () => void;
    playPrevious: () => void;
    seek: (time: number) => void;
    setVolume: (volume: number) => void;
    setDuration: (duration: number) => void;
    setCurrentTime: (time: number) => void;
    clearPlayer: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
    currentTrack: null,
    queue: [],
    isPlaying: false,
    duration: 0,
    currentTime: 0,
    volume: 0.75,

    setTrack: (track, playlist) => {
        if (get().currentTrack?.id === track.id) {
            get().togglePlayPause();
        } else {
            set({
                currentTrack: track,
                queue: playlist || [track],
                isPlaying: true,
                currentTime: 0,
                duration: 0,
            });
        }
    },

    togglePlayPause: () => {
        if (get().currentTrack) {
            set(state => ({ isPlaying: !state.isPlaying }));
        }
    },

    playNext: () => {
        const { currentTrack, queue } = get();
        if (!currentTrack) return;

        const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
        if (currentIndex === -1 || currentIndex >= queue.length - 1) {
            set({ currentTrack: null, isPlaying: false, queue: [] });
        } else {
            set({ currentTrack: queue[currentIndex + 1] });
        }
    },

    playPrevious: () => {
        const { currentTrack, queue } = get();
        if (!currentTrack) return;

        const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
        if (currentIndex > 0) {
            set({ currentTrack: queue[currentIndex - 1] });
        }
    },

    setVolume: (volume) => {
        const newVolume = Math.max(0, Math.min(1, volume));
        set({ volume: newVolume });
    },

    setDuration: (duration) => set({ duration }),

    setCurrentTime: (time) => set({ currentTime: time }),

    seek: (time) => {
        set({ currentTime: time });
    },
    clearPlayer: () => {
        set({ currentTrack: null, isPlaying: false, queue: [] });
    },
}));