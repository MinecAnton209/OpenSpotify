import ArtistGuard from "@/components/auth/ArtistGuard";
import ArtistDashboard from "./ArtistDashboard";

export default function DashboardPage() {
    return (
        <ArtistGuard>
            <div>
                <h1 className="text-3xl font-bold mb-6">Artist Dashboard</h1>
                <ArtistDashboard />
            </div>
        </ArtistGuard>
    );
}