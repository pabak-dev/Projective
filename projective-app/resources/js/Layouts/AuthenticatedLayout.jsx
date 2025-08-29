import Navbar from "@/Components/Navbar";

export default function AuthenticatedLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <main>{children}</main>
        </div>
    );
}
