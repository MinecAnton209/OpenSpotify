"use client";

import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';
import toast from 'react-hot-toast';
import Skeleton from '@/components/ui/Skeleton';

interface ArtistProfile {
    name: string;
    bio: string | null;
    profileImageUrl: string | null;
}

export default function ProfileEditor() {
    const [profile, setProfile] = useState<ArtistProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await apiClient.get<ArtistProfile>('/api/artist-panel/profile');
                setProfile(data);
            } catch (error) {
                toast.error("Could not load your artist profile.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;

        setIsSaving(true);
        try {
            await apiClient.put('/api/artist-panel/profile', {
                bio: profile.bio,
                profileImageUrl: profile.profileImageUrl,
            });
            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error("Failed to update profile.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <Skeleton className="h-64 w-full" />;
    if (!profile) return <p>Could not find your artist profile. Please contact support.</p>;

    return (
        <form onSubmit={handleSave} className="bg-gray-800 p-6 rounded-lg space-y-4">
            <h2 className="text-xl font-bold">Edit Your Profile ({profile.name})</h2>
            <div>
                <label htmlFor="bio" className="block text-sm font-medium mb-1">Your Bio</label>
                <textarea
                    id="bio"
                    rows={5}
                    className="w-full bg-gray-700 p-2 rounded-md"
                    value={profile.bio || ''}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                />
            </div>
            <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium mb-1">Profile Image URL</label>
                <input
                    id="imageUrl"
                    type="text"
                    className="w-full bg-gray-700 p-2 rounded-md"
                    value={profile.profileImageUrl || ''}
                    onChange={(e) => setProfile({ ...profile, profileImageUrl: e.target.value })}
                />
            </div>
            <div className="text-right">
                <button type="submit" disabled={isSaving} className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-full font-bold disabled:opacity-50">
                    {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
            </div>
        </form>
    );
}