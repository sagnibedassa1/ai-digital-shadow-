import React, { useState } from 'react';
import { Project, TeamMember, Comment } from '../types';
import { Folder, Users, MessageSquare, Clock, Plus, MoreVertical, FileText, Share2, Shield, Search } from 'lucide-react';

const ProjectManager: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Wetland Restoration 2024',
      description: 'Evaluating straw return impact on saturated clay loam in the Yangtze basin.',
      updatedAt: '2 hours ago',
      status: 'Active',
      simulations: 12,
      members: [
        { id: 'u1', name: 'Sagni B.', role: 'Admin', avatar: 'SB' },
        { id: 'u2', name: 'Dr. Chen', role: 'Editor', avatar: 'DC' }
      ],
      comments: [
        { id: 'c1', author: 'Dr. Chen', text: 'Calibration for cohesion seems low on batch #4.', timestamp: '10:30 AM' }
      ]
    },
    {
      id: '2',
      name: 'High-Speed Tillage Optimization',
      description: 'RSM study for identifying optimal rotary speeds > 300rpm.',
      updatedAt: '1 day ago',
      status: 'Active',
      simulations: 45,
      members: [
        { id: 'u1', name: 'Sagni B.', role: 'Admin', avatar: 'SB' },
        { id: 'u3', name: 'Lab Tech', role: 'Viewer', avatar: 'LT' }
      ],
      comments: []
    }
  ]);

  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newComment, setNewComment] = useState('');

  const filteredProjects = projects.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePostComment = () => {
      if (!newComment.trim() || !activeProject) return;
      
      const comment: Comment = {
          id: Date.now().toString(),
          author: 'Me',
          text: newComment,
          timestamp: 'Just now'
      };

      // Update local state for active project and projects list
      const updatedProject = {
          ...activeProject,
          comments: [...activeProject.comments, comment]
      };
      
      setActiveProject(updatedProject);
      setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
      setNewComment('');
  };

  const handleNewProject = () => {
      alert("Create Project wizard would open here.");
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Folder className="text-agri-600" /> Project Hub
            </h1>
            <p className="text-sm text-gray-500">Collaborate, share parameters, and manage simulation campaigns.</p>
        </div>
        <button 
            onClick={handleNewProject}
            className="bg-agri-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-agri-800 transition-colors"
        >
            <Plus size={18} /> New Project
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* Project List Sidebar */}
        <div className="w-80 border-r border-gray-200 bg-white overflow-y-auto flex flex-col">
            <div className="p-4 border-b border-gray-100">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search projects..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-agri-500 focus:outline-none"
                    />
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
                {filteredProjects.map(project => (
                    <div 
                        key={project.id} 
                        onClick={() => setActiveProject(project)}
                        className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${activeProject?.id === project.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : 'border-l-4 border-l-transparent'}`}
                    >
                        <div className="flex justify-between items-start mb-1">
                            <h3 className={`font-bold text-sm ${activeProject?.id === project.id ? 'text-indigo-900' : 'text-gray-800'}`}>{project.name}</h3>
                            <span className="text-[10px] text-gray-400 whitespace-nowrap">{project.updatedAt}</span>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{project.description}</p>
                        
                        <div className="flex items-center justify-between">
                            <div className="flex -space-x-2">
                                {project.members.map(m => (
                                    <div key={m.id} className="w-6 h-6 rounded-full bg-gray-200 border border-white flex items-center justify-center text-[8px] font-bold text-gray-600" title={m.name}>
                                        {m.avatar}
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                                <FileText size={12} /> {project.simulations}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
            {activeProject ? (
                <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    {/* Project Detail Header */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">{activeProject.name}</h2>
                                <p className="text-gray-600">{activeProject.description}</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 text-gray-500 hover:text-indigo-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                                    <Share2 size={18} />
                                </button>
                                <button className="p-2 text-gray-500 hover:text-indigo-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                                    <MoreVertical size={18} />
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-6 pt-4 border-t border-gray-100 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Clock size={16} /> Updated {activeProject.updatedAt}
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <Shield size={16} /> {activeProject.status}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Team Members */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Users size={18} className="text-blue-600" /> Team
                            </h3>
                            <div className="space-y-3">
                                {activeProject.members.map(m => (
                                    <div key={m.id} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                                                {m.avatar}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{m.name}</div>
                                                <div className="text-xs text-gray-500">{m.role}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button 
                                    onClick={() => alert("Add Member modal placeholder")}
                                    className="w-full py-2 mt-2 text-xs font-medium text-blue-600 border border-dashed border-blue-200 rounded-lg hover:bg-blue-50"
                                >
                                    + Add Member
                                </button>
                            </div>
                        </div>

                        {/* Recent Comments */}
                        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <MessageSquare size={18} className="text-green-600" /> Discussion
                            </h3>
                            <div className="flex-1 space-y-4 mb-4 min-h-[200px] max-h-[300px] overflow-y-auto">
                                {activeProject.comments.length > 0 ? (
                                    activeProject.comments.map(c => (
                                        <div key={c.id} className="flex gap-3">
                                            <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-xs shrink-0">
                                                {c.author.charAt(0)}
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-3 text-sm flex-1">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-bold text-gray-900">{c.author}</span>
                                                    <span className="text-xs text-gray-400">{c.timestamp}</span>
                                                </div>
                                                <p className="text-gray-700">{c.text}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-400 text-sm">No comments yet. Start the conversation!</div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="Write a comment..." 
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                                />
                                <button 
                                    onClick={handlePostComment}
                                    disabled={!newComment.trim()}
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Post
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <Folder size={48} className="mb-4 text-gray-300" />
                    <p>Select a project to view details</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default ProjectManager;