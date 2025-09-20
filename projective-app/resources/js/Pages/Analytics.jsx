import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import AnalyticsView from "./AnalyticsView";

export default function Analytics({ auth, metrics, recentActivities, teamPerformance, taskDistribution, taskFlow, projects, currentProjectId, currentPeriod }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Analytics</h2>}
        >
            <Head title="Analytics" />
            <AnalyticsView 
                metrics={metrics}
                recentActivities={recentActivities}
                teamPerformance={teamPerformance}
                taskDistribution={taskDistribution}
                taskFlow={taskFlow}
                projects={projects}
                currentProjectId={currentProjectId}
                currentPeriod={currentPeriod}
            />
        </AuthenticatedLayout>
    );
}