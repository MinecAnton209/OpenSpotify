import AdminGuard from "@/components/auth/AdminGuard";
import UserList from "./UserList";

export default function AdminPage() {
    return (
        <AdminGuard>
            <div>
                <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
                <UserList />
            </div>
        </AdminGuard>
    );
}