"use client";

import { useEffect, useState, useCallback } from 'react';
import apiClient from '@/lib/apiClient';
import toast from 'react-hot-toast';
import { RefreshCcw } from 'lucide-react';

interface User {
    id: string;
    userName: string;
    email: string;
    roles: string[];
}

export default function UserList() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdatingRole, setIsUpdatingRole] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await apiClient.get<User[]>('/api/admin/users');
            setUsers(data);
        } catch (error) {
            console.error("Failed to fetch users", error);
            toast.error("Could not load user list.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleRoleChange = async (userId: string, userName: string, isCurrentlyArtist: boolean) => {
        const action = isCurrentlyArtist ? 'remove' : 'assign';
        const actionEndpoint = isCurrentlyArtist ? 'remove-artist-role' : 'assign-artist-role';
        const httpMethod = isCurrentlyArtist ? 'delete' : 'post';

        if (!confirm(`Are you sure you want to ${action} the 'Artist' role for user "${userName}"?`)) {
            return;
        }

        setIsUpdatingRole(userId);
        try {
            await apiClient[httpMethod](`/api/admin/users/${userId}/${actionEndpoint}`, {});
            toast.success(`Role for "${userName}" updated successfully!`);
            fetchUsers();
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || "Failed to update role.";
            toast.error(errorMessage);
            console.error(error);
        } finally {
            setIsUpdatingRole(null);
        }
    };

    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-md text-gray-200">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">User Management</h2>
                <button
                    onClick={fetchUsers}
                    disabled={isLoading}
                    className="flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <RefreshCcw className="w-4 h-4 mr-2" />
                    )}
                    Refresh
                </button>
            </div>

            {isLoading && users.length === 0 ? (
                <p>Loading users...</p>
            ) : users.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No users found.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] text-left">
                        <thead>
                        <tr className="border-b border-gray-700">
                            <th className="p-3">Username</th>
                            <th className="p-3">Email</th>
                            <th className="p-3">Roles</th>
                            <th className="p-3 text-center">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map(user => {
                            const isArtist = user.roles.includes('Artist');
                            const isAdmin = user.roles.includes('Admin');
                            const isCurrentUserBeingUpdated = isUpdatingRole === user.id;

                            return (
                                <tr key={user.id} className="border-b border-gray-700 last:border-b-0 hover:bg-gray-700/50">
                                    <td className="p-3">{user.userName}</td>
                                    <td className="p-3">{user.email}</td>
                                    <td className="p-3">
                                        <div className="flex flex-wrap gap-2">
                                            {user.roles.map(role => (
                                                <span key={role} className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-600">
                                                        {role}
                                                    </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-3 text-center">
                                        {!isAdmin && (
                                            <button
                                                onClick={() => handleRoleChange(user.id, user.userName, isArtist)}
                                                disabled={isCurrentUserBeingUpdated || isLoading}
                                                className={`px-4 py-1 text-sm font-bold text-white rounded-full transition-colors ${
                                                    isArtist
                                                        ? 'bg-red-600 hover:bg-red-700'
                                                        : 'bg-green-600 hover:bg-green-700'
                                                } ${isCurrentUserBeingUpdated || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                {isCurrentUserBeingUpdated ? (
                                                    <svg className="animate-spin h-4 w-4 mx-auto" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                ) : (
                                                    isArtist ? 'Remove Artist' : 'Make Artist'
                                                )}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}