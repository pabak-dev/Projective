import { Link, usePage } from "@inertiajs/react";

export default function Navbar() {
    const { auth, component } = usePage().props;

    const navLinks = [
        { name: "Dashboard", href: route('dashboard'), active: component === 'Dashboard' },
        { name: "Boards", href: route('boards'), active: component === 'Boards' },
        { name: "Analytics", href: route('analytics'), active: component === 'Analytics' },
        { name: "Calendar", href: route('calendar'), active: component === 'Calendar' },
        { name: "Leaderboard", href: route('leaderboard'), active: component === 'Leaderboard' },
    ];

    return (
        <header className="bg-gray-50/95 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <div className="text-2xl font-bold text-gray-900">
                    <Link href="/">ProjecTive</Link>
                </div>
                <nav className="hidden lg:flex items-center space-x-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`text-gray-600 hover:text-gray-900 ${
                                link.active ? "font-bold" : ""
                            }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                </nav>
                <div className="flex items-center space-x-4">
                    {auth.user ? (
                        <>
                            <Link
                                href={route("profile.edit")}
                                className="text-sm font-medium text-gray-700 hover:text-black"
                            >
                                {auth.user.name}
                            </Link>
                            <Link
                                href={route("logout")}
                                method="post"
                                as="button"
                                className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800"
                            >
                                Log Out
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link
                                href={route("login")}
                                className="text-sm font-medium text-gray-700 hover:text-black"
                            >
                                Log in
                            </Link>
                            <Link
                                href={route("register")}
                                className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800"
                            >
                                Get started
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}