"use client";
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { useLibraryStore } from '@/stores/libraryStore';

interface LikeButtonProps {
    trackId: string;
}

export default function LikeButton({ trackId }: LikeButtonProps) {
    const { isLiked, toggleLikeTrack } = useLibraryStore();
    const liked = isLiked(trackId);

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleLikeTrack(trackId);
    };

    return (
        <button onClick={handleToggle} className="p-1">
            {liked ? (
                <HeartSolid className="w-5 h-5 text-green-500" />
            ) : (
                <HeartOutline className="w-5 h-5 text-gray-400 group-hover:text-white" />
            )}
        </button>
    );
}