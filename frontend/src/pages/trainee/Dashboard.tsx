import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, GraduationCap, CheckCircle, Clock, AlertCircle, RefreshCw, Calendar, Target, BookOpen } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { getToken } from '../../utils/auth';
import { API_BASE_URL } from '../../config/api';

export default function TraineeDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [trainingTasks, setTrainingTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [updateForm, setUpdateForm] = useState({
    status: '',
    progress: 0,
  });

  useEffect(() => {
    fetchTrainingTasks();
  }, []);

  const fetchTrainingTasks = async () => {
    try {
      const token = getToken();
      if (!token) {
        console.error('No auth token found');
        toast.error('Please log in again');
        return;
      }
      const response = await axios.get(`${API_BASE_URL}/training/my-trainings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrainingTasks(response.data);
    } catch (error: any) {
      console.error('Failed to fetch training tasks:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again');
      } else {
        toast.error('Failed to load training tasks');
      }
    }
  };

  const handleUpdateTask = async (taskId: string) => {
    if (updateForm.progress < 0 || updateForm.progress > 100) {
      toast.error('Progress must be between 0 and 100');
      return;
    }

    setLoading(true);
    try {
      const token = getToken();
      await axios.put(
        `${API_BASE_URL}/training/${taskId}`,
        updateForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSelectedTask(null);
      fetchTrainingTasks();
      toast.success('Training progress updated successfully!');
    } catch (error) {
      console.error('Failed to update training task:', error);
      toast.error('Failed to update progress');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 75) return 'from-green-500 to-emerald-500';
    if (progress >= 50) return 'from-blue-500 to-indigo-500';
    if (progress >= 25) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-pink-500';
  };

  const completedTasks = trainingTasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = trainingTasks.filter(t => t.status === 'in-progress').length;
  const pendingTasks = trainingTasks.filter(t => t.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-red-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-600 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Training Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome back, {user?.firstName} {user?.lastName}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Total Tasks</h3>
              <BookOpen className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{trainingTasks.length}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Completed</h3>
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-600">{completedTasks}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">In Progress</h3>
              <Clock className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-3xl font-bold text-yellow-600">{inProgressTasks}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">Pending</h3>
              <AlertCircle className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-3xl font-bold text-gray-600">{pendingTasks}</p>
          </div>
        </div>

        {/* Training Tasks */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-pink-50 to-rose-50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">My Training Tasks</h2>
            <button
              onClick={fetchTrainingTasks}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg transition-colors border border-gray-200"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm font-medium">Refresh</span>
            </button>
          </div>

          <div className="p-6">
            {trainingTasks.length === 0 ? (
              <div className="text-center py-12">
                <GraduationCap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 text-lg">No training tasks assigned yet</p>
                <p className="text-gray-400 text-sm mt-2">Check back later for new assignments</p>
              </div>
            ) : (
              <div className="space-y-4">
                {trainingTasks.map((task) => (
                  <div
                    key={task._id}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{task.title}</h3>
                        <p className="text-gray-600 mb-4">{task.description}</p>
                        
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              Deadline: {new Date(task.deadline).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              Last Updated: {new Date(task.lastUpdated).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {task.resources && (
                          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                              <BookOpen className="w-4 h-4" />
                              Resources
                            </h4>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">{task.resources}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-4">
                        <span className={`px-4 py-1.5 rounded-full text-xs font-semibold border ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm font-bold text-gray-900">{task.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`bg-gradient-to-r ${getProgressColor(task.progress)} h-3 rounded-full transition-all duration-500`}
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Update Button */}
                    <button
                      onClick={() => {
                        setSelectedTask(task);
                        setUpdateForm({
                          status: task.status,
                          progress: task.progress,
                        });
                      }}
                      className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <Target className="w-4 h-4" />
                      Update Progress
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Update Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-pink-50 to-rose-50">
              <h3 className="text-xl font-bold text-gray-900">Update Progress</h3>
              <p className="text-sm text-gray-600 mt-1">{selectedTask.title}</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={updateForm.status}
                  onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                  className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-pink-500 focus:bg-white transition-all"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Progress: {updateForm.progress}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={updateForm.progress}
                  onChange={(e) => setUpdateForm({ ...updateForm, progress: parseInt(e.target.value) })}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
                <div
                  className={`bg-gradient-to-r ${getProgressColor(updateForm.progress)} h-4 rounded-full transition-all duration-300`}
                  style={{ width: `${updateForm.progress}%` }}
                />
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setSelectedTask(null)}
                className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdateTask(selectedTask._id)}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-xl transition font-medium disabled:opacity-50 shadow-md hover:shadow-lg"
              >
                {loading ? 'Updating...' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
