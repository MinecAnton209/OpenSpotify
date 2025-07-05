"use client";

import { useState, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import apiClient from '@/lib/apiClient';
import Link from 'next/link';

interface Artist {
    id: string;
    name: string;
    profileImageUrl: string | null;
}
interface Album {
    id: string;
    title: string;
    coverImageUrl: string | null;
}
interface Track {
    id: string;
    title: string;
    artistName: string;
}
interface SearchResult {
    artists: Artist[];
    albums: Album[];
    tracks: Track[];
}

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const performSearch = async (searchQuery: string) => {
        if (searchQuery.length < 2) {
            setResults(null);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const data = await apiClient.get<SearchResult>(`/api/search?query=${encodeURIComponent(searchQuery)}`);
            setResults(data);
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    const debouncedSearch = useDebouncedCallback(performSearch, 300);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuery = e.target.value;
        setQuery(newQuery);
        debouncedSearch(newQuery);
    };

    return (
        <div>
            <div className="relative mb-8">
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder="What do you want to listen to?"
                    className="w-full p-4 pl-12 text-lg bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
                    autoFocus
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-4">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
            </div>

            {isLoading && <p>Searching...</p>}

            {results && (
                <div className="space-y-8">
                    {results.tracks.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Tracks</h2>
                            <ul>
                                {results.tracks.map(track => (
                                    <li key={track.id} className="p-2 hover:bg-gray-800 rounded-md">
                                        <p className="font-semibold">{track.title}</p>
                                        <p className="text-sm text-gray-400">{track.artistName}</p>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {results.artists.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Artists</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                {results.artists.map(artist => (
                                    <Link href={`/artists/${artist.id}`} key={artist.id}>
                                        <div className="text-center p-2 hover:bg-gray-800 rounded-md">
                                            <img src={artist.profileImageUrl || 'https://placehold.co/150'} alt={artist.name} className="w-24 h-24 rounded-full mx-auto mb-2"/>
                                            <p className="font-semibold">{artist.name}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {results.albums.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Albums</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                {results.albums.map(album => (
                                    <Link href={`/albums/${album.id}`} key={album.id}>
                                        <div className="p-2 hover:bg-gray-800 rounded-md">
                                            <img src={album.coverImageUrl || 'https://placehold.co/150'} alt={album.title} className="w-full aspect-square mb-2 rounded-md"/>
                                            <p className="font-semibold truncate">{album.title}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}

            {!isLoading && query && results && results.artists.length === 0 && results.albums.length === 0 && results.tracks.length === 0 && (
                <p>No results found for "{query}".</p>
            )}

        </div>
    );
}