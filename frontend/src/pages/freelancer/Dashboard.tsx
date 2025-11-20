import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Briefcase, CheckCircle, FileText, CheckSquare } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { getToken } from '../../utils/auth';
import { API_BASE_URL } from '../../config/api';

export default function FreelancerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tasks');
  const [projects, setProjects] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updateForm, setUpdateForm] = useState({
    summary: '',
    loomLink: '',
    projectId: '',
    nextPlan: '',
  });

  useEffect(() => {
    if (user?.role !== 'freelancer') {
      navigate('/');
    }
    fetchFreelancerTasks();
    fetchFreelancerProjects();
    fetchFreelancerUpdates();
  }, [user, navigate]);

  const fetchFreelancerTasks = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/tasks/my-tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch freelancer tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFreelancerProjects = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/projects/freelancer/assigned`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch freelancer projects:', error);
    }
  };

  const fetchFreelancerUpdates = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/updates/freelancer`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUpdates(response.data);
    } catch (error) {
      console.error('Failed to fetch freelancer updates:', error);
    }
  };

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateForm.summary || !updateForm.projectId) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      const token = getToken();
      await axios.post(`${API_BASE_URL}/updates`, updateForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUpdateForm({ summary: '', loomLink: '', projectId: '', nextPlan: '' });
      fetchFreelancerUpdates();
      toast.success('Update submitted successfully!');
    } catch (error) {
      console.error('Failed to submit update:', error);
      toast.error('Failed to submit update');
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-white" />
            <h1 className="text-2xl font-bold text-white">Freelancer Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-orange-100 text-sm">Welcome</p>
              <p className="text-white font-semibold">{user?.firstName} {user?.lastName}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 flex gap-8">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`py-4 px-2 border-b-2 transition ${
              activeTab === 'tasks'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4" />
              My Tasks
            </div>
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`py-4 px-2 border-b-2 transition ${
              activeTab === 'projects'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Projects
            </div>
          </button>
          <button
            onClick={() => setActiveTab('updates')}
            className={`py-4 px-2 border-b-2 transition ${
              activeTab === 'updates'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              My Updates
            </div>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="bg-gray-700 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6">My Tasks</h2>
            {loading ? (
              <p className="text-gray-400 text-center py-8">Loading tasks...</p>
            ) : tasks.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No tasks assigned yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-200">
                  <thead className="bg-gray-800 border-b border-gray-600">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold">Task</th>
                      <th className="text-left py-3 px-4 font-semibold">Priority</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 font-semibold">Due Date</th>
                      <th className="text-left py-3 px-4 font-semibold">Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task: any) => (
                      <tr key={task._id} className="border-b border-gray-600 hover:bg-gray-600/50 transition">
                        <td className="py-3 px-4 font-medium text-white">{task.title}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            task.priority === 'high' ? 'bg-red-500/20 text-red-300' :
                            task.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-green-500/20 text-green-300'
                          }`}>
                            {task.priority ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) : 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            task.status === 'completed' ? 'bg-green-500/20 text-green-300' :
                            task.status === 'in-progress' ? 'bg-blue-500/20 text-blue-300' :
                            'bg-gray-500/20 text-gray-300'
                          }`}>
                            {task.status ? task.status.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-600 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-orange-500 to-orange-400 h-2 rounded-full"
                                style={{ width: `${task.progress || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-semibold text-orange-400">{task.progress || 0}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        
        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="bg-gray-700 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Assigned Projects</h2>
            {projects.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No projects assigned yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project: any) => (
                  <div
                    key={project._id}
                    className="bg-gray-800 rounded-lg p-6 border border-gray-600 hover:border-orange-500 transition"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                        <p className="text-gray-400 text-sm mt-1">{project.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        project.priority === 'high' ? 'bg-red-600' :
                        project.priority === 'medium' ? 'bg-yellow-600' :
                        'bg-green-600'
                      } text-white`}>
                        {project.priority}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-gray-400">Client</p>
                        <p className="text-white font-medium">{project.clientId?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Type</p>
                        <p className="text-white font-medium">{project.projectType || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Start Date</p>
                        <p className="text-white font-medium">
                          {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">End Date</p>
                        <p className="text-white font-medium">
                          {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Est. Hours</p>
                        <p className="text-white font-medium">{project.estimatedHours}h</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Status</p>
                        <p className={`font-medium ${
                          project.status === 'completed' ? 'text-green-400' :
                          project.status === 'active' ? 'text-blue-400' :
                          'text-yellow-400'
                        }`}>
                          {project.status}
                        </p>
                      </div>
                    </div>

                    {project.links && (
                      <div className="flex gap-2 flex-wrap">
                        {project.links.github && (
                          <a
                            href={project.links.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition"
                          >
                            GitHub
                          </a>
                        )}
                        {project.links.loom && (
                          <a
                            href={project.links.loom}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition"
                          >
                            Loom
                          </a>
                        )}
                        {project.links.oneDrive && (
                          <a
                            href={project.links.oneDrive}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition"
                          >
                            OneDrive
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Updates Tab */}
        {activeTab === 'updates' && (
          <div className="space-y-6">
            {/* Submit Update Form */}
            <div className="bg-gray-700 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Submit Daily Update</h3>
              <form onSubmit={handleSubmitUpdate} className="space-y-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-2">Project</label>
                  <select
                    value={updateForm.projectId}
                    onChange={(e) => setUpdateForm({ ...updateForm, projectId: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-orange-500 transition"
                  >
                    <option value="">Select a project</option>
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-2">What did you work on today?</label>
                  <textarea
                    value={updateForm.summary}
                    onChange={(e) => setUpdateForm({ ...updateForm, summary: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-orange-500 transition resize-none"
                    rows={4}
                    placeholder="Describe your work today..."
                  ></textarea>
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-2">What's your plan for tomorrow? (Optional)</label>
                  <textarea
                    value={updateForm.nextPlan}
                    onChange={(e) => setUpdateForm({ ...updateForm, nextPlan: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-orange-500 transition resize-none"
                    rows={4}
                    placeholder="Describe what you plan to work on tomorrow..."
                  ></textarea>
                </div>
                <div>
                  <label className="block text-gray-300 font-semibold mb-2">Loom Video Link (Optional)</label>
                  <input
                    type="url"
                    value={updateForm.loomLink}
                    onChange={(e) => setUpdateForm({ ...updateForm, loomLink: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-2 text-white focus:outline-none focus:border-orange-500 transition"
                    placeholder="https://loom.com/..."
                  />
                </div>
                <button
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-6 rounded transition"
                >
                  Submit Update
                </button>
              </form>
            </div>

            {/* Updates List */}
            <div className="bg-gray-700 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Recent Updates</h3>
              {updates.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No updates submitted yet</p>
              ) : (
                <div className="space-y-4">
                  {updates.map((update: any) => (
                    <button
                      key={update._id}
                      onClick={() => setSelectedUpdate(update)}
                      className="w-full text-left bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition border border-gray-600 hover:border-orange-500"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-semibold">{update.projectId?.title || 'Project'}</p>
                          <p className="text-gray-400 text-sm mt-1">{update.summary}</p>
                          <p className="text-gray-500 text-xs mt-2">
                            {new Date(update.date).toLocaleDateString()}
                          </p>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Update Details Modal */}
      {selectedUpdate && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedUpdate(null)}
        >
          <div
            className="bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto border border-gray-600"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gray-900 border-b border-gray-600 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">
                {selectedUpdate.projectId?.title || 'Update Details'}
              </h2>
              <button
                onClick={() => setSelectedUpdate(null)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <p className="text-gray-400 text-sm">Date</p>
                <p className="text-white font-semibold">
                  {new Date(selectedUpdate.date).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-2">Summary</p>
                <p className="text-gray-300">{selectedUpdate.summary}</p>
              </div>

              {selectedUpdate.checklist && selectedUpdate.checklist.length > 0 && (
                <div>
                  <p className="text-gray-400 text-sm mb-3">Checklist</p>
                  <div className="space-y-2">
                    {selectedUpdate.checklist.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 text-gray-300">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          disabled
                          className="w-4 h-4 rounded"
                        />
                        <span>{item.task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedUpdate.nextPlan && (
                <div>
                  <p className="text-gray-400 text-sm mb-2">Next Plan</p>
                  <p className="text-gray-300">{selectedUpdate.nextPlan}</p>
                </div>
              )}

              {selectedUpdate.loomLink && (
                <div>
                  <p className="text-gray-400 text-sm mb-2">Loom Video</p>
                  <a
                    href={selectedUpdate.loomLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orange-400 hover:text-orange-300"
                  >
                    View Video
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
