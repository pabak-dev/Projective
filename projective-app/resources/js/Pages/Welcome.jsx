import Navbar from "../Components/Navbar";
import { Head, Link } from "@inertiajs/react";

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    const handleImageError = () => {
        document
            .getElementById("screenshot-container")
            ?.classList.add("!hidden");
        document.getElementById("docs-card")?.classList.add("!row-span-1");
        document
            .getElementById("docs-card-content")
            ?.classList.add("!flex-row");
        document.getElementById("background")?.classList.add("!hidden");
    };

    const FeatureCard = ({ icon, title, children }) => (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="mb-4">{icon}</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">{children}</p>
        </div>
    );

    const TestimonialCard = ({ avatar, name, role, children }) => (
        <div className="bg-transparent p-6">
            <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 mr-4 flex items-center justify-center">
                    {avatar}
                </div>
                <div>
                    <p className="font-semibold text-gray-900">{name}</p>
                    <p className="text-sm text-gray-600">{role}</p>
                </div>
            </div>
            <p className="text-gray-700 leading-relaxed">"{children}"</p>
        </div>
    );

    // Helper component for task cards in the "TaskFlow" section
    const TaskCard = ({ title, tag, tagColor }) => (
        <div className="bg-white p-4 rounded-lg border border-gray-200 mb-3">
            <p className="font-medium text-gray-800">{title}</p>
            <span
                className={`inline-block mt-2 text-xs font-semibold px-2 py-1 rounded-full ${tagColor}`}
            >
                {tag}
            </span>
        </div>
    );

    return (
        <>
            <Head title="ProjecTive" />
            <div className="bg-gray-50 text-gray-800 font-sans">
                <Navbar auth={auth} />

                <main>
                    {/* actual page part 1 */}
                    <section className="container mx-auto px-6 py-24 sm:py-32">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
                                    Project management that works for your team
                                </h1>
                                <p className="mt-6 text-lg text-gray-600">
                                    Combine the visual simplicity of Trello with
                                    the powerful features of Jira. Manage
                                    projects, track issues, and collaborate
                                    seamlessly.
                                </p>
                                <div className="mt-8 flex items-center space-x-4">
                                    <Link
                                        href="#"
                                        className="bg-gray-900 text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 inline-flex items-center"
                                    >
                                        Start free trial
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5 ml-2"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </Link>
                                    <Link
                                        href="#"
                                        className="flex items-center text-gray-700 font-medium hover:text-gray-900"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-6 w-6 mr-2"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                        Watch demo
                                    </Link>
                                </div>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg p-8 h-80 flex items-center justify-center">
                                <div className="text-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-12 w-12 mx-auto text-gray-300"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1}
                                            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                        />
                                    </svg>
                                    <p className="mt-4 text-gray-500">
                                        Interactive Product Demo
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* actual page part 2 */}
                    <section className="bg-white py-24 sm:py-32">
                        <div className="container mx-auto px-6">
                            <div className="text-center max-w-3xl mx-auto">
                                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                                    Everything you need to manage projects
                                </h2>
                                <p className="mt-4 text-lg text-gray-600">
                                    Powerful features that scale with your team
                                </p>
                            </div>
                            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <FeatureCard
                                    title="Kanban Boards"
                                    icon={
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-8 w-8 text-indigo-500"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                                            />
                                        </svg>
                                    }
                                >
                                    Visual workflow management with
                                    drag-and-drop simplicity.
                                </FeatureCard>
                                <FeatureCard
                                    title="Issue Tracking"
                                    icon={
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-8 w-8 text-indigo-500"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                            />
                                        </svg>
                                    }
                                >
                                    Track bugs, tasks, and user stories with
                                    detailed workflows.
                                </FeatureCard>
                                <FeatureCard
                                    title="Advanced Reporting"
                                    icon={
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-8 w-8 text-indigo-500"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                            />
                                        </svg>
                                    }
                                >
                                    Real-time insights and analytics for better
                                    decision-making.
                                </FeatureCard>
                                <FeatureCard
                                    title="Team Collaboration"
                                    icon={
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-8 w-8 text-indigo-500"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                            />
                                        </svg>
                                    }
                                >
                                    Comments, mentions, and real-time updates
                                    keep everyone aligned.
                                </FeatureCard>
                                <FeatureCard
                                    title="Sprint Planning"
                                    icon={
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-8 w-8 text-indigo-500"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M13 10V3L4 14h7v7l9-11h-7z"
                                            />
                                        </svg>
                                    }
                                >
                                    Effectively manage agile sprints with
                                    velocity tracking.
                                </FeatureCard>
                                <FeatureCard
                                    title="Integrations"
                                    icon={
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-8 w-8 text-indigo-500"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                            />
                                        </svg>
                                    }
                                >
                                    Connect with your favorite tools and
                                    streamline workflows.
                                </FeatureCard>
                            </div>
                        </div>
                    </section>

                    {/* actual page part 3 */}
                    <section className="container mx-auto px-6 py-24 sm:py-32">
                        <div className="text-center max-w-3xl mx-auto">
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                                See TaskFlow in action
                            </h2>
                            <p className="mt-4 text-lg text-gray-600">
                                Experience the perfect blend of visual boards
                                and powerful tracking.
                            </p>
                        </div>
                        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-gray-100 p-4 rounded-lg">
                                <h4 className="font-bold text-gray-800 mb-4">
                                    To Do
                                </h4>
                                <TaskCard
                                    title="Design new homepage"
                                    tag="BUG-001"
                                    tagColor="bg-red-100 text-red-800"
                                />
                                <TaskCard
                                    title="Fix login bug"
                                    tag="BUG-002"
                                    tagColor="bg-red-100 text-red-800"
                                />
                            </div>
                            <div className="bg-gray-100 p-4 rounded-lg">
                                <h4 className="font-bold text-gray-800 mb-4">
                                    In Progress
                                </h4>
                                <TaskCard
                                    title="API Integration"
                                    tag="DEV-003"
                                    tagColor="bg-blue-100 text-blue-800"
                                />
                            </div>
                            <div className="bg-gray-100 p-4 rounded-lg">
                                <h4 className="font-bold text-gray-800 mb-4">
                                    Done
                                </h4>
                                <TaskCard
                                    title="Setup database"
                                    tag="DEV-001"
                                    tagColor="bg-green-100 text-green-800"
                                />
                            </div>
                        </div>
                    </section>

                    {/* actual page part 4 */}
                    <section className="bg-white py-24 sm:py-32">
                        <div className="container mx-auto px-6">
                            <div className="text-center max-w-3xl mx-auto">
                                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                                    Trusted by teams worldwide
                                </h2>
                            </div>
                            <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <TestimonialCard
                                    name="Sarah Chen"
                                    role="Product Manager"
                                    avatar={
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-7 w-7 text-gray-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                        </svg>
                                    }
                                >
                                    ProjecTive gives us the visual clarity of
                                    Trello with the tracking power we needed.
                                    Our team velocity improved by 40%.
                                </TestimonialCard>
                                <TestimonialCard
                                    name="Mike Rodriguez"
                                    role="Engineering Lead"
                                    avatar={
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-7 w-7 text-gray-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                        </svg>
                                    }
                                >
                                    We can plan sprints like Jira but execute
                                    with the simplicity of a Kanban board.
                                </TestimonialCard>
                                <TestimonialCard
                                    name="Emma Thompson"
                                    role="Scrum Master"
                                    avatar={
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-7 w-7 text-gray-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={1.5}
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                        </svg>
                                    }
                                >
                                    Planning is faster, our reporting is
                                    clearer, and our team is more aligned than
                                    ever before.
                                </TestimonialCard>
                            </div>
                        </div>
                    </section>

                    {/* actual page part 5 */}
                    <section className="container mx-auto px-6 py-24 text-center">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                            Ready to transform your project management?
                        </h2>
                        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                            Join thousands of teams already using ProjecTive to
                            deliver better results faster.
                        </p>
                        <div className="mt-8 flex justify-center space-x-4">
                            <Link
                                href="#"
                                className="bg-gray-900 text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800"
                            >
                                Start Free 14-day trial
                            </Link>
                            <Link
                                href="#"
                                className="bg-white text-gray-800 px-6 py-3 rounded-md font-medium border border-gray-300 hover:bg-gray-100"
                            >
                                Schedule a demo
                            </Link>
                        </div>
                    </section>
                </main>

                {/* footer */}
                <footer className="bg-white border-t border-gray-200">
                    <div className="container mx-auto px-6 py-16">
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                            <div className="lg:col-span-2">
                                <h3 className="text-2xl font-bold text-gray-900">
                                    ProjecTive
                                </h3>
                                <p className="mt-2 text-gray-600">
                                    Project management that works for your team.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800">
                                    Product
                                </h4>
                                <ul className="mt-4 space-y-2">
                                    <li>
                                        <Link
                                            href="#"
                                            className="text-gray-600 hover:text-gray-900"
                                        >
                                            Features
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="#"
                                            className="text-gray-600 hover:text-gray-900"
                                        >
                                            Pricing
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="#"
                                            className="text-gray-600 hover:text-gray-900"
                                        >
                                            Integrations
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="#"
                                            className="text-gray-600 hover:text-gray-900"
                                        >
                                            API
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800">
                                    Company
                                </h4>
                                <ul className="mt-4 space-y-2">
                                    <li>
                                        <Link
                                            href="#"
                                            className="text-gray-600 hover:text-gray-900"
                                        >
                                            About
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="#"
                                            className="text-gray-600 hover:text-gray-900"
                                        >
                                            Blog
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="#"
                                            className="text-gray-600 hover:text-gray-900"
                                        >
                                            Careers
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="#"
                                            className="text-gray-600 hover:text-gray-900"
                                        >
                                            Contact
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800">
                                    Resources
                                </h4>
                                <ul className="mt-4 space-y-2">
                                    <li>
                                        <Link
                                            href="#"
                                            className="text-gray-600 hover:text-gray-900"
                                        >
                                            Help Center
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="#"
                                            className="text-gray-600 hover:text-gray-900"
                                        >
                                            Documentation
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="#"
                                            className="text-gray-600 hover:text-gray-900"
                                        >
                                            Community
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="#"
                                            className="text-gray-600 hover:text-gray-900"
                                        >
                                            Status
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div className="mt-16 pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center">
                            <p className="text-gray-500 text-sm">
                                &copy; {new Date().getFullYear()} ProjecTive.
                                All rights reserved.
                            </p>
                            <div className="flex space-x-4 mt-4 sm:mt-0">
                                <Link
                                    href="#"
                                    className="text-gray-500 hover:text-gray-800"
                                >
                                    <svg
                                        className="h-5 w-5"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </Link>
                                <Link
                                    href="#"
                                    className="text-gray-500 hover:text-gray-800"
                                >
                                    <svg
                                        className="h-5 w-5"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                    </svg>
                                </Link>
                                <Link
                                    href="#"
                                    className="text-gray-500 hover:text-gray-800"
                                >
                                    <svg
                                        className="h-5 w-5"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M12 2C6.477 2 2 6.477 2 12.019c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12.019C22 6.477 17.523 2 12 2z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
