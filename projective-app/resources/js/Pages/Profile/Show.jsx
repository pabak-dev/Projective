import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'; // We can reuse the layout

export default function Show({ userProfile }) {
    return (
        <AuthenticatedLayout>
            <Head title={`${userProfile.name}'s Profile`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="flex items-center space-x-6">
                                <img
                                    className="h-24 w-24 rounded-full object-cover"
                                    src={userProfile.avatar ? `/storage/${userProfile.avatar}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.name)}&color=7F9CF5&background=EBF4FF`}
                                    alt={userProfile.name}
                                />
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">{userProfile.name}</h1>
                                    <p className="text-gray-600">{userProfile.role || 'No role specified'}</p>
                                    <p className="text-sm text-gray-500 mt-1">Member since {new Date(userProfile.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Projects</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {userProfile.projects.map(project => (
                                <div key={project.id} className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                                    <h3 className="font-bold text-lg">{project.name}</h3>
                                    <p className="text-sm text-gray-600 mt-2">{project.description}</p>
                                </div>
                            ))}
                             {userProfile.projects.length === 0 && (
                                <p className="text-gray-500">This user is not yet part of any projects.</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-8">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Assigned Tasks</h2>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <ul className="divide-y divide-gray-200">
                                {userProfile.assigned_tasks.map(task => (
                                    <li key={task.id} className="p-4 flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold">{task.title}</p>
                                            <p className="text-sm text-gray-500">Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</p>
                                        </div>
                                        <span className="text-sm capitalize font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-full">{task.status.replace('_', ' ')}</span>
                                    </li>
                                ))}
                                {userProfile.assigned_tasks.length === 0 && (
                                    <p className="p-4 text-gray-500">This user has no assigned tasks.</p>
                                )}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}