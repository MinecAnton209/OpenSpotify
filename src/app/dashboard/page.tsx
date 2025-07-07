import ArtistGuard from "@/components/auth/ArtistGuard";
import ProfileEditor from "./ProfileEditor";

export default function DashboardPage() {
    return (
        <ArtistGuard>
            <div>
                <h1 className="text-3xl font-bold mb-6">Artist Dashboard</h1>
                <ProfileEditor />
            </div>
        </ArtistGuard>
    );
}