import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import LeaderboardView from "./LeaderboardView";

export default function Leaderboard() {
    return (
        <AuthenticatedLayout>
            <Head title="Leaderboard" />
            <LeaderboardView />
        </AuthenticatedLayout>
    );
}