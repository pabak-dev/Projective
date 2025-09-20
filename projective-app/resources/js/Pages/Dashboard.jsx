import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
    ClockIcon,
    CheckCircleIcon,
    FireIcon,
    UserGroupIcon,
    StarIcon,
    ArrowUpIcon,
} from '@heroicons/react/24/outline';

export default function Dashboard({ auth, myTasks, projects, upcomingDeadlines, recentActivity, leaderboard }) {

    // Format dates nicely
    const formatDate = (dateString) => {
        if (!dateString) return 'No due date';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Priority color indicators
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-red-500';
            case 'medium': return 'text-yellow-500';
            case 'low': return 'text-green-500';
            default: return 'text-gray-400';
        }
    };

    const StatCard = ({ icon, title, value, change }) => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                </div>
                <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full">
                    {icon}
                </div>
            </div>
            {change && (
                <div className="mt-4 flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <span className="text-green-600 dark:text-green-400 flex items-center">
                        <ArrowUpIcon className="w-4 h-4 mr-1" />
                        {change.split(' ')[0]}
                    </span>
                    <span className="ml-1">{change.substring(change.indexOf(' ') + 1)}</span>
                </div>
            )}
        </div>
    );

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div>
                    <h2 className="font-semibold text-2xl text-gray-800 dark:text-gray-200 leading-tight">
                        Welcome back, {auth.user.name}! 👋
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        Here's your project overview for today.
                    </p>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            icon={<CheckCircleIcon className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />}
                            title="My Open Tasks"
                            value={myTasks.length}
                            change="+2 this week"
                        />
                        <StatCard
                            icon={<UserGroupIcon className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />}
                            title="Active Projects"
                            value={projects.length}
                        />
                         <StatCard
                            icon={<StarIcon className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />}
                            title="Your Rank"
                            value={`#${leaderboard.currentUser.rank}`}
                            change={`${leaderboard.currentUser.points ?? 0} pts`}
                        />
                        <StatCard
                            icon={<ClockIcon className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />}
                            title="Deadlines"
                            value={upcomingDeadlines.length}
                            change="in next 7 days"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            {/* My Tasks */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">My Tasks</h3>
                                <ul className="space-y-3">
                                    {myTasks.length > 0 ? (
                                        myTasks.map(task => (
                                            <li key={task.id} className="flex justify-between items-center text-sm p-3 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                <div>
                                                    <p className="font-medium text-gray-800 dark:text-gray-200">{task.title}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{task.project.name}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs text-gray-600 dark:text-gray-300">{formatDate(task.due_date)}</span>
                                                    <div className={getPriorityColor(task.priority)} title={`Priority: ${task.priority}`}>
                                                        <FireIcon className="w-4 h-4"/>
                                                    </div>
                                                </div>
                                            </li>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No pressing tasks assigned to you. Great job!</p>
                                    )}
                                </ul>
                            </div>

                            {/* Project Health */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Project Health</h3>
                                <ul className="space-y-5">
                                    {projects.map(project => (
                                        <li key={project.id}>
                                            <div className="flex justify-between items-center mb-1 text-sm">
                                                <p className="font-medium text-gray-800 dark:text-gray-200">{project.name}</p>
                                                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">{project.progress}%</p>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div
                                                    className="bg-indigo-500 h-2 rounded-full"
                                                    style={{ width: `${project.progress}%` }}
                                                ></div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Leaderboard */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Leaderboard</h3>
                            <ul className="space-y-4">
                                {leaderboard.topUsers.map((user, index) => (
                                    <li key={user.id} className="flex items-center justify-between text-sm p-2 rounded-lg">
                                        <div className="flex items-center">
                                            <span className="font-bold text-base text-gray-400 dark:text-gray-500 w-6 text-center">{index + 1}</span>
                                            <img
                                                src={user.avatar || `https://ui-avatars.com/api/?name=${user.name.replace(' ', '+')}&color=fff&background=9CA3AF`}
                                                alt={user.name}
                                                className="w-10 h-10 rounded-full ml-2 mr-3"
                                            />
                                            <div>
                                                <p className="font-semibold text-gray-800 dark:text-gray-200">{user.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{user.points} pts</p>
                                            </div>
                                        </div>
                                        {index === 0 && <span className="text-yellow-500 text-2xl">🥇</span>}
                                        {index === 1 && <span className="text-gray-400 text-2xl">🥈</span>}
                                        {index === 2 && <span className="text-orange-400 text-2xl">🥉</span>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}