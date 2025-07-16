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

    setDuration: (duration: number) => void;
    setCurrentTime: (time: number) => void;

    seek: (time: number) => void;

    setTrack: (track: TrackInfo, playlist?: TrackInfo[]) => void;
    togglePlayPause: () => void;
    playNext: () => void;
    playPrevious: () => void;
    clearPlayer: () => void;

    volume: number;
    setVolume: (volume: number) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
    currentTrack: null,
    queue: [],
    isPlaying: false,
    duration: 0,
    currentTime: 0,
    volume: 0.75,
    setVolume: (volume) => set({ volume }),

    setDuration: (duration) => set({ duration }),
    setCurrentTime: (time) => set({ currentTime: time }),
    seek: (time) => {
        console.log(`Seeking to: ${time}`);
    },

    setTrack: (track, playlist) => {
        set({
            currentTrack: track,
            queue: playlist || [track],
            isPlaying: true,
            currentTime: 0,
            duration: 0,
        });
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
        if (currentIndex === -1 || currentIndex === queue.length - 1) {
            set({ currentTrack: null, isPlaying: false, queue: [] });
        } else {
            set({ currentTrack: queue[currentIndex + 1], isPlaying: true });
        }
    },

    playPrevious: () => {
        const { currentTrack, queue } = get();
        if (!currentTrack) return;

        const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
        if (currentIndex > 0) {
            set({ currentTrack: queue[currentIndex - 1], isPlaying: true });
        }
    },

    clearPlayer: () => {
        set({ currentTrack: null, isPlaying: false, queue: [] });
    },
}));