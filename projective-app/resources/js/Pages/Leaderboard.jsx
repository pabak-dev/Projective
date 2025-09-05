import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
// Correct the import path here
import LeaderboardView from "./LeaderboardView";

export default function Leaderboard({ topPerformers, pointSystem, achievements, userStats }) {
    return (
        <AuthenticatedLayout>
            <Head title="Leaderboard" />
            <LeaderboardView
                topPerformers={topPerformers}
                pointSystem={pointSystem}
                achievements={achievements}
                userStats={userStats}
            />
        </AuthenticatedLayout>
    );
}