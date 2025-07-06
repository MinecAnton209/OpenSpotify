import { create } from 'zustand';
import apiClient from '@/lib/apiClient';

interface LibraryState {
    likedTrackIds: Set<string>;
    setLikedTracks: (trackIds: string[]) => void;
    fetchLikedTracks: () => Promise<void>;
    toggleLikeTrack: (trackId: string) => Promise<void>;
    isLiked: (trackId: string) => boolean;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
    likedTrackIds: new Set(),

    setLikedTracks: (trackIds) => {
        set({ likedTrackIds: new Set(trackIds) });
    },

    fetchLikedTracks: async () => {
        try {
            console.log('[LibraryStore] Fetching liked track IDs...');
            const trackIds = await apiClient.get<string[]>('/api/me/liked-tracks-ids');
            console.log('[LibraryStore] Liked track IDs fetched:', trackIds);
            set({ likedTrackIds: new Set(trackIds) });
        } catch (error) {
            console.error("[LibraryStore] Failed to fetch liked tracks", error);
        }
    },

    toggleLikeTrack: async (trackId) => {
        const { likedTrackIds } = get();
        const currentLikedState = likedTrackIds.has(trackId);

        const newLikedTrackIds = new Set(likedTrackIds);
        if (currentLikedState) {
            newLikedTrackIds.delete(trackId);
        } else {
            newLikedTrackIds.add(trackId);
        }
        set({ likedTrackIds: newLikedTrackIds });

        try {
            if (currentLikedState) {
                await apiClient.delete(`/api/me/tracks/${trackId}/like`);
            } else {
                await apiClient.post(`/api/me/tracks/${trackId}/like`, {});
            }
        } catch (error) {
            set({ likedTrackIds });
            console.error("Failed to toggle like", error);
        }
    },

    isLiked: (trackId) => get().likedTrackIds.has(trackId),
}));