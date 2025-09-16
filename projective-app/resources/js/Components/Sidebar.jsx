import React from "react";
import { Link } from "@inertiajs/react";
import { Briefcase, PlusCircle } from "lucide-react";

const Sidebar = ({
    projects,
    selectedProject,
    setSelectedProject,
    openNewProjectModal,
}) => {
    return (
        <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                    Workspace
                </h2>
                <button
                    onClick={openNewProjectModal}
                    className="text-gray-400 hover:text-gray-700"
                    title="Create new project"
                >
                    <PlusCircle size={20} />
                </button>
            </div>
            <nav className="flex-1 px-2 py-4 space-y-1">
                {projects.map((project) => (
                    <button
                        key={project.id}
                        onClick={() => setSelectedProject(project)}
                        className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md text-left ${
                            selectedProject?.id === project.id
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                    >
                        <Briefcase size={16} />
                        <span className="ml-3 truncate">{project.name}</span>
                    </button>
                ))}
            </nav>

            {/* Team Members Section */}
            {selectedProject && (
                <div className="p-4 border-t border-gray-200">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Team
                    </h3>
                    {selectedProject.members?.map((member) => (
                        <div key={member.id} className="flex items-center mb-3">
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-3 text-xs font-bold text-gray-500">
                                {member.name.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                                {member.name}
                                {member.id === selectedProject.owner?.id && (
                                    <span className="text-xs text-gray-500 ml-1">
                                        (Owner)
                                    </span>
                                )}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
