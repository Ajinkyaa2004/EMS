import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Users, Building2, Calendar, Clock, TrendingUp, CheckCircle, Menu, X, BarChart3 } from 'lucide-react';
import { getToken } from '../../utils/auth';
import { API_BASE_URL } from '../../config/api';

// Donut Chart Component
function DonutChart({ data, title }: { data: Array<{ label: string; value: number; color: string }>; title: string }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;

  const slices = data.map((item) => {
    const sliceAngle = (item.value / total) * 360;
    const sliceLength = (item.value / total) * circumference;
    const dashOffset = circumference - sliceLength;
    const transform = `rotate(${currentAngle}deg)`;
    const result = { ...item, sliceAngle, dashOffset, transform };
    currentAngle += sliceAngle;
    return result;
  });

  return (
    <div className="p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4 sm:mb-6 text-center">{title}</h3>
      <div className="flex flex-col items-center">
        <svg width="160" height="160" viewBox="0 0 200 200" className="mb-4 sm:mb-6 w-32 h-32 sm:w-40 sm:h-40">
          {slices.map((slice, idx) => (
            <circle
              key={idx}
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke={slice.color}
              strokeWidth="20"
              strokeDasharray={`${circumference - slice.dashOffset} ${circumference}`}
              strokeDashoffset="0"
              style={{
                transform: `${slice.transform} translateX(100px) translateY(100px)`,
                transformOrigin: '0 0',
                transformBox: 'fill-box',
              }}
            />
          ))}
          <circle cx="100" cy="100" r="30" fill="white" />
          <text x="100" y="105" textAnchor="middle" className="text-xl sm:text-2xl font-bold" fill="#1f2937">
            {Math.round((data.reduce((sum, item) => sum + item.value, 0) / total) * 100)}%
          </text>
        </svg>
        <div className="space-y-2 w-full">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs sm:text-sm bg-gray-50 rounded-lg p-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }}></div>
                <span className="text-gray-700 font-medium">{item.label}</span>
              </div>
              <span className="text-gray-900 font-bold">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProject(response.data);
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <p className="text-white text-lg">Loading project details...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <p className="text-white text-lg">Project not found</p>
        </div>
      </div>
    );
  }

  // Calculate working duration
  const startDate = new Date(project.startDate);
  const endDate = new Date(project.endDate);
  const today = new Date();
  const daysWorked = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const progressPercentage = Math.min(Math.round((daysWorked / totalDays) * 100), 100);

  // Get all team members
  const allTeamMembers = [
    ...(project.leadAssignee ? [{ ...project.leadAssignee, role: 'Lead' }] : []),
    ...(project.virtualAssistant ? [{ ...project.virtualAssistant, role: 'Virtual Assistant' }] : []),
    ...(project.coders ? project.coders.map((c: any) => ({ ...c, role: 'Coder' })) : []),
    ...(project.freelancers ? project.freelancers.map((f: any) => ({ ...f, role: 'Freelancer' })) : []),
  ];

  const uniqueTeamMembers = Array.from(
    new Map(allTeamMembers.map((member: any) => [member._id, member])).values()
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-3 sm:mb-4 transition font-medium"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Back to Projects</span>
          </button>
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent break-words">{project.title}</h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base line-clamp-2">{project.description}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Project Status Cards */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
                <p className="text-gray-600 text-xs sm:text-sm mb-1 sm:mb-2">Status</p>
                <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-bold ${
                  project.status === 'active' ? 'bg-green-100 text-green-700 ring-2 ring-green-200' :
                  project.status === 'planning' ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-200' :
                  project.status === 'on-hold' ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-200' :
                  project.status === 'completed' ? 'bg-green-100 text-green-700 ring-2 ring-green-200' :
                  'bg-red-100 text-red-700 ring-2 ring-red-200'
                }`}>
                  {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                </span>
              </div>
              <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
                <p className="text-gray-600 text-xs sm:text-sm mb-1 sm:mb-2">Priority</p>
                <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs font-bold ${
                  project.priority === 'high' ? 'bg-red-100 text-red-700 ring-2 ring-red-200' :
                  project.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-200' :
                  'bg-green-100 text-green-700 ring-2 ring-green-200'
                }`}>
                  {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
                </span>
              </div>
              <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
                <p className="text-gray-600 text-xs sm:text-sm mb-1 sm:mb-2">Type</p>
                <p className="text-gray-900 font-bold text-xs sm:text-sm truncate">{project.projectType}</p>
              </div>
            </div>

            {/* Progress Section */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  <span className="hidden sm:inline">Project Progress</span>
                  <span className="sm:hidden">Progress</span>
                </h2>
                <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{progressPercentage}%</span>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-4 sm:mb-6">
                <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 h-full transition-all duration-300 animate-pulse"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {/* Timeline Info */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-2 sm:p-3">
                  <p className="text-gray-600 text-xs mb-1">Days Worked</p>
                  <p className="text-gray-900 text-lg sm:text-2xl font-bold">{daysWorked}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-2 sm:p-3">
                  <p className="text-gray-600 text-xs mb-1">Total Duration</p>
                  <p className="text-gray-900 text-lg sm:text-2xl font-bold">{totalDays}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-2 sm:p-3">
                  <p className="text-gray-600 text-xs mb-1">Days Left</p>
                  <p className="text-gray-900 text-lg sm:text-2xl font-bold">{Math.max(0, totalDays - daysWorked)}</p>
                </div>
              </div>
            </div>

            {/* Donut Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <DonutChart
                  title="Project Progress"
                  data={[
                    { label: 'Completed', value: progressPercentage, color: '#10b981' },
                    { label: 'Remaining', value: Math.max(0, 100 - progressPercentage), color: '#6b7280' },
                  ]}
                />
              </div>
              <div className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <DonutChart
                  title="Team Breakdown by Role"
                  data={[
                    { label: 'Lead', value: project.leadAssignee ? 1 : 0, color: '#3b82f6' },
                    { label: 'VA', value: project.virtualAssistant ? 1 : 0, color: '#f59e0b' },
                    { label: 'Coders', value: project.coders?.length || 0, color: '#8b5cf6' },
                    { label: 'Freelancers', value: project.freelancers?.length || 0, color: '#ec4899' },
                  ].filter(item => item.value > 0)}
                />
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                Timeline
              </h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex-1">
                    <p className="text-gray-500 text-xs sm:text-sm">Start Date</p>
                    <p className="text-gray-900 font-semibold text-sm sm:text-base">{startDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                  </div>
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex-1">
                    <p className="text-gray-500 text-xs sm:text-sm">End Date</p>
                    <p className="text-gray-900 font-semibold text-sm sm:text-base">{endDate.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</p>
                  </div>
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                </div>
              </div>
            </div>

            {/* Project Details */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Project Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-500 text-xs sm:text-sm">Estimated Hours</p>
                  <p className="text-gray-900 text-base sm:text-lg font-semibold">{project.estimatedHours} hours</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs sm:text-sm">Tags</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {project.tags && project.tags.map((tag: string, idx: number) => (
                      <span key={idx} className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Links */}
            {project.links && (Object.values(project.links).some((link: any) => link)) && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Project Links</h2>
                <div className="space-y-2">
                  {project.links.github && (
                    <a href={project.links.github} target="_blank" rel="noopener noreferrer" 
                       className="text-blue-600 hover:text-blue-700 hover:underline block text-sm sm:text-base transition-colors">
                      📦 GitHub Repository
                    </a>
                  )}
                  {project.links.loom && (
                    <a href={project.links.loom} target="_blank" rel="noopener noreferrer" 
                       className="text-blue-600 hover:text-blue-700 hover:underline block text-sm sm:text-base transition-colors">
                      🎥 Loom Video
                    </a>
                  )}
                  {project.links.oneDrive && (
                    <a href={project.links.oneDrive} target="_blank" rel="noopener noreferrer" 
                       className="text-blue-600 hover:text-blue-700 hover:underline block text-sm sm:text-base transition-colors">
                      ☁️ OneDrive Files
                    </a>
                  )}
                  {project.links.whatsapp && (
                    <a href={project.links.whatsapp} target="_blank" rel="noopener noreferrer" 
                       className="text-blue-600 hover:text-blue-700 hover:underline block text-sm sm:text-base transition-colors">
                      💬 WhatsApp Group
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Team & Client */}
          <div className="space-y-6">
            {/* Client Information */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                Client
              </h2>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-100">
                <p className="text-gray-900 font-semibold text-base sm:text-lg">{project.clientId?.name}</p>
                <p className="text-gray-600 text-xs sm:text-sm mt-1">{project.clientId?.type}</p>
                {project.clientId?.email && (
                  <p className="text-blue-600 text-xs sm:text-sm mt-2">{project.clientId.email}</p>
                )}
                {project.clientId?.phone && (
                  <p className="text-gray-600 text-xs sm:text-sm">{project.clientId.phone}</p>
                )}
                {project.clientId?.contactPerson && (
                  <p className="text-gray-600 text-xs sm:text-sm mt-2">Contact: {project.clientId.contactPerson}</p>
                )}
              </div>
            </div>

            {/* Team Members */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                Team ({uniqueTeamMembers.length})
              </h2>
              <div className="space-y-2 sm:space-y-3">
                {uniqueTeamMembers.length === 0 ? (
                  <p className="text-gray-500 text-sm">No team members assigned</p>
                ) : (
                  uniqueTeamMembers.map((member: any) => (
                    <div key={member._id} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg sm:rounded-xl p-3 hover:shadow-md transition-shadow border border-gray-200">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-900 font-semibold text-sm sm:text-base truncate">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="text-gray-600 text-xs truncate">{member.email}</p>
                        </div>
                        <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-2 py-1 rounded text-xs font-semibold whitespace-nowrap">
                          {member.role}
                        </span>
                      </div>
                      {member.phone && (
                        <p className="text-gray-600 text-xs mt-2">{member.phone}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Quick Stats</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm sm:text-base">Team Size</span>
                  <span className="text-gray-900 font-bold text-base sm:text-lg">{uniqueTeamMembers.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm sm:text-base">Completion</span>
                  <span className="text-green-600 font-bold text-base sm:text-lg">{progressPercentage}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm sm:text-base">On Track</span>
                  <span className={`font-bold text-base sm:text-lg ${progressPercentage >= 50 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {progressPercentage >= 50 ? '✓ Yes' : '⚠ Check'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
