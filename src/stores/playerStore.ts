import { create } from 'zustand';

export interface TrackInfo {
    id: string;
    title: string;
    artistName: string;
    coverImageUrl: string | null;
}

interface PlayerState {
    currentTrack: TrackInfo | null;
    queue: TrackInfo[];
    isPlaying: boolean;
    setTrack: (track: TrackInfo, playlist?: TrackInfo[]) => void;
    togglePlayPause: () => void;
    playNext: () => void;
    playPrevious: () => void;
    clearPlayer: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
    currentTrack: null,
    queue: [],
    isPlaying: false,

    setTrack: (track, playlist) => {
        set({
            currentTrack: track,
            queue: playlist || [track],
            isPlaying: true,
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