const Sidebar = () => {
    return (
        <aside className="w-64 bg-black p-4 shrink-0"> {/* Додано shrink-0 */}
            <div className="text-white font-bold text-xl">OpenSpotify</div>
            <nav className="mt-8">
                <ul>
                    <li className="text-gray-300 hover:text-white cursor-pointer">Home</li>
                    <li className="text-gray-300 hover:text-white cursor-pointer mt-4">Search</li>
                    <li className="text-gray-300 hover:text-white cursor-pointer mt-4">Your Library</li>
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;