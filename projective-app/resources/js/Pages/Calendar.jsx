import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import CalendarView from "./CalendarView";

export default function Calendar({ tasks }) {
    return (
        <AuthenticatedLayout>
             <Head title="Calendar" />
            <CalendarView tasks={tasks} />
        </AuthenticatedLayout>
    );
}