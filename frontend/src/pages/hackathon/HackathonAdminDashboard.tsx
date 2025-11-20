import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { LogOut, Trophy, Users, TrendingUp, Zap, Plus, Trash2, AlertCircle } from 'lucide-react';
import { getToken } from '../../utils/auth';
import { API_BASE_URL } from '../../config/api';
import { useNavigate } from 'react-router-dom';

interface Player {
  userId: string;
  name: string;
  email: string;
  score: number;
  bonusMultiplier: number;
  completedInOneDay: boolean;
  joinedAt: string;
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

interface HackathonEvent {
  _id: string;
  name: string;
  description: string;
  theme: string;
  status: string;
  currentPlayers: number;
  maxPlayers: number;
  players: Player[];
  startDate: string;
  endDate: string;
  tasks: Task[];
}

interface HackathonUpdate {
  _id: string;
  playerName: string;
  playerId: string;
  summary: string;
  projectManagement: Array<{ item: string; completed: boolean }>;
  dailyUpdate: Array<{ item: string; completed: boolean }>;
  hoursWorked: number;
  date: string;
  loomVideoLink?: string;
  nextPlan?: string;
}

export default function HackathonAdminDashboard() {
  const [hackathons, setHackathons] = useState<HackathonEvent[]>([]);
  const [selectedHackathon, setSelectedHackathon] = useState<HackathonEvent | null>(null);
  const [updates, setUpdates] = useState<HackathonUpdate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium' as const,
  });

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
      setHackathons(response.data);
      if (response.data.length > 0) {
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
        `${API_BASE_URL}/hackathon/${selectedHackathon._id}/updates`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setUpdates(response.data);
    } catch (error) {
      console.error('Error fetching updates:', error);
    }
  };

  const fetchTasks = async () => {
    if (!selectedHackathon) return;
    try {
      const response = await axios.get(
        `${API_BASE_URL}/hackathon/${selectedHackathon._id}/tasks`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setTasks(response.data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHackathon || !formData.title || selectedPlayers.length === 0) {
      toast.error('Please fill all fields and select at least one player');
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/hackathon/${selectedHackathon._id}/task`,
        {
          title: formData.title,
          description: formData.description,
          assignedToIds: selectedPlayers,
          dueDate: formData.dueDate || undefined,
          priority: formData.priority,
        },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      toast.success('Task assigned successfully! ✅');
      setFormData({ title: '', description: '', dueDate: '', priority: 'medium' });
      setSelectedPlayers([]);
      setShowTaskForm(false);
      fetchHackathons();
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const handleDeleteTask = async (taskId?: string) => {
    if (!selectedHackathon || !taskId) return;

    try {
      await axios.delete(
        `${API_BASE_URL}/hackathon/${selectedHackathon._id}/task/${taskId}`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      toast.success('Task deleted');
      fetchTasks();
      fetchHackathons();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  };

  const togglePlayerSelection = (userId: string) => {
    setSelectedPlayers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const updateBonus = async (playerId: string, bonusType: 'scored' | 'oneday') => {
    if (!selectedHackathon) return;

    try {
      const player = selectedHackathon.players.find(p => p.userId === playerId);
      if (!player) return;

      let newMultiplier = player.bonusMultiplier;
      let completedInOneDay = player.completedInOneDay;

      if (bonusType === 'scored' && newMultiplier !== 2) {
        newMultiplier = 2;
      } else if (bonusType === 'oneday') {
        completedInOneDay = !completedInOneDay;
        if (completedInOneDay) newMultiplier = 2;
      }

      await axios.put(
        `${API_BASE_URL}/hackathon/${selectedHackathon._id}/player/${playerId}/bonus`,
        { bonusMultiplier: newMultiplier, completedInOneDay },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );

      toast.success('Bonus updated!');
      fetchHackathons();
    } catch (error) {
      console.error('Error updating bonus:', error);
      toast.error('Failed to update bonus');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('hackathonRole');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Trophy className="w-8 h-8" />
              Hackathon Admin Dashboard
            </h1>
            <p className="text-purple-100 mt-1">Manage tasks, track progress, and award bonuses</p>
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

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Hackathon Selection */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Hackathon</h2>
          {loading ? (
            <div className="animate-pulse flex gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 w-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hackathons.map(hackathon => (
                <div
                  key={hackathon._id}
                  onClick={() => setSelectedHackathon(hackathon)}
                  className={`p-6 rounded-xl cursor-pointer transition-all border-2 ${
                    selectedHackathon?._id === hackathon._id
                      ? 'border-purple-600 bg-purple-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-purple-300'
                  }`}
                >
                  <h3 className="font-bold text-lg text-gray-800">{hackathon.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{hackathon.theme}</p>
                  <div className="flex items-center justify-between mt-3 text-sm">
                    <span className="flex items-center gap-1 font-semibold text-gray-700">
                      <Users className="w-4 h-4" />
                      {hackathon.currentPlayers}/{hackathon.maxPlayers}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      hackathon.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {hackathon.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedHackathon && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Players List */}
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Players ({selectedHackathon.currentPlayers})
                </h2>
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {selectedHackathon.players.map(player => (
                    <div
                      key={player.userId}
                      onClick={() => setSelectedPlayer(player)}
                      className={`p-3 rounded-lg cursor-pointer transition-all border-2 ${
                        selectedPlayer?.userId === player.userId
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 bg-gray-50 hover:border-purple-300'
                      }`}
                    >
                      <h3 className="font-semibold text-gray-800 text-sm">{player.name}</h3>
                      <p className="text-xs text-gray-600">{player.email}</p>
                      <div className="mt-2 space-y-0.5">
                        <div className="flex justify-between text-xs">
                          <span>Score:</span>
                          <span className="font-bold text-purple-600">{player.score || 0}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Multiplier:</span>
                          <span className="font-bold text-blue-600">{player.bonusMultiplier}×</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Tasks Section */}
              <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                    Task Management
                  </h2>
                  {!showTaskForm && (
                    <button
                      onClick={() => setShowTaskForm(true)}
                      className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2.5 rounded-lg transition-all font-semibold"
                    >
                      <Plus className="w-5 h-5" />
                      Assign Task
                    </button>
                  )}
                </div>

                {/* Create Task Form */}
                {showTaskForm && (
                  <form onSubmit={handleCreateTask} className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 mb-6 border-2 border-gray-200 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Task Title *</label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., Implement Login Feature"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Detailed task description..."
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Due Date</label>
                        <input
                          type="date"
                          value={formData.dueDate}
                          onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                        <select
                          value={formData.priority}
                          onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Assign to Players *</label>
                      <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3 bg-white">
                        {selectedHackathon.players.map(player => (
                          <label key={player.userId} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input
                              type="checkbox"
                              checked={selectedPlayers.includes(player.userId)}
                              onChange={() => togglePlayerSelection(player.userId)}
                              className="w-5 h-5 rounded"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-800">{player.name}</p>
                              <p className="text-xs text-gray-600">{player.email}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                      {selectedPlayers.length > 0 && (
                        <p className="text-xs text-purple-600 font-semibold mt-2">{selectedPlayers.length} player(s) selected</p>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-2.5 rounded-lg transition-all"
                      >
                        Assign Task
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowTaskForm(false);
                          setSelectedPlayers([]);
                          setFormData({ title: '', description: '', dueDate: '', priority: 'medium' });
                        }}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2.5 rounded-lg transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Tasks List */}
                {tasks.length > 0 ? (
                  <div className="space-y-3">
                    {tasks.map(task => (
                      <div key={task._id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-gray-900">{task.title}</h3>
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                task.priority === 'high' ? 'bg-red-100 text-red-800' :
                                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {task.priority}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteTask(task._id)}
                            className="text-red-600 hover:text-red-700 ml-2"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-600 mt-3">
                          <span>👥 {task.assignedTo.length} player(s) assigned</span>
                          {task.dueDate && (
                            <span>📅 Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">No tasks assigned yet. Create one to get started!</p>
                )}
              </div>

              {/* Player Details */}
              {selectedPlayer && (
                <>
                  {/* Player Card */}
                  <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-600">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{selectedPlayer.name}</h2>
                        <p className="text-gray-600">{selectedPlayer.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Final Score</p>
                        <p className="text-4xl font-bold text-purple-600">
                          {selectedPlayer.score || 0} × {selectedPlayer.bonusMultiplier}
                        </p>
                      </div>
                    </div>

                    {/* Bonus Controls */}
                    <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
                      <button
                        onClick={() => updateBonus(selectedPlayer.userId, 'scored')}
                        className={`p-4 rounded-lg border-2 transition-all font-semibold flex items-center justify-center gap-2 ${
                          selectedPlayer.bonusMultiplier === 2
                            ? 'bg-yellow-50 border-yellow-500 text-yellow-700'
                            : 'bg-gray-50 border-gray-300 text-gray-700 hover:border-yellow-300'
                        }`}
                      >
                        <Trophy className="w-5 h-5" />
                        Score 2× Bonus
                      </button>
                      <button
                        onClick={() => updateBonus(selectedPlayer.userId, 'oneday')}
                        className={`p-4 rounded-lg border-2 transition-all font-semibold flex items-center justify-center gap-2 ${
                          selectedPlayer.completedInOneDay
                            ? 'bg-green-50 border-green-500 text-green-700'
                            : 'bg-gray-50 border-gray-300 text-gray-700 hover:border-green-300'
                        }`}
                      >
                        <Zap className="w-5 h-5" />
                        One Day 2× Bonus
                      </button>
                    </div>

                    {/* Prize Calculation */}
                    <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200">
                      <p className="text-sm font-semibold text-gray-800">
                        <strong>Prize Calculation:</strong> {selectedPlayer.score} × {selectedPlayer.bonusMultiplier} = <span className="text-purple-700 font-bold text-lg">{selectedPlayer.score * selectedPlayer.bonusMultiplier}</span>
                      </p>
                    </div>
                  </div>

                  {/* Player Updates */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Player's Daily Updates
                    </h3>
                    <div className="space-y-4">
                      {updates
                        .filter(u => u.playerId === selectedPlayer.userId)
                        .slice(0, 5)
                        .map(update => (
                          <div key={update._id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-gray-900 text-sm">{update.summary}</h4>
                              <span className="text-xs text-gray-500">
                                {new Date(update.date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex gap-3 text-xs text-gray-600">
                              <span>⏱️ {update.hoursWorked}h</span>
                              {update.loomVideoLink && (
                                <a href={update.loomVideoLink} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                                  📹 Video
                                </a>
                              )}
                            </div>
                            <div className="mt-3 text-xs">
                              <p className="font-semibold text-gray-700 mb-1">Daily Tasks Completed:</p>
                              <p className="text-gray-600">
                                {update.dailyUpdate?.filter(t => t.completed).length || 0}/{update.dailyUpdate?.length || 0}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
