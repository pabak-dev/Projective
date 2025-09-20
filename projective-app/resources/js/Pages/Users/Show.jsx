import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";

export default function Show({ user, stats, achievements = [], completedTasks = [] }) {
    
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`${user.name} - Profile`} />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
                    {/* --- Profile Header & Stats Card --- */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center mb-6">
                                <img
                                    src={
                                        user.avatar
                                            ? `/storage/${user.avatar}`
                                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`
                                    }
                                    alt={user.name}
                                    className="w-20 h-20 rounded-full mr-6"
                                />
                                <div>
                                    <h1 className="text-3xl font-bold">{user.name}</h1>
                                    <p className="text-gray-600">{user.role}</p>
                                    <p className="text-gray-500 text-sm">{user.email}</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-blue-50 p-6 rounded-lg text-center">
                                    <h3 className="font-semibold text-blue-800 mb-2">Total Points</h3>
                                    <p className="text-3xl font-bold text-blue-600">{stats.totalPoints}</p>
                                </div>
                                <div className="bg-green-50 p-6 rounded-lg text-center">
                                    <h3 className="font-semibold text-green-800 mb-2">Completed Tasks</h3>
                                    <p className="text-3xl font-bold text-green-600">{stats.completedTasks}</p>
                                </div>
                                <div className="bg-purple-50 p-6 rounded-lg text-center">
                                    <h3 className="font-semibold text-purple-800 mb-2">Total Tasks</h3>
                                    <p className="text-3xl font-bold text-purple-600">{stats.totalTasks}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* --- Achievements Card --- */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-4 text-gray-800">Achievements</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {achievements.map((achievement, index) => (
                                    <div
                                        key={index}
                                        className={`p-4 rounded-lg flex items-start gap-4 ${
                                            achievement.earned ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                                        } border-2`}
                                    >
                                        <div className="text-3xl mt-1">{achievement.icon}</div>
                                        <div className="flex-1">
                                            <h3 className={`font-bold ${achievement.earned ? 'text-green-800' : 'text-gray-700'}`}>
                                                {achievement.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                                            
                                            {!achievement.earned && achievement.progress && (
                                                <div>
                                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                        <span>Progress</span>
                                                        <span>{achievement.progress.current}/{achievement.progress.target}</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-500 h-2 rounded-full"
                                                            style={{ width: `${Math.min((achievement.progress.current / achievement.progress.target) * 100, 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )}
                                            {achievement.earned && achievement.earned_at && (
                                                <p className="text-xs text-green-600 font-semibold mt-1">
                                                    Unlocked on {formatDate(achievement.earned_at)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-4 text-gray-800">Completed Task History</h2>
                            <div className="mt-4">
                                {completedTasks.length > 0 ? (
                                    <ul className="divide-y divide-gray-200">
                                        {completedTasks.map((task) => (
                                            <li key={task.id} className="py-3 flex justify-between items-center">
                                                <div>
                                                    <p className="font-semibold text-gray-800">{task.title}</p>
                                                    <p className="text-sm text-gray-500">
                                                        In project: <span className="font-medium text-gray-600">{task.project?.name || 'N/A'}</span>
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-500">Completed on</p>
                                                    <p className="font-medium text-gray-700">{formatDate(task.completed_at)}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500">No completed tasks yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}