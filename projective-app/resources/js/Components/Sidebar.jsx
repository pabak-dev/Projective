import React from "react";
import { Link } from "@inertiajs/react";
import { Briefcase, PlusCircle, BarChart2, User } from "lucide-react";

const Sidebar = () => {
    const projects = [
        { id: 1, name: "Project Alpha", icon: <Briefcase size={16} /> },
        { id: 2, name: "Marketing Campaign", icon: <Briefcase size={16} /> },
    ];
    const team = [
        { id: 1, name: "Sarah Chen", avatar: "/path/to/avatar1.png" },
        { id: 2, name: "Mike Johnson", avatar: "/path/to/avatar2.png" },
    ];
    const activeProjectId = 1;

    return (
        <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Workspace
                </h2>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1">
                {projects.map((project) => (
                    <Link
                        key={project.id}
                        href="#"
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                            project.id === activeProjectId
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                    >
                        {project.icon}
                        <span className="ml-3">{project.name}</span>
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Quick Actions
                </h3>
                <Link
                    href="#"
                    className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 py-1"
                >
                    <PlusCircle size={16} className="mr-3" /> Create Task
                </Link>
                <Link
                    href="#"
                    className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 py-1"
                >
                    <BarChart2 size={16} className="mr-3" /> View Analytics
                </Link>
            </div>

            <div className="p-4 border-t border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Team
                </h3>
                {team.map((member) => (
                    <div key={member.id} className="flex items-center mb-3">
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                            <User size={14} className="text-gray-500" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                            {member.name}
                        </span>
                    </div>
                ))}
            </div>
        </aside>
    );
};

export default Sidebar;
