"use client";

import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const Sidebar = () => {
    const { isAuthenticated, user, logout } = useAuthStore();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <aside className="w-64 bg-black p-4 shrink-0 flex flex-col justify-between">
            <div>
                <Link href="/" className="text-white font-bold text-xl">OpenSpotify</Link>
                <nav className="mt-8">
                    <ul>
                        <li className="text-gray-300 hover:text-white cursor-pointer"><Link href="/">Home</Link></li>
                        <li className="text-gray-300 hover:text-white cursor-pointer mt-4">Search</li>
                        {isAuthenticated && (
                            <li className="text-gray-300 hover:text-white cursor-pointer mt-4">Your Library</li>
                        )}
                    </ul>
                </nav>
            </div>

            <div>
                {isAuthenticated ? (
                    <div className="text-white">
                        <p className="text-sm">Logged in as:</p>
                        <p className="font-bold">{user?.username}</p>
                        <button
                            onClick={handleLogout}
                            className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Log Out
                        </button>
                    </div>
                ) : (
                    <div>
                        <Link href="/login">
                            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                                Log In
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;