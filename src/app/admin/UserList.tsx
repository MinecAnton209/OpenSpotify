"use client";

import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';

interface User {
    id: string;
    userName: string;
    email: string;
    roles: string[];
}

export default function UserList() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await apiClient.get<User[]>('/api/admin/users');
                setUsers(data);
            } catch (error) {
                console.error("Failed to fetch users", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, []);

    if (isLoading) return <p>Loading users...</p>;

    return (
        <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-4">User Management</h2>
            <table className="w-full text-left">
                <thead>
                <tr className="border-b border-gray-700">
                    <th className="p-2">Username</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">Roles</th>
                </tr>
                </thead>
                <tbody>
                {users.map(user => (
                    <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700">
                        <td className="p-2">{user.userName}</td>
                        <td className="p-2">{user.email}</td>
                        <td className="p-2">{user.roles.join(', ')}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}