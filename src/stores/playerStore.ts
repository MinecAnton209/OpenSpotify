import { create } from 'zustand';

export type RepeatMode = 'none' | 'queue' | 'track';

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
    repeatMode: RepeatMode;
    toggleRepeatMode: () => void;

    isShuffled: boolean;
    originalQueue: TrackInfo[];
    toggleShuffle: () => void;

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
    repeatMode: 'none',
    isShuffled: false,
    originalQueue: [],

    /*setTrack: (track, playlist) => {
        const { isShuffled } = get();
        const newQueue = playlist || [track];

        set({
            currentTrack: track,
            queue: isShuffled ? shuffleArray([...newQueue]) : newQueue,
            originalQueue: newQueue,
            isPlaying: true,
            currentTime: 0,
            duration: 0,
        });
    },*/

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

    toggleShuffle: () => {
        const { isShuffled, queue, currentTrack } = get();
        const newIsShuffled = !isShuffled;

        if (newIsShuffled) {
            const newQueue = shuffleArray([...queue]);
            const currentIndex = newQueue.findIndex(t => t.id === currentTrack?.id);
            if (currentIndex > -1) {
                const [current] = newQueue.splice(currentIndex, 1);
                newQueue.unshift(current);
            }
            set({ queue: newQueue, isShuffled: true });
        } else {
            set(state => ({
                queue: state.originalQueue,
                isShuffled: false
            }));
        }
    },


    toggleRepeatMode: () => {
        const currentMode = get().repeatMode;
        let nextMode: RepeatMode = 'none';
        if (currentMode === 'none') {
            nextMode = 'queue';
        } else if (currentMode === 'queue') {
            nextMode = 'track';
        }
        set({ repeatMode: nextMode });
    },



    togglePlayPause: () => {
        if (get().currentTrack) {
            set(state => ({ isPlaying: !state.isPlaying }));
        }
    },

    playNext: () => {
        const { currentTrack, queue, repeatMode } = get();
        if (!currentTrack) return;

        if (repeatMode === 'track') {
            get().seek(0);
            if (!get().isPlaying) get().togglePlayPause();
            return;
        }

        const currentIndex = queue.findIndex(t => t.id === currentTrack.id);

        if (currentIndex === queue.length - 1) {
            if (repeatMode === 'queue') {
                set({ currentTrack: queue[0] });
            } else {
                set({ currentTrack: null, isPlaying: false, queue: [] });
            }
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

function shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}