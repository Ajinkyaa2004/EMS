import { useAuth } from '../../context/AuthContext';
import { LogOut, Briefcase, FileText, CheckSquare, Menu, X, ChevronLeft, ChevronRight, BarChart3, Zap, Video, Calendar, Clock, Users, Timer, RefreshCw, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import AttendanceCard from '../../components/AttendanceCard';
import PointsSummary from '../../components/PointsSummary';
import PointsLeaderboard from '../../components/PointsLeaderboard';
import { useRealtimeUpdates } from '../../hooks/useRealtimeUpdates';
import { EVENTS, eventEmitter } from '../../utils/eventEmitter';
import { getToken } from '../../utils/auth';
import { API_BASE_URL } from '../../config/api';

export default function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('attendance');
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({
    summary: '',
    loomVideoLink: '',
    projectId: '',
    nextPlan: '',
    hoursAttended: 0,
    projectManagement: [
      { item: 'Asked senior team for new Project', completed: false },
      { item: 'Did you inform you are not able to do the project?', completed: false },
      { item: 'Did you make sure project was given to someone else?', completed: false },
      { item: 'Did you make sure project was on time?', completed: false },
      { item: 'Is freelancer needed for this project?', completed: false },
      { item: 'Did you make sure freelancer was hired?', completed: false },
      { item: "Did you make sure you have been added to client's WhatsApp group on the same day?", completed: false },
      { item: 'Has the Slack group been made for this project?', completed: false },
      { item: 'Check if it has been assigned to somebody else already', completed: false },
      { item: 'Choose your own supervisor', completed: false },
      { item: 'Check if the project assigned is still on and in priority', completed: false },
      { item: 'Have you taken follow-up from the client?', completed: false },
      { item: 'Have you made all the tasks for the project?', completed: false },
      { item: 'Did you assign deadlines for each task?', completed: false },
      { item: 'Did you record all the relevant loom videos?', completed: false },
      { item: 'Did you organize loom videos?', completed: false },
      { item: 'Was deadline followed?', completed: false },
    ],
    dailyUpdate: [
      { item: 'Attended morning session', completed: false },
      { item: 'Came on time', completed: false },
      { item: 'Worked on my project', completed: false },
      { item: 'Got code corrected', completed: false },
      { item: 'Updated client', completed: false },
      { item: 'Worked on training task', completed: false },
      { item: 'Updated Senior Team', completed: false },
      { item: 'Updated Daily Progress', completed: false },
      { item: "Plan Next day's task", completed: false },
      { item: 'Completed all task for the day', completed: false },
      { item: 'Worked on more than 1 project (if assigned)', completed: false },
      { item: 'Tasks for the day', completed: false },
      { item: 'Did you inform when you left the meeting?', completed: false },
      { item: 'Did you inform before coming late?', completed: false },
      { item: 'Did you inform before bunking the day before?', completed: false },
      { item: 'Were you screensharing and working at all times?', completed: false },
    ],
  });

  const fetchMyTasks = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/tasks/my-tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyProjects = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter all projects that are assigned to the current user (active and completed)
      const myProjects = response.data.filter((project: any) => 
        project.leadAssignee?._id === user?.id ||
        project.virtualAssistant?._id === user?.id ||
        project.projectLeader?._id === user?.id ||
        project.freelancers?.some((f: any) => f._id === user?.id) ||
        project.coders?.some((c: any) => c._id === user?.id)
      );
      setProjects(myProjects);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const fetchMyUpdates = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/updates/employee/${user?.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUpdates(response.data);
    } catch (error) {
      console.error('Failed to fetch updates:', error);
    }
  };

  const fetchMeetings = () => {
    const storedMeetings = localStorage.getItem('meetings');
    if (storedMeetings) {
      setMeetings(JSON.parse(storedMeetings));
    }
  };

  const fetchMessages = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/messages/received`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('Failed to load messages. Please try again.');
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      const token = getToken();
      await axios.patch(`${API_BASE_URL}/messages/${messageId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMessages();
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };

  // Handle save update changes
  const handleSaveUpdate = async () => {
    try {
      const token = getToken();
      await axios.put(`${API_BASE_URL}/updates/${selectedUpdate._id}`, editData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Update saved successfully!');
      setIsEditMode(false);
      setEditData(null);
      fetchMyUpdates();
    } catch (error: any) {
      console.error('Failed to save update:', error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Failed to save update. Please try again.');
      }
    }
  };

  const handleEditClick = () => {
    setEditData(JSON.parse(JSON.stringify(selectedUpdate)));
    setIsEditMode(true);
  };

  useEffect(() => {
    fetchMyTasks();
    fetchMyProjects();
    fetchMyUpdates();
    fetchMeetings();
    fetchMessages();
  }, [user]);

  // Setup realtime updates listener
  useRealtimeUpdates({
    [EVENTS.TASK_CREATED]: fetchMyTasks,
    [EVENTS.TASK_UPDATED]: fetchMyTasks,
    [EVENTS.TASK_DELETED]: fetchMyTasks,
    [EVENTS.PROJECT_CREATED]: fetchMyProjects,
    [EVENTS.PROJECT_UPDATED]: fetchMyProjects,
    [EVENTS.PROJECT_DELETED]: fetchMyProjects,
    [EVENTS.UPDATE_CREATED]: fetchMyUpdates,
    [EVENTS.UPDATE_UPDATED]: fetchMyUpdates,
  });

  // Auto-refresh data every 5 seconds for real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMyTasks();
      fetchMyProjects();
      fetchMyUpdates();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, []);

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

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const token = getToken();
      await axios.patch(`${API_BASE_URL}/tasks/${taskId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMyTasks();
      eventEmitter.emit(EVENTS.TASK_UPDATED);
      toast.success('Task status updated!');
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleProgressChange = async (taskId: string, newProgress: number) => {
    try {
      const token = getToken();
      await axios.patch(`${API_BASE_URL}/tasks/${taskId}/progress`, 
        { workProgress: newProgress },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMyTasks();
      eventEmitter.emit(EVENTS.TASK_UPDATED);
    } catch (error) {
      console.error('Failed to update progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }
    try {
      const token = getToken();
      await axios.delete(`${API_BASE_URL}/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMyTasks();
      eventEmitter.emit(EVENTS.TASK_DELETED);
      toast.success('Task deleted successfully!');
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Failed to delete task');
    }
  };

  const handleCreateUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!updateFormData.projectId || !updateFormData.summary) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const token = getToken();
      await axios.post(`${API_BASE_URL}/updates`, 
        {
          ...updateFormData,
          date: new Date(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Reset form with default values
      setUpdateFormData({
        summary: '',
        loomVideoLink: '',
        projectId: '',
        nextPlan: '',
        hoursAttended: 0,
        projectManagement: [
          { item: 'Asked senior team for new Project', completed: false },
          { item: 'Did you inform you are not able to do the project?', completed: false },
          { item: 'Did you make sure project was given to someone else?', completed: false },
          { item: 'Did you make sure project was on time?', completed: false },
          { item: 'Is freelancer needed for this project?', completed: false },
          { item: 'Did you make sure freelancer was hired?', completed: false },
          { item: "Did you make sure you have been added to client's WhatsApp group on the same day?", completed: false },
          { item: 'Has the Slack group been made for this project?', completed: false },
          { item: 'Check if it has been assigned to somebody else already', completed: false },
          { item: 'Choose your own supervisor', completed: false },
          { item: 'Check if the project assigned is still on and in priority', completed: false },
          { item: 'Have you taken follow-up from the client?', completed: false },
          { item: 'Have you made all the tasks for the project?', completed: false },
          { item: 'Did you assign deadlines for each task?', completed: false },
          { item: 'Did you record all the relevant loom videos?', completed: false },
          { item: 'Did you organize loom videos?', completed: false },
          { item: 'Was deadline followed?', completed: false },
        ],
        dailyUpdate: [
          { item: 'Attended morning session', completed: false },
          { item: 'Came on time', completed: false },
          { item: 'Worked on my project', completed: false },
          { item: 'Got code corrected', completed: false },
          { item: 'Updated client', completed: false },
          { item: 'Worked on training task', completed: false },
          { item: 'Updated Senior Team', completed: false },
          { item: 'Updated Daily Progress', completed: false },
          { item: "Plan Next day's task", completed: false },
          { item: 'Completed all task for the day', completed: false },
          { item: 'Worked on more than 1 project (if assigned)', completed: false },
          { item: 'Tasks for the day', completed: false },
          { item: 'Did you inform when you left the meeting?', completed: false },
          { item: 'Did you inform before coming late?', completed: false },
          { item: 'Did you inform before bunking the day before?', completed: false },
          { item: 'Were you screensharing and working at all times?', completed: false },
        ],
      });
      fetchMyUpdates();
      eventEmitter.emit(EVENTS.UPDATE_CREATED);
      toast.success('Daily update posted successfully!');
      // Small delay to ensure UI updates
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 300);
    } catch (error) {
      console.error('Failed to post update:', error);
      toast.error('Failed to post update');
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  // Get filtered tasks for consistent display across all tabs
  const filteredTasks = tasks.filter((task: any) => 
    !task.projectId || projects.some(proj => proj._id === task.projectId?._id || proj._id === task.projectId)
  );
  const currentTask = filteredTasks.length > 0 ? filteredTasks[0] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      {/* Sidebar Navigation */}
      <aside className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-xl transition-all duration-300 z-30 ${
        sidebarOpen ? 'w-64' : 'w-20'
      } hidden lg:block`}>
        {/* Sidebar Header */}
        <div className="h-20 border-b border-gray-200 flex items-center justify-between px-4">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Employee</h2>
                <p className="text-xs text-gray-500">Dashboard</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 5rem)' }}>
          {[
            { id: 'attendance', label: 'Attendance', icon: CheckSquare },
            { id: 'points', label: 'My Points', icon: Zap },
            { id: 'tasks', label: 'My Tasks', icon: CheckSquare },
            { id: 'projects', label: 'My Projects', icon: Briefcase },
            { id: 'updates', label: 'Daily Updates', icon: FileText },
            { id: 'meetings', label: 'Meetings', icon: Video },
            { id: 'messages', label: 'Messages', icon: Mail },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title={!sidebarOpen ? item.label : ''}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${
                  activeTab === item.id ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'
                }`} />
                {sidebarOpen && (
                  <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-72 sm:w-80 bg-white shadow-2xl transition-transform duration-300 z-50 lg:hidden overflow-y-auto ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Mobile Sidebar Header */}
        <div className="sticky top-0 bg-white h-16 sm:h-20 border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm sm:text-base">Employee</h2>
              <p className="text-xs text-gray-500">Dashboard</p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Mobile Navigation Items */}
        <nav className="p-3 sm:p-4 space-y-1 pb-6">
          {[
            { id: 'attendance', label: 'Attendance', icon: CheckSquare },
            { id: 'points', label: 'My Points', icon: Zap },
            { id: 'tasks', label: 'My Tasks', icon: CheckSquare },
            { id: 'projects', label: 'My Projects', icon: Briefcase },
            { id: 'updates', label: 'Daily Updates', icon: FileText },
            { id: 'meetings', label: 'Meetings', icon: Video },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 sm:px-4 py-3.5 sm:py-4 rounded-lg sm:rounded-xl transition-all duration-200 touch-manipulation ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-[0.98]'
                    : 'text-gray-700 hover:bg-gray-100 active:scale-95'
                }`}
              >
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 ${
                  activeTab === item.id ? 'text-white' : 'text-gray-600'
                }`} />
                <span className="font-medium text-sm sm:text-base">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center">
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-700" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Employee Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Welcome back, {user?.firstName}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {activeTab === 'tasks' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 animate-fadeIn">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">My Assigned Tasks</h2>
                <p className="text-sm text-gray-600">Track and manage your work</p>
              </div>
            </div>
            
            {loading ? (
              <p className="text-gray-600">Loading tasks...</p>
            ) : tasks.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 mb-6">
                  <CheckSquare className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Tasks Assigned</h3>
                <p className="text-gray-500 text-sm">Tasks assigned to you will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-left">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr className="border-b border-gray-200">
                      <th className="px-3 sm:px-4 py-3 sm:py-4 text-gray-700 font-bold text-xs uppercase tracking-wider">Task</th>
                      <th className="px-3 sm:px-4 py-3 sm:py-4 text-gray-700 font-bold text-xs uppercase tracking-wider hidden md:table-cell">Description</th>
                      <th className="px-3 sm:px-4 py-3 sm:py-4 text-gray-700 font-bold text-xs uppercase tracking-wider">Priority</th>
                      <th className="px-3 sm:px-4 py-3 sm:py-4 text-gray-700 font-bold text-xs uppercase tracking-wider hidden sm:table-cell">Progress</th>
                      <th className="px-3 sm:px-4 py-3 sm:py-4 text-gray-700 font-bold text-xs uppercase tracking-wider hidden lg:table-cell">Status</th>
                      <th className="px-3 sm:px-4 py-3 sm:py-4 text-gray-700 font-bold text-xs uppercase tracking-wider hidden xl:table-cell">Due Date</th>
                      <th className="px-3 sm:px-4 py-3 sm:py-4 text-gray-700 font-bold text-xs uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.filter((task: any) => 
                      !task.projectId || projects.some(proj => proj._id === task.projectId?._id || proj._id === task.projectId)
                    ).map((task) => (
                      <tr key={task._id} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors">
                        <td className="px-3 sm:px-4 py-3 sm:py-4">
                          <div className="text-sm sm:text-base text-gray-900 font-semibold">{task.title}</div>
                          <div className="text-xs text-gray-500 md:hidden mt-1">{task.description.substring(0, 40)}...</div>
                          <div className="flex gap-2 items-center mt-2 lg:hidden">
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              task.status === 'completed' ? 'bg-green-100 text-green-800' :
                              task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                              task.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {task.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-3 sm:py-4 text-gray-600 text-sm hidden md:table-cell">{task.description.substring(0, 50)}...</td>
                        <td className="px-3 sm:px-4 py-3 sm:py-4">
                          <span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                            task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'
                          }`}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 py-3 sm:py-4 hidden sm:table-cell">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={task.workProgress || 0}
                              onChange={(e) => handleProgressChange(task._id, parseInt(e.target.value))}
                              className="w-20 sm:w-28 h-2 sm:h-2.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                            />
                            <span className="text-xs sm:text-sm font-bold text-blue-600 min-w-[35px] sm:min-w-[45px]">{task.workProgress || 0}%</span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-3 sm:py-4 hidden lg:table-cell">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                            task.status === 'completed' ? 'bg-green-100 text-green-800' :
                            task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            task.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {task.status}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 py-3 sm:py-4 text-gray-700 font-medium text-sm hidden xl:table-cell">{new Date(task.dueDate).toLocaleDateString()}</td>
                        <td className="px-3 sm:px-4 py-3 sm:py-4">
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task._id, e.target.value)}
                            className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 border-2 border-gray-300 rounded-lg bg-white text-gray-900 font-medium cursor-pointer hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                          >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Projects</h2>
            <p className="text-gray-600 mb-6">Projects you are currently working on</p>
            
            {projects.length === 0 ? (
              <p className="text-gray-600 text-center py-12">No projects assigned yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project: any) => (
                  <div 
                    key={project._id} 
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200 hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold text-gray-900">{project.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        project.status === 'completed' ? 'bg-green-100 text-green-800' :
                        project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {project.status || 'Active'}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4">{project.description}</p>
                    
                    <div className="space-y-2 text-sm mb-4">
                      <p className="text-gray-700">
                        <span className="font-semibold">Client:</span> {project.clientId?.name || 'N/A'}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Type:</span> {project.projectType}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">Priority:</span> <span className={`capitalize font-semibold ${
                          project.priority === 'high' ? 'text-red-600' :
                          project.priority === 'medium' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>{project.priority}</span>
                      </p>
                      {project.startDate && (
                        <p className="text-gray-700">
                          <span className="font-semibold">Start Date:</span> {new Date(project.startDate).toLocaleDateString()}
                        </p>
                      )}
                      {project.endDate && (
                        <p className="text-gray-700">
                          <span className="font-semibold">End Date:</span> {new Date(project.endDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    {project.links && Object.values(project.links).some(link => link) && (
                      <div className="border-t border-blue-200 pt-3">
                        <p className="text-sm font-semibold text-gray-900 mb-2">Project Links:</p>
                        <div className="space-y-1">
                          {project.links.github && (
                            <a 
                              href={project.links.github} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="block text-blue-600 hover:text-blue-800 text-sm"
                            >
                              📌 GitHub
                            </a>
                          )}
                          {project.links.loom && (
                            <a 
                              href={project.links.loom} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="block text-blue-600 hover:text-blue-800 text-sm"
                            >
                              🎥 Loom Video
                            </a>
                          )}
                          {project.links.oneDrive && (
                            <a 
                              href={project.links.oneDrive} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="block text-blue-600 hover:text-blue-800 text-sm"
                            >
                              📁 OneDrive
                            </a>
                          )}
                          {project.links.whatsapp && (
                            <a 
                              href={project.links.whatsapp} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="block text-blue-600 hover:text-blue-800 text-sm"
                            >
                              💬 WhatsApp
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'points' && (
          <div className="space-y-6 animate-fadeIn">
            <PointsSummary />
            <PointsLeaderboard />
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="space-y-6">
            {/* Task Info Card */}
            {currentTask && (
              <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6 shadow-lg mb-6 animate-fadeIn">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                    <CheckSquare className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Your Current Task</h3>
                </div>
                <div className="space-y-3">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 border-2 border-blue-100 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-bold text-gray-900">{currentTask.title}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        currentTask.status === 'completed' ? 'bg-green-100 text-green-800' :
                        currentTask.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {currentTask.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{currentTask.description}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Priority:</span>
                        <p className={`font-semibold ${
                          currentTask.priority === 'high' ? 'text-red-600' :
                          currentTask.priority === 'medium' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>{currentTask.priority}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Progress:</span>
                        <p className="font-semibold text-blue-600">{currentTask.workProgress || 0}%</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Due Date:</span>
                        <p className="font-semibold text-gray-900">{new Date(currentTask.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <AttendanceCard assignedProjects={projects} />
          </div>
        )}





        {activeTab === 'updates' && (
          <div>
            {/* Task Info Card */}
            {currentTask && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Your Current Task to Update</h3>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-4 border border-purple-100">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-lg font-bold text-gray-900">{currentTask.title}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        currentTask.status === 'completed' ? 'bg-green-100 text-green-800' :
                        currentTask.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {currentTask.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{currentTask.description}</p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Priority:</span>
                        <p className={`font-semibold ${
                          currentTask.priority === 'high' ? 'text-red-600' :
                          currentTask.priority === 'medium' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>{currentTask.priority}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Progress:</span>
                        <p className="font-semibold text-blue-600">{currentTask.workProgress || 0}%</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Due:</span>
                        <p className="font-semibold text-gray-900">{new Date(currentTask.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 animate-fadeIn">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Daily Updates</h2>
                  <p className="text-sm text-gray-600">Share your progress and plans</p>
                </div>
              </div>
              
              {/* Create Update Form */}
              <form onSubmit={handleCreateUpdate} className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 mb-8 border-2 border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Post Daily Update</h3>
                </div>
                
                <div className="space-y-5">
                {/* Project Selection */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Project * (Select what you'll work on today)</label>
                  <select
                    required
                    value={updateFormData.projectId}
                    onChange={(e) => setUpdateFormData({ ...updateFormData, projectId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="">Select a project</option>
                    {projects.map((project: any) => (
                      <option key={project._id} value={project._id}>
                        {project.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Summary */}
                <div>
                  <label className="block text-gray-700 font-bold mb-2 text-sm">What did you accomplish today? *</label>
                  <textarea
                    required
                    value={updateFormData.summary}
                    onChange={(e) => setUpdateFormData({ ...updateFormData, summary: e.target.value })}
                    placeholder="Describe what you've done today, tasks completed, progress made, etc."
                    rows={5}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none transition-all"
                  />
                </div>

                {/* Next Plan */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">What's your plan for tomorrow? (Optional)</label>
                  <textarea
                    value={updateFormData.nextPlan}
                    onChange={(e) => setUpdateFormData({ ...updateFormData, nextPlan: e.target.value })}
                    placeholder="Describe what you plan to work on tomorrow, upcoming tasks, etc."
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                {/* Hours Attended */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">No. of hours attended today</label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    value={updateFormData.hoursAttended}
                    onChange={(e) => setUpdateFormData({ ...updateFormData, hoursAttended: parseFloat(e.target.value) })}
                    placeholder="Enter hours worked (e.g., 8, 8.5)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* PROJECT MANAGEMENT Checklist */}
                <div className="border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
                  <h4 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                    📊 PROJECT MANAGEMENT
                  </h4>
                  <div className="space-y-3">
                    {updateFormData.projectManagement.map((item, idx) => (
                      <label key={idx} className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={(e) => {
                            const newProjectMgmt = [...updateFormData.projectManagement];
                            newProjectMgmt[idx].completed = e.target.checked;
                            setUpdateFormData({ ...updateFormData, projectManagement: newProjectMgmt });
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
                    {updateFormData.dailyUpdate.map((item, idx) => (
                      <label key={idx} className="flex items-start gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={(e) => {
                            const newDailyUpdate = [...updateFormData.dailyUpdate];
                            newDailyUpdate[idx].completed = e.target.checked;
                            setUpdateFormData({ ...updateFormData, dailyUpdate: newDailyUpdate });
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
                    value={updateFormData.loomVideoLink}
                    onChange={(e) => setUpdateFormData({ ...updateFormData, loomVideoLink: e.target.value })}
                    placeholder="https://loom.com/share/... (paste your Loom video link here)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <p className="text-gray-500 text-sm mt-1">💡 Tip: Record a quick video of your work using Loom and paste the link here</p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] duration-200"
                >
                  📤 Post Daily Update
                </button>
              </div>
            </form>

            {/* Previous Updates */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                  <h3 className="text-xl font-bold text-gray-900">Your Recent Updates ({updates.length})</h3>
                </div>
                <button
                  onClick={() => {
                    fetchMyUpdates();
                    toast.success('Updates refreshed!');
                  }}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition text-sm font-medium"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
              {updates.length === 0 ? (
                <p className="text-gray-600">No updates posted yet. Post your first daily update above!</p>
              ) : (
                <div className="space-y-4">
                  {updates
                    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((update: any) => (
                    <div 
                      key={update._id} 
                      onClick={() => setSelectedUpdate(update)}
                      className="border-2 border-gray-200 rounded-xl p-5 bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 cursor-pointer transition-all hover:shadow-lg hover:border-blue-300 hover:scale-[1.01]"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-gray-600 text-sm">
                            {new Date(update.date).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                          <p className="text-gray-500 text-sm">Project: {update.projectId?.title || 'N/A'}</p>
                        </div>
                      </div>
                      <p className="text-gray-900 mb-3 whitespace-pre-wrap">{update.summary}</p>
                      {update.loomVideoLink && (
                        <a
                          href={update.loomVideoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
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
            </div>
          </div>
        )}

        {/* Meetings Tab */}
        {activeTab === 'meetings' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">My Meetings</h2>
                  <p className="text-sm text-gray-600">View and manage your scheduled meetings</p>
                </div>
              </div>
              <button
                onClick={() => {
                  fetchMeetings();
                  toast.success('Meetings refreshed!');
                }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-md hover:shadow-lg font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>

            {/* Meetings List */}
            <div className="space-y-4">
              {meetings.filter((meeting: any) => 
                meeting.attendees?.includes(user?.id)
              ).length === 0 ? (
                <div className="text-center py-16">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-6">
                    <Video className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Meetings Scheduled</h3>
                  <p className="text-gray-500 text-sm">Your upcoming meetings will appear here</p>
                </div>
              ) : (
                meetings
                  .filter((meeting: any) => meeting.attendees?.includes(user?.id))
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((meeting: any) => (
                    <div
                      key={meeting._id}
                      className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200"
                    >
                      {/* Meeting Header */}
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-white mb-1">{meeting.title}</h3>
                            {meeting.description && (
                              <p className="text-blue-100 text-sm line-clamp-2">{meeting.description}</p>
                            )}
                          </div>
                          <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded-full border border-white/30">
                            {meeting.status || 'Scheduled'}
                          </span>
                        </div>
                      </div>

                      {/* Meeting Details */}
                      <div className="p-6 bg-gray-50">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                          {/* Date */}
                          <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-blue-100">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 font-medium">Date</p>
                              <p className="font-semibold text-gray-900 text-sm truncate">
                                {new Date(meeting.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>

                          {/* Time */}
                          <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-purple-100">
                            <div className="flex-shrink-0 w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                              <Clock className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 font-medium">Time</p>
                              <p className="font-semibold text-gray-900 text-sm">{meeting.time}</p>
                            </div>
                          </div>

                          {/* Duration */}
                          <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-green-100">
                            <div className="flex-shrink-0 w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                              <Timer className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 font-medium">Duration</p>
                              <p className="font-semibold text-gray-900 text-sm">{meeting.duration || '30 minutes'}</p>
                            </div>
                          </div>

                          {/* Attendees */}
                          <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-orange-100">
                            <div className="flex-shrink-0 w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                              <Users className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-500 font-medium">Attendees</p>
                              <p className="font-semibold text-gray-900 text-sm">{meeting.attendees?.length || 0} people</p>
                            </div>
                          </div>
                        </div>

                        {/* Join Meeting Button */}
                        {meeting.meetingLink && (
                          <div className="pt-4 border-t border-gray-200">
                            <a
                              href={meeting.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                              <Video className="w-5 h-5" />
                              Join Meeting
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  Messages
                </h2>
                <p className="text-sm text-gray-600 mt-2">Stay connected with your team</p>
              </div>
              <button
                onClick={fetchMessages}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all flex items-center gap-2 shadow-md hover:shadow-lg font-semibold text-sm sm:text-base"
              >
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                Refresh
              </button>
            </div>

            {/* Messages List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {messages.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mb-6">
                    <Mail className="w-10 h-10 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Messages Yet</h3>
                  <p className="text-gray-500 text-sm">Your inbox is empty. Messages will appear here.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {messages.map((message: any) => (
                    <div 
                      key={message._id} 
                      className={`p-4 sm:p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                        message.status !== 'read' ? 'bg-blue-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                            {message.senderId?.firstName?.[0] || 'A'}{message.senderId?.lastName?.[0] || 'D'}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                {message.senderId?.firstName || 'Admin'} {message.senderId?.lastName || ''}
                              </h3>
                              <p className="text-xs sm:text-sm text-gray-500">{message.senderId?.email || 'admin@company.com'}</p>
                            </div>
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {new Date(message.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">{message.subject}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2">{message.content}</p>
                          {message.status !== 'read' && (
                            <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                              <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                              Unread
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      </div>

      {/* Update Details Modal */}
      {selectedUpdate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-5 flex justify-between items-center sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-bold text-white">Update Details</h3>
                <p className="text-blue-100 text-sm">
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
            <div className="px-6 py-4">
              {/* Edit Mode */}
              {isEditMode && editData ? (
                <div>
                  {/* Summary Edit */}
                  <div className="mb-4">
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Summary</label>
                    <textarea
                      value={editData.summary || ''}
                      onChange={(e) => setEditData({...editData, summary: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={4}
                    />
                  </div>

                  {/* Hours Edit */}
                  <div className="mb-4">
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Hours Attended</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={editData.hoursAttended || 0}
                      onChange={(e) => setEditData({...editData, hoursAttended: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Next Plan Edit */}
                  <div className="mb-4">
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Next Plan</label>
                    <textarea
                      value={editData.nextPlan || ''}
                      onChange={(e) => setEditData({...editData, nextPlan: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://loom.com/..."
                    />
                  </div>

                  {/* Project Management Checklist Edit */}
                  {editData.projectManagement && editData.projectManagement.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Project Management</h4>
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

                  {/* Daily Update Checklist Edit */}
                  {editData.dailyUpdate && editData.dailyUpdate.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Daily Update</h4>
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
                  {/* Project */}
                  <div className="mb-4">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {selectedUpdate.projectId?.title || 'Project'}
                    </span>
                  </div>

                  {/* Summary */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Summary</h4>
                    <p className="text-gray-800 whitespace-pre-wrap">{selectedUpdate.summary}</p>
                  </div>

                  {/* Checklist */}
              {selectedUpdate.checklist && selectedUpdate.checklist.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Checklist</h4>
                  <ul className="space-y-2">
                    {selectedUpdate.checklist.map((item: any, idx: number) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-700">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          disabled
                          className="w-4 h-4"
                        />
                        <span>{item.task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Hours Attended */}
              {selectedUpdate.hoursAttended !== undefined && selectedUpdate.hoursAttended > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Hours Attended</h4>
                  <p className="text-lg font-bold text-blue-600">{selectedUpdate.hoursAttended} hours</p>
                </div>
              )}

              {/* PROJECT MANAGEMENT Checklist */}
              {selectedUpdate.projectManagement && selectedUpdate.projectManagement.length > 0 && (
                <div className="mb-4 border-2 border-purple-200 rounded-lg p-3 bg-purple-50">
                  <h4 className="text-sm font-bold text-purple-900 mb-3 flex items-center gap-2">
                    📊 PROJECT MANAGEMENT
                  </h4>
                  <div className="space-y-2">
                    {selectedUpdate.projectManagement.map((item: any, idx: number) => (
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
                <div className="mb-4 border-2 border-blue-200 rounded-lg p-3 bg-blue-50">
                  <h4 className="text-sm font-bold text-blue-900 mb-3 flex items-center gap-2">
                    📋 DAILY UPDATE
                  </h4>
                  <div className="space-y-2">
                    {selectedUpdate.dailyUpdate.map((item: any, idx: number) => (
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
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Next Plan</h4>
                  <p className="text-gray-800 whitespace-pre-wrap">{selectedUpdate.nextPlan}</p>
                </div>
              )}

              {/* Loom Video Link */}
              {selectedUpdate.loomVideoLink && (
                <div className="mb-4">
                  <a
                    href={selectedUpdate.loomVideoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    🎥 Watch Loom Video
                  </a>
                </div>
              )}

              {/* Attachments */}
              {selectedUpdate.attachments && selectedUpdate.attachments.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Attachments</h4>
                  <div className="space-y-2">
                    {selectedUpdate.attachments.map((attachment: any, idx: number) => (
                      <a
                        key={idx}
                        href={attachment.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-blue-600 hover:text-blue-800 text-sm truncate"
                      >
                        📎 {attachment.fileName}
                      </a>
                    ))}
                  </div>
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
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-semibold text-sm"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedUpdate(null)}
                      className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition"
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
