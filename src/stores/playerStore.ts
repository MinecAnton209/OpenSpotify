import { create } from 'zustand';

export type RepeatMode = 'none' | 'queue' | 'track';

export type SortMode = 'default' | 'title' | 'duration';
export type SortDirection = 'asc' | 'desc';

export interface TrackInfo {
    id: string;
    title: string;
    artistName: string;
    coverImageUrl: string | null;
    audioUrl: string | null;
    durationInSeconds: number;
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

    sortBy: SortMode;
    sortDirection: SortDirection;

    playbackRate: number;
    setPlaybackRate: (rate: number) => void;

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

function sortQueue(queue: TrackInfo[], sortBy: SortMode, sortDirection: SortDirection): TrackInfo[] {
    const sorted = [...queue]; // Створюємо копію
    sorted.sort((a, b) => {
        let comparison = 0;
        if (sortBy === 'title') {
            comparison = a.title.localeCompare(b.title);
        } else if (sortBy === 'duration') {
            comparison = (a.durationInSeconds || 0) - (b.durationInSeconds || 0);
        }
        return sortDirection === 'asc' ? comparison : -comparison;
    });
    return sorted;
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
    sortBy: 'default',
    sortDirection: 'asc',
    playbackRate: 1,

    setPlaybackRate: (rate) => {
        const validRate = Math.max(0.5, Math.min(2, rate));
        set({ playbackRate: validRate });
    },

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
                isShuffled: false,
                sortBy: 'default',
                sortDirection: 'asc',
            });
        }
    },

    setSortMode: (mode: SortMode) => {
        const { originalQueue, sortDirection } = get();

        const sortedQueue = mode === 'default'
            ? originalQueue
            : sortQueue(originalQueue, mode, sortDirection);

        set({
            sortBy: mode,
            queue: sortedQueue,
            isShuffled: false,
        });
    },

    toggleSortDirection: () => {
        const { queue, sortDirection } = get();
        const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        set({
            sortDirection: newDirection,
            queue: [...queue].reverse()
        });
    },

    toggleShuffle: () => {
        const { isShuffled, originalQueue, currentTrack, queue } = get();
        const newIsShuffled = !isShuffled;

        if (newIsShuffled) {
            const newQueue = shuffleArray([...queue]); // <-- ОГОЛОШУЄМО ЗМІННУ
            const currentIndex = newQueue.findIndex(t => t.id === currentTrack?.id);
            if (currentIndex > -1) {
                const [current] = newQueue.splice(currentIndex, 1);
                newQueue.unshift(current);
            }
            set({ queue: newQueue, isShuffled: true, sortBy: 'default' });
        } else {
            set({ queue: originalQueue, isShuffled: false });
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