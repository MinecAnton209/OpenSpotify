"use client";

import { resolveImageUrl } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { createPortal } from "react-dom";
import { PlayCircleIcon } from '@heroicons/react/24/solid';

interface MediaCoverProps {
    imageUrl: string | null;
    videoUrl: string | null;
    altText: string;
    className?: string;
}

const MediaCover: React.FC<MediaCoverProps> = ({ imageUrl, videoUrl, altText, className }) => {
    const [isHovering, setIsHovering] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [isClient, setIsClient] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const isInView = useInView(containerRef, { amount: 0.5, once: false });

    const finalImageUrl = resolveImageUrl(imageUrl);
    const finalVideoUrl = videoUrl ? resolveImageUrl(videoUrl) : null;

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!finalVideoUrl) {
        return <img src={finalImageUrl} alt={altText} className={`${className} object-cover`} />;
    }

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (isHovering && !isPlaying) {
            video.play().catch(() => {});
        } else if (!isHovering && !isPlaying) {
            video.pause();
            video.currentTime = 0;
        }
    }, [isHovering, isPlaying]);

    const handlePlayClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsPlaying(true);
        setIsMuted(false);
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play();
        }
    };

    const isExpanded = isHovering || isPlaying;
    const isSticky = isPlaying && !isInView;

    const VideoPlayer = (
        <motion.div
            layoutId={`video-player-${altText}`}
            className={`bg-black rounded-lg shadow-2xl overflow-hidden ${isSticky ? 'fixed top-4 right-4 w-96 h-56 z-50' : 'relative w-full h-full'}`}
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
        >
            <video
                ref={videoRef}
                src={finalVideoUrl}
                className="w-full h-full object-cover"
                loop={!isPlaying}
                muted={isMuted}
                playsInline
                controls={isPlaying}
                autoPlay
            />
        </motion.div>
    );

    return (
        <div
            ref={containerRef}
            className={`relative bg-black transition-all duration-300 ease-in-out overflow-hidden rounded-lg ${className}`}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            style={{
                aspectRatio: isExpanded ? '16 / 9' : '1 / 1',
            }}
        >
            <AnimatePresence>
                {!isPlaying && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 group cursor-pointer"
                        onClick={handlePlayClick}
                    >
                        <img src={finalImageUrl} alt={altText} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <PlayCircleIcon className="w-20 h-20 text-white/80" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {isClient && isSticky
                ? createPortal(VideoPlayer, document.body)
                : isPlaying && VideoPlayer}
        </div>
    );
};

export default MediaCover;