import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { LogOut, Trophy, FileText, Plus, RefreshCw, AlertCircle } from 'lucide-react';
import { getToken, getUser } from '../../utils/auth';
import { API_BASE_URL } from '../../config/api';
import { useNavigate } from 'react-router-dom';

interface HackathonEvent {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  theme: string;
  status: 'active' | 'upcoming' | 'completed';
  currentPlayers: number;
  maxPlayers: number;
}

interface HackathonUpdate {
  _id: string;
  summary: string;
  projectManagement: Array<{ item: string; completed: boolean }>;
  dailyUpdate: Array<{ item: string; completed: boolean }>;
  nextPlan: string;
  hoursWorked: number;
  date: string;
  loomVideoLink?: string;
  createdAt?: string;
}

interface Task {
  _id?: string;
  title: string;
  description: string;
  assignedTo: string[];
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt?: string;
}

export default function HackathonPlayerDashboard() {
  const [hackathons, setHackathons] = useState<HackathonEvent[]>([]);
  const [selectedHackathon, setSelectedHackathon] = useState<HackathonEvent | null>(null);
  const [updates, setUpdates] = useState<HackathonUpdate[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState<HackathonUpdate | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  // Helper function to check if update is editable (within 24 hours)
  const isUpdateEditable = (createdAt: string | undefined): boolean => {
    if (!createdAt) return false;
    const created = new Date(createdAt);
    const now = new Date();
    const hoursElapsed = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    return hoursElapsed < 24;
  };

  // Helper function to get hours remaining for editing
  const getHoursRemaining = (createdAt: string | undefined): number => {
    if (!createdAt) return 0;
    const created = new Date(createdAt);
    const now = new Date();
    const hoursElapsed = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    return Math.max(0, Math.ceil(24 - hoursElapsed));
  };
  const [formData, setFormData] = useState({
    summary: '',
    nextPlan: '',
    hoursWorked: 0,
    loomVideoLink: '',
    projectManagement: [
      { item: 'Planned daily tasks', completed: false },
      { item: 'Set clear objectives', completed: false },
      { item: 'Identified blockers', completed: false },
      { item: 'Updated team on progress', completed: false },
      { item: 'Code review completed', completed: false },
      { item: 'Documentation updated', completed: false },
      { item: 'Testing done', completed: false },
      { item: 'Commits pushed to repository', completed: false },
    ],
    dailyUpdate: [
      { item: 'Attended morning standup', completed: false },
      { item: 'Worked on assigned features', completed: false },
      { item: 'Fixed bugs/issues', completed: false },
      { item: 'Collaborated with team members', completed: false },
      { item: 'Attended code review session', completed: false },
      { item: 'Updated progress documentation', completed: false },
      { item: 'Communicated blockers early', completed: false },
      { item: 'Completed daily tasks', completed: false },
      { item: 'Prepared for next day', completed: false },
      { item: 'Worked efficiently without distractions', completed: false },
    ],
  });

  const user = getUser();
  const navigate = useNavigate();

  useEffect(() => {
    fetchHackathons();
  }, []);

  useEffect(() => {
    if (selectedHackathon) {
      fetchUpdates();
      fetchTasks();
    }
  }, [selectedHackathon]);

  const fetchHackathons = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/hackathon`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      // Show all hackathons, not just active ones
      setHackathons(response.data);
      if (response.data.length > 0 && !selectedHackathon) {
        setSelectedHackathon(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching hackathons:', error);
      toast.error('Failed to fetch hackathons');
    } finally {
      setLoading(false);
    }
  };

  const fetchUpdates = async () => {
    if (!selectedHackathon) return;
    try {
      const response = await axios.get(
        `${API_BASE_URL}/hackathon/${selectedHackathon._id}/player/${user?._id}/updates`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setUpdates(response.data);
    } catch (error) {
      console.error('Error fetching updates:', error);
    }
  };

  const fetchTasks = async () => {
    if (!selectedHackathon || !user?._id) {
      console.log('Cannot fetch tasks: selectedHackathon or user missing');
      return;
    }
    try {
      console.log(`Fetching tasks for hackathon ${selectedHackathon._id} and user ${user._id}`);
      const response = await axios.get(
        `${API_BASE_URL}/hackathon/${selectedHackathon._id}/player/${user._id}/tasks`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      console.log('Tasks fetched:', response.data);
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to fetch tasks');
    }
  };

  const handleCreateUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHackathon || !formData.summary) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/hackathon/${selectedHackathon._id}/update`,
        {
          hackathonId: selectedHackathon._id,
          playerId: user?._id,
          playerName: user?.email || user?.name,
          ...formData,
          date: new Date(),
        },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      toast.success('Update submitted successfully! 🎉');
      // Reset form
      setFormData({
        summary: '',
        nextPlan: '',
        hoursWorked: 0,
        loomVideoLink: '',
        projectManagement: [
          { item: 'Planned daily tasks', completed: false },
          { item: 'Set clear objectives', completed: false },
          { item: 'Identified blockers', completed: false },
          { item: 'Updated team on progress', completed: false },
          { item: 'Code review completed', completed: false },
          { item: 'Documentation updated', completed: false },
          { item: 'Testing done', completed: false },
          { item: 'Commits pushed to repository', completed: false },
        ],
        dailyUpdate: [
          { item: 'Attended morning standup', completed: false },
          { item: 'Worked on assigned features', completed: false },
          { item: 'Fixed bugs/issues', completed: false },
          { item: 'Collaborated with team members', completed: false },
          { item: 'Attended code review session', completed: false },
          { item: 'Updated progress documentation', completed: false },
          { item: 'Communicated blockers early', completed: false },
          { item: 'Completed daily tasks', completed: false },
          { item: 'Prepared for next day', completed: false },
          { item: 'Worked efficiently without distractions', completed: false },
        ],
      });
      setShowUpdateForm(false);
      fetchUpdates();
    } catch (error) {
      console.error('Error submitting update:', error);
      toast.error('Failed to submit update');
    }
  };

  const handleEditClick = () => {
    if (!selectedUpdate || !selectedHackathon) return;
    setEditData(JSON.parse(JSON.stringify(selectedUpdate)));
    setIsEditMode(true);
  };

  const handleSaveUpdate = async () => {
    if (!selectedUpdate || !selectedHackathon || !editData) return;
    try {
      await axios.put(
        `${API_BASE_URL}/hackathon/${selectedHackathon._id}/update/${selectedUpdate._id}`,
        editData,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      toast.success('Update saved successfully!');
      setIsEditMode(false);
      setEditData(null);
      fetchUpdates();
    } catch (error: any) {
      console.error('Failed to save update:', error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Failed to save update. Please try again.');
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Trophy className="w-8 h-8" />
              Hackathon Player Dashboard
            </h1>
            <p className="text-yellow-100 mt-1">Welcome, {user?.email}! 🚀</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2.5 rounded-lg transition-all font-semibold"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Hackathon Selection */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Select Hackathon</h2>
            <button
              onClick={() => {
                fetchHackathons();
                if (selectedHackathon) {
                  fetchUpdates();
                  fetchTasks();
                }
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-24 bg-gray-200 rounded-lg"></div>
            </div>
          ) : hackathons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hackathons.map(hackathon => (
                <div
                  key={hackathon._id}
                  onClick={() => setSelectedHackathon(hackathon)}
                  className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                    selectedHackathon?._id === hackathon._id
                      ? 'border-yellow-600 bg-yellow-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-yellow-300 hover:shadow-md'
                  }`}
                >
                  <h3 className="font-bold text-gray-800 text-lg mb-2">{hackathon.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{hackathon.theme}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>🏆 {hackathon.currentPlayers}/{hackathon.maxPlayers} Players</span>
                    <span className={`px-2 py-1 rounded-full font-semibold ${
                      hackathon.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {hackathon.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center py-8">No hackathons available</p>
          )}
        </div>

        {selectedHackathon && (
          <>
            {/* Hackathon Info Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{selectedHackathon.name}</h2>
                  <p className="text-gray-600 mt-2">{selectedHackathon.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-4xl font-bold text-yellow-600 mb-2">🏆</p>
                  <p className="text-sm text-gray-600">Theme: {selectedHackathon.theme}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200">
                  <p className="text-xs text-gray-600 font-semibold mb-1">Start Date</p>
                  <p className="text-lg font-bold text-yellow-700">{new Date(selectedHackathon.startDate).toLocaleDateString()}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200">
                  <p className="text-xs text-gray-600 font-semibold mb-1">End Date</p>
                  <p className="text-lg font-bold text-orange-700">{new Date(selectedHackathon.endDate).toLocaleDateString()}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-xs text-gray-600 font-semibold mb-1">Players</p>
                  <p className="text-lg font-bold text-blue-700">{selectedHackathon.currentPlayers}/{selectedHackathon.maxPlayers}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                  <p className="text-xs text-gray-600 font-semibold mb-1">Status</p>
                  <p className="text-lg font-bold text-green-700 capitalize">{selectedHackathon.status}</p>
                </div>
              </div>
            </div>

            {/* Assigned Tasks Section */}
            {tasks.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Assigned Tasks</h3>
                    <p className="text-sm text-gray-600">{tasks.length} task(s) from admin</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {tasks.map((task, idx) => (
                    <div key={task._id || idx} className="bg-white rounded-xl p-4 border-2 border-blue-200 hover:border-blue-400 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-900 text-lg">{task.title}</h4>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              task.priority === 'high' ? 'bg-red-100 text-red-800' :
                              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {task.priority.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mt-2">{task.description}</p>
                        </div>
                      </div>
                      {task.dueDate && (
                        <p className="text-xs text-gray-600 mt-2">📅 Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Daily Update Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Daily Update</h3>
                  <p className="text-sm text-gray-600">Share your progress today</p>
                </div>
              </div>

              {!showUpdateForm ? (
                <button
                  onClick={() => setShowUpdateForm(true)}
                  className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] duration-200 flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Post Daily Update
                </button>
              ) : (
                <form onSubmit={handleCreateUpdate} className="space-y-6">
                  {/* Summary */}
                  <div>
                    <label className="block text-gray-700 font-bold mb-2 text-sm">What did you accomplish today? *</label>
                    <textarea
                      required
                      value={formData.summary}
                      onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                      placeholder="Describe what you've accomplished, features built, bugs fixed, etc."
                      rows={5}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 resize-none transition-all"
                    />
                  </div>

                  {/* Next Plan */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">What's your plan for tomorrow? (Optional)</label>
                    <textarea
                      value={formData.nextPlan}
                      onChange={(e) => setFormData({ ...formData, nextPlan: e.target.value })}
                      placeholder="Describe what you plan to work on tomorrow..."
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-500 resize-none"
                    />
                  </div>

                  {/* Hours Worked */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">No. of hours worked today</label>
                    <input
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      value={formData.hoursWorked}
                      onChange={(e) => setFormData({ ...formData, hoursWorked: parseFloat(e.target.value) })}
                      placeholder="Enter hours (e.g., 8, 8.5)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-500"
                    />
                  </div>

                  {/* PROJECT MANAGEMENT Checklist */}
                  <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
                    <h4 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                      📊 PROJECT MANAGEMENT
                    </h4>
                    <div className="space-y-3">
                      {formData.projectManagement.map((item, idx) => (
                        <label key={idx} className="flex items-start gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={(e) => {
                              const newProjectMgmt = [...formData.projectManagement];
                              newProjectMgmt[idx].completed = e.target.checked;
                              setFormData({ ...formData, projectManagement: newProjectMgmt });
                            }}
                            className="w-5 h-5 mt-0.5 rounded border-2 border-purple-400 text-purple-600 cursor-pointer"
                          />
                          <span className={`text-sm ${item.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                            {item.item}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* DAILY UPDATE Checklist */}
                  <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                    <h4 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                      📋 DAILY UPDATE
                    </h4>
                    <div className="space-y-3">
                      {formData.dailyUpdate.map((item, idx) => (
                        <label key={idx} className="flex items-start gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={(e) => {
                              const newDailyUpdate = [...formData.dailyUpdate];
                              newDailyUpdate[idx].completed = e.target.checked;
                              setFormData({ ...formData, dailyUpdate: newDailyUpdate });
                            }}
                            className="w-5 h-5 mt-0.5 rounded border-2 border-blue-400 text-blue-600 cursor-pointer"
                          />
                          <span className={`text-sm ${item.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                            {item.item}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Loom Video Link */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Loom Video Link (Optional)</label>
                    <input
                      type="url"
                      value={formData.loomVideoLink}
                      onChange={(e) => setFormData({ ...formData, loomVideoLink: e.target.value })}
                      placeholder="https://loom.com/share/... (paste your Loom video link here)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-yellow-500"
                    />
                    <p className="text-gray-500 text-sm mt-1">💡 Tip: Record a quick video of your work using Loom and paste the link here</p>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] duration-200"
                    >
                      📤 Post Daily Update
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUpdateForm(false)}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Previous Updates */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-8 bg-gradient-to-b from-yellow-600 to-orange-600 rounded-full"></div>
                  <h3 className="text-2xl font-bold text-gray-900">Your Daily Updates</h3>
                </div>
                <button
                  onClick={fetchUpdates}
                  className="flex items-center gap-2 text-yellow-600 hover:text-yellow-700 font-semibold transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>

              {updates.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg">No updates posted yet. Post your first daily update above!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {updates.map(update => (
                    <div
                      key={update._id}
                      onClick={() => setSelectedUpdate(update)}
                      className="border-2 border-gray-200 rounded-xl p-5 bg-gradient-to-br from-gray-50 to-white hover:bg-gradient-to-br hover:from-yellow-50 hover:to-orange-50 cursor-pointer transition-all hover:shadow-lg hover:border-yellow-300 hover:scale-[1.01]"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-gray-600 text-sm font-semibold">
                            {new Date(update.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500">⏱️ {update.hoursWorked}h</span>
                      </div>
                      <p className="text-gray-900 font-semibold mb-3 line-clamp-2">{update.summary}</p>
                      {update.loomVideoLink && (
                        <a
                          href={update.loomVideoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-yellow-600 hover:text-yellow-700 font-semibold text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          🎥 Watch Video
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Update Details Modal */}
      {selectedUpdate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-yellow-600 to-orange-600 px-6 py-5 flex justify-between items-center sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-bold text-white">Update Details</h3>
                <p className="text-yellow-100 text-sm">
                  {new Date(selectedUpdate.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <button
                onClick={() => setSelectedUpdate(null)}
                className="text-white hover:text-gray-200 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-4 space-y-4">
              {/* Edit Mode */}
              {isEditMode && editData ? (
                <div>
                  {/* Summary Edit */}
                  <div className="mb-4">
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Summary</label>
                    <textarea
                      value={editData.summary || ''}
                      onChange={(e) => setEditData({...editData, summary: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                      rows={4}
                    />
                  </div>

                  {/* Hours Edit */}
                  <div className="mb-4">
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Hours Worked</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={editData.hoursWorked || 0}
                      onChange={(e) => setEditData({...editData, hoursWorked: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>

                  {/* Next Plan Edit */}
                  <div className="mb-4">
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Next Plan</label>
                    <textarea
                      value={editData.nextPlan || ''}
                      onChange={(e) => setEditData({...editData, nextPlan: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                      rows={3}
                    />
                  </div>

                  {/* Loom Video Link Edit */}
                  <div className="mb-4">
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Loom Video Link</label>
                    <input
                      type="url"
                      value={editData.loomVideoLink || ''}
                      onChange={(e) => setEditData({...editData, loomVideoLink: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="https://loom.com/..."
                    />
                  </div>

                  {/* PROJECT MANAGEMENT Checklist Edit */}
                  {editData.projectManagement && editData.projectManagement.length > 0 && (
                    <div className="border-2 border-purple-200 rounded-lg p-3 bg-purple-50">
                      <h4 className="text-sm font-bold text-purple-900 mb-3 flex items-center gap-2">
                        📊 PROJECT MANAGEMENT
                      </h4>
                      <div className="space-y-2">
                        {editData.projectManagement.map((item: any, idx: number) => (
                          <label key={idx} className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.completed}
                              onChange={(e) => {
                                const newChecklist = [...editData.projectManagement];
                                newChecklist[idx].completed = e.target.checked;
                                setEditData({...editData, projectManagement: newChecklist});
                              }}
                              className="w-4 h-4 mt-0.5"
                            />
                            <span className={`text-xs ${item.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                              {item.item}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* DAILY UPDATE Checklist Edit */}
                  {editData.dailyUpdate && editData.dailyUpdate.length > 0 && (
                    <div className="border-2 border-blue-200 rounded-lg p-3 bg-blue-50">
                      <h4 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                        📋 DAILY UPDATE
                      </h4>
                      <div className="space-y-2">
                        {editData.dailyUpdate.map((item: any, idx: number) => (
                          <label key={idx} className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.completed}
                              onChange={(e) => {
                                const newChecklist = [...editData.dailyUpdate];
                                newChecklist[idx].completed = e.target.checked;
                                setEditData({...editData, dailyUpdate: newChecklist});
                              }}
                              className="w-4 h-4 mt-0.5"
                            />
                            <span className={`text-xs ${item.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                              {item.item}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* View Mode */
                <>
              {/* Summary */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Summary</h4>
                <p className="text-gray-800 whitespace-pre-wrap">{selectedUpdate.summary}</p>
              </div>

              {/* Hours Worked */}
              {selectedUpdate.hoursWorked > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Hours Worked</h4>
                  <p className="text-lg font-bold text-yellow-600">{selectedUpdate.hoursWorked} hours</p>
                </div>
              )}

              {/* PROJECT MANAGEMENT Checklist */}
              {selectedUpdate.projectManagement && selectedUpdate.projectManagement.length > 0 && (
                <div className="border-2 border-purple-200 rounded-lg p-3 bg-purple-50">
                  <h4 className="text-sm font-bold text-purple-900 mb-3 flex items-center gap-2">
                    📊 PROJECT MANAGEMENT
                  </h4>
                  <div className="space-y-2">
                    {selectedUpdate.projectManagement.map((item, idx) => (
                      <label key={idx} className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          disabled
                          className="w-4 h-4 mt-0.5"
                        />
                        <span className={`text-xs ${item.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                          {item.item}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* DAILY UPDATE Checklist */}
              {selectedUpdate.dailyUpdate && selectedUpdate.dailyUpdate.length > 0 && (
                <div className="border-2 border-blue-200 rounded-lg p-3 bg-blue-50">
                  <h4 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                    📋 DAILY UPDATE
                  </h4>
                  <div className="space-y-2">
                    {selectedUpdate.dailyUpdate.map((item, idx) => (
                      <label key={idx} className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          disabled
                          className="w-4 h-4 mt-0.5"
                        />
                        <span className={`text-xs ${item.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                          {item.item}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Plan */}
              {selectedUpdate.nextPlan && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Next Plan</h4>
                  <p className="text-gray-800 whitespace-pre-wrap">{selectedUpdate.nextPlan}</p>
                </div>
              )}

              {/* Loom Video Link */}
              {selectedUpdate.loomVideoLink && (
                <div>
                  <a
                    href={selectedUpdate.loomVideoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition font-semibold"
                  >
                    🎥 Watch Loom Video
                  </a>
                </div>
              )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-100 px-6 py-4 border-t flex justify-between items-center">
              <div>
                {isUpdateEditable(selectedUpdate.createdAt) ? (
                  <span className="text-xs text-green-600 font-semibold">
                    ✓ Editable ({getHoursRemaining(selectedUpdate.createdAt)} hours remaining)
                  </span>
                ) : (
                  <span className="text-xs text-red-600 font-semibold">
                    ✗ Edit window expired (created {Math.floor((new Date().getTime() - new Date(selectedUpdate.createdAt!).getTime()) / (1000 * 60 * 60))} hours ago)
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {isEditMode ? (
                  <>
                    <button
                      onClick={handleSaveUpdate}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-semibold text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditMode(false);
                        setEditData(null);
                      }}
                      className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg transition font-semibold text-sm"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    {isUpdateEditable(selectedUpdate.createdAt) && (
                      <button
                        onClick={handleEditClick}
                        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition font-semibold text-sm"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedUpdate(null)}
                      className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition font-semibold"
                    >
                      Close
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
