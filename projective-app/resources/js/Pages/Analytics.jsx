import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import AnalyticsView from "./AnalyticsView";

export default function Analytics() {
    return (
        <AuthenticatedLayout>
            <Head title="Analytics" />
            <AnalyticsView />
        </AuthenticatedLayout>
    );
}