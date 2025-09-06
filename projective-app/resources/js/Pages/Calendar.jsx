import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import CalendarView from "./CalendarView";

// The fix is to accept `{ tasks }` as an argument here
export default function Calendar({ tasks }) {
    return (
        <AuthenticatedLayout>
            <Head title="Calendar" />
            {/* Now you can safely pass the tasks prop down */}
            <CalendarView tasks={tasks} />
        </AuthenticatedLayout>
    );
}