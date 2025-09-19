import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import {
    ClockIcon,
    CheckCircleIcon,
    FireIcon,
    UserGroupIcon,
    StarIcon,
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
            case 'high': return 'bg-red-500';
            case 'medium': return 'bg-yellow-500';
            case 'low': return 'bg-green-500';
            default: return 'bg-gray-400';
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                        {/* My Tasks */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="text-lg font-semibold flex items-center">
                                <CheckCircleIcon className="w-6 h-6 mr-2 text-gray-700" /> My Tasks
                            </h3>
                            <ul className="mt-4 space-y-3">
                                {myTasks.length > 0 ? (
                                    myTasks.map(task => (
                                        <li key={task.id} className="flex justify-between items-center text-sm">
                                            <div>
                                                <p className="font-medium text-gray-800">{task.title}</p>
                                                <p className="text-xs text-gray-500">{task.project.name}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-600">{formatDate(task.due_date)}</span>
                                                <span
                                                    className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`}
                                                    title={`Priority: ${task.priority}`}
                                                ></span>
                                            </div>
                                        </li>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">No pressing tasks assigned to you. Great job!</p>
                                )}
                            </ul>
                        </div>

                        {/* Project Health */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="text-lg font-semibold flex items-center">
                                <UserGroupIcon className="w-6 h-6 mr-2 text-gray-700" /> Project Health
                            </h3>
                            <ul className="mt-4 space-y-4">
                                {projects.map(project => (
                                    <li key={project.id}>
                                        <div className="flex justify-between items-center mb-1 text-sm">
                                            <p className="font-medium text-gray-800">{project.name}</p>
                                            <p className="text-xs text-gray-500">{project.progress}%</p>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: `${project.progress}%` }}
                                            ></div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Leaderboard */}
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="text-lg font-semibold flex items-center">
                                <StarIcon className="w-6 h-6 mr-2 text-yellow-500" /> Leaderboard
                            </h3>
                            <ul className="mt-4 space-y-3">
                                {leaderboard.topUsers.map((user, index) => (
                                    <li key={user.id} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center">
                                            <span className="font-bold text-gray-600 mr-2">{index + 1}.</span>
                                            <img
                                                src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&color=7F9CF5&background=EBF4FF`}
                                                alt={user.name}
                                                className="w-8 h-8 rounded-full mr-3"
                                            />
                                            <p className="font-medium text-gray-800">{user.name}</p>
                                        </div>
                                        <p className="text-gray-600 font-semibold">{user.points} pts</p>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center text-sm font-semibold">
                                <p>Your Rank: #{leaderboard.currentUser.rank}</p>
                                <p>{leaderboard.currentUser.points ?? 0} pts</p>
                            </div>
                        </div>

                        {/* Upcoming Deadlines + Recent Activity */}
                        <div className="bg-white p-6 rounded-lg shadow-sm col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Upcoming Deadlines */}
                            <div>
                                <h3 className="text-lg font-semibold flex items-center">
                                    <ClockIcon className="w-6 h-6 mr-2 text-gray-700" /> Upcoming Deadlines
                                </h3>
                                <ul className="mt-4 space-y-3">
                                    {upcomingDeadlines.length > 0 ? (
                                        upcomingDeadlines.map(task => (
                                            <li key={task.id} className="text-sm">
                                                <p className="font-medium text-gray-800">{task.title}</p>
                                                <p className="text-xs text-red-600">Due: {formatDate(task.due_date)}</p>
                                            </li>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500">No deadlines in the next week.</p>
                                    )}
                                </ul>
                            </div>

                            {/* Recent Activity */}
                            <div>
                                <h3 className="text-lg font-semibold flex items-center">
                                    <FireIcon className="w-6 h-6 mr-2 text-gray-700" /> Recent Activity
                                </h3>
                                <ul className="mt-4 space-y-3">
                                    {recentActivity.length > 0 ? (
                                        recentActivity.map(task => (
                                            <li key={task.id} className="text-sm">
                                                <p className="font-medium text-gray-800">
                                                    <span className="font-bold">{task.assigned_user?.name || 'Someone'}</span>{' '}
                                                    updated <span className="font-bold">{task.title}</span>
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(task.updated_at).toLocaleString()}
                                                </p>
                                            </li>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500">No recent activity.</p>
                                    )}
                                </ul>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
