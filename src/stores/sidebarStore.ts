import { create } from 'zustand';
import apiClient from '@/lib/apiClient';

interface Playlist {
    id: string;
    name: string;
}

interface SidebarState {
    playlists: Playlist[];
    setPlaylists: (playlists: Playlist[]) => void;
    addPlaylist: (playlist: Playlist) => void;
    removePlaylist: (playlistId: string) => void;
    addTrackToPlaylist: (playlistId: string, trackId: string) => Promise<void>;
}

export const useSidebarStore = create<SidebarState>((set) => ({
    playlists: [],
    setPlaylists: (playlists) => set({ playlists }),
    addPlaylist: (playlist) => set(state => ({ playlists: [...state.playlists, playlist] })),
    removePlaylist: (playlistId) => set(state => ({
        playlists: state.playlists.filter(p => p.id !== playlistId)
    })),
    addTrackToPlaylist: async (playlistId, trackId) => {
        try {
            await apiClient.post(`/api/playlists/${playlistId}/tracks`, { trackId });
        } catch (error) {
            console.error("Failed to add track to playlist", error);
            throw error;
        }
    },
}));