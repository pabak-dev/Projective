import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import CalendarView from "./CalendarView";

export default function Calendar() {
    return (
        <AuthenticatedLayout>
            <Head title="Calendar" />
            <CalendarView />
        </AuthenticatedLayout>
    );
}