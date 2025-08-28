import { Link, usePage } from "@inertiajs/react";

export default function Navbar({ auth }) {
    const { url } = usePage();

    const linkClasses = (href) =>
        url.startsWith(href)
            ? "text-gray-900 border-b-2 border-indigo-500 pb-1 font-medium"
            : "text-gray-600 hover:text-gray-900";

    return (
        <header className="bg-gray-50/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                {/* Logo */}
                <div className="text-2xl font-bold text-gray-900">
                    <Link href="/">ProjecTive</Link>
                </div>

                {/* Navigation */}
                <nav className="hidden lg:flex items-center space-x-8">
                    <Link href={route("dashboard")} className={linkClasses("/dashboard")}>
                        Dashboard
                    </Link>
                    <Link href={route("boards")} className={linkClasses("/boards")}>
                        Boards
                    </Link>
                </nav>

                {/* Right Side: Authenticated / Guest */}
                <div className="flex items-center space-x-4">
                    {auth?.user ? (
                        <span className="text-sm font-medium text-gray-700">
                            {auth.user.name}
                        </span>
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
