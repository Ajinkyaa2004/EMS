import { useState, useEffect } from 'react';
import { X, Calendar, Briefcase, CheckSquare, FileText } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { getToken } from '../utils/auth';
import { API_BASE_URL } from '../config/api';
import DailyUpdateDetail from './DailyUpdateDetail';

interface EmployeeDetailModalProps {
  employeeId: string;
  employeeName: string;
  email: string;
  onClose: () => void;
  selectedMonth?: number;
  selectedYear?: number;
}

interface AttendanceDetail {
  _id: string;
  date: string;
  status: string;
  selectedProjectId?: {
    _id: string;
    title: string;
  };
  checkInTime?: string;
  notes?: string;
}

interface ProjectDetail {
  _id: string;
  title: string;
  description?: string;
  status?: string;
  hoursWorked?: number;
}

interface UpdateDetail {
  _id: string;
  date: string;
  title?: string;
  summary?: string;
  description?: string;
  type?: string;
  status?: string;
  checklist?: Array<{
    task?: string;
    item?: string;
    completed: boolean;
  }>;
  projectManagement?: Array<{
    item: string;
    completed: boolean;
  }>;
  dailyUpdate?: Array<{
    item: string;
    completed: boolean;
  }>;
  nextPlan?: string;
  loomVideoLink?: string;
  hoursAttended?: number;
  projectId?: {
    _id: string;
    title: string;
  };
}

interface TaskDetail {
  _id: string;
  title: string;
  description?: string;
  priority?: string;
  status?: string;
  dueDate?: string;
  completedAt?: string;
}

export default function EmployeeDetailModal({
  employeeId,
  employeeName,
  email,
  onClose,
  selectedMonth,
  selectedYear,
}: EmployeeDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'attendance' | 'projects' | 'updates' | 'tasks'>('attendance');
  const [attendanceData, setAttendanceData] = useState<AttendanceDetail[]>([]);
  const [projects, setProjects] = useState<ProjectDetail[]>([]);
  const [updates, setUpdates] = useState<UpdateDetail[]>([]);
  const [tasks, setTasks] = useState<TaskDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [selectedUpdate, setSelectedUpdate] = useState<UpdateDetail | null>(null);
  const [showUpdateDetail, setShowUpdateDetail] = useState(false);

  const now = new Date();
  const month = selectedMonth ?? now.getMonth();
  const year = selectedYear ?? now.getFullYear();

  useEffect(() => {
    fetchEmployeeData();
  }, [employeeId, month, year]);

  const fetchEmployeeData = async () => {
    setLoading(true);
    try {
      // Fetch attendance details
      const attendanceRes = await axios.get(
        `${API_BASE_URL}/attendance/admin/report/employee/monthly/${employeeId}?month=${month}&year=${year}`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      setAttendanceData(attendanceRes.data.details || []);
      setStats(attendanceRes.data.stats || {});

      // Fetch employee projects
      const projectsRes = await axios.get(`${API_BASE_URL}/projects`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      // Filter projects assigned to this employee
      const employeeProjects = projectsRes.data.filter((p: any) => {
        // Check if employee is lead assignee
        const leadAssigneeId = typeof p.leadAssignee === 'object' ? p.leadAssignee?._id : p.leadAssignee;
        if (leadAssigneeId === employeeId) return true;

        // Check if employee is virtual assistant
        const vaId = typeof p.virtualAssistant === 'object' ? p.virtualAssistant?._id : p.virtualAssistant;
        if (vaId === employeeId) return true;

        // Check if employee is project leader
        const plId = typeof p.projectLeader === 'object' ? p.projectLeader?._id : p.projectLeader;
        if (plId === employeeId) return true;

        // Check if employee is in coders array
        if (p.coders && Array.isArray(p.coders)) {
          if (p.coders.some((c: any) => {
            const coderId = typeof c === 'object' ? c?._id : c;
            return coderId === employeeId;
          })) return true;
        }

        // Check if employee is in freelancers array
        if (p.freelancers && Array.isArray(p.freelancers)) {
          if (p.freelancers.some((f: any) => {
            const freelancerId = typeof f === 'object' ? f?._id : f;
            return freelancerId === employeeId;
          })) return true;
        }

        // Check if employee is in teamMembers array
        if (p.teamMembers && Array.isArray(p.teamMembers)) {
          if (p.teamMembers.some((t: any) => {
            const teamMemberId = typeof t === 'object' ? t?._id : t;
            return teamMemberId === employeeId;
          })) return true;
        }

        return false;
      });
      setProjects(employeeProjects);

      // Fetch employee updates
      const updatesRes = await axios.get(`${API_BASE_URL}/updates`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const employeeUpdates = updatesRes.data.filter((u: any) => {
        const uEmployeeId = typeof u.employeeId === 'object' ? u.employeeId?._id : u.employeeId;
        return uEmployeeId === employeeId;
      });
      setUpdates(employeeUpdates);

      // Fetch employee tasks
      const tasksRes = await axios.get(`${API_BASE_URL}/tasks/admin/all`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const employeeTasks = tasksRes.data.filter((t: any) => t.assignedTo === employeeId);
      setTasks(employeeTasks);
    } catch (error) {
      console.error('Error fetching employee details:', error);
      toast.error('Failed to load employee details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'present':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'late':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'absent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'wfh':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'half-day':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'on leave':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{employeeName}</h2>
            <p className="text-blue-100">{email}</p>
            <p className="text-sm text-blue-100 mt-2">
              {new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stats Bar */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-gray-50 p-4 border-b">
            <div className="text-center">
              <p className="text-gray-600 text-sm font-medium">Present</p>
              <p className="text-2xl font-bold text-green-600">{stats.present || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm font-medium">Late</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.late || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm font-medium">Absent</p>
              <p className="text-2xl font-bold text-red-600">{stats.absent || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-600 text-sm font-medium">Attendance Rate</p>
              <p className="text-2xl font-bold text-blue-600">{stats.attendanceRate}%</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b bg-gray-50 overflow-x-auto">
          <button
            onClick={() => setActiveTab('attendance')}
            className={`flex items-center gap-2 px-4 py-3 font-medium whitespace-nowrap ${
              activeTab === 'attendance'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calendar className="w-4 h-4" /> Attendance ({attendanceData.length})
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-4 py-3 font-medium whitespace-nowrap ${
              activeTab === 'projects'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Briefcase className="w-4 h-4" /> Projects ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab('updates')}
            className={`flex items-center gap-2 px-4 py-3 font-medium whitespace-nowrap ${
              activeTab === 'updates'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="w-4 h-4" /> Updates ({updates.length})
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-2 px-4 py-3 font-medium whitespace-nowrap ${
              activeTab === 'tasks'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <CheckSquare className="w-4 h-4" /> Tasks ({tasks.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {/* Attendance Tab */}
              {activeTab === 'attendance' && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg mb-4">Attendance Records</h3>
                  {attendanceData.length > 0 ? (
                    <div className="grid gap-3">
                      {attendanceData.map((record) => (
                        <div
                          key={record._id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">
                                {new Date(record.date).toLocaleDateString('en-US', {
                                  weekday: 'short',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {record.selectedProjectId?.title || 'No project assigned'}
                              </p>
                              {record.notes && (
                                <p className="text-sm text-gray-500 mt-1 italic">Note: {record.notes}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                                  record.status
                                )}`}
                              >
                                {record.status}
                              </span>
                              {record.checkInTime && (
                                <p className="text-xs text-gray-500 mt-2">
                                  {new Date(record.checkInTime).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No attendance records for this period</p>
                    </div>
                  )}
                </div>
              )}

              {/* Projects Tab */}
              {activeTab === 'projects' && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg mb-4">Assigned Projects</h3>
                  {projects.length > 0 ? (
                    <div className="grid gap-4">
                      {projects.map((project) => (
                        <div
                          key={project._id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900">{project.title}</h4>
                              {project.description && (
                                <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                              )}
                              <div className="flex gap-2 mt-3">
                                {project.status && (
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                                    {project.status}
                                  </span>
                                )}
                                {project.hoursWorked && (
                                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {project.hoursWorked}h
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <Briefcase className="w-8 h-8 text-blue-400" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div>
                      {/* Show projects from recent updates */}
                      {updates.length > 0 && updates.some((u: any) => u.projectId) ? (
                        <div className="grid gap-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-3">Recent Projects from Updates</h4>
                          {updates
                            .filter((u: any) => u.projectId)
                            .slice(0, 5)
                            .map((update) => (
                              <div
                                key={update._id}
                                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all bg-blue-50"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">
                                      {typeof update.projectId === 'object' ? update.projectId?.title : 'Project'}
                                    </h4>
                                    <p className="text-xs text-gray-600 mt-1">
                                      Updated: {new Date(update.date).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                      })}
                                    </p>
                                    <p className="text-sm text-gray-700 mt-2 line-clamp-2">{update.summary}</p>
                                  </div>
                                  <div className="text-right">
                                    <Briefcase className="w-8 h-8 text-orange-400" />
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No projects assigned</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Daily Updates Tab */}
              {activeTab === 'updates' && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg mb-4">Daily Updates</h3>
                  {updates.length > 0 ? (
                    <div className="grid gap-4">
                      {updates.map((update) => (
                        <div
                          key={update._id}
                          onClick={() => {
                            setSelectedUpdate(update);
                            setShowUpdateDetail(true);
                          }}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer bg-white hover:bg-blue-50"
                        >
                          <div className="flex justify-between items-start gap-4 mb-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">{update.title || update.summary || 'Daily Update'}</h4>
                              {update.description && (
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{update.description}</p>
                              )}
                            </div>
                            {update.type && (
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                                  update.type === 'rich' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {update.type}
                              </span>
                            )}
                          </div>

                          {/* Quick Preview - Show only first few items */}
                          {update.checklist && update.checklist.length > 0 && (
                            <div className="mt-3 bg-blue-50 rounded p-2 border border-blue-100">
                              <p className="text-xs font-medium text-blue-900 mb-1">
                                Tasks: {update.checklist.filter((item: any) => item.completed).length}/{update.checklist.length} completed
                              </p>
                              <div className="space-y-0.5">
                                {update.checklist.slice(0, 2).map((item: any, idx: number) => (
                                  <div key={idx} className="flex items-center gap-2 text-xs">
                                    <input
                                      type="checkbox"
                                      checked={item.completed}
                                      disabled
                                      className="w-3 h-3 cursor-not-allowed accent-green-500"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    <span className={item.completed ? 'line-through text-gray-500' : 'text-gray-700'}>
                                      {(item.task || item.item || '').substring(0, 50)}
                                    </span>
                                  </div>
                                ))}
                                {update.checklist.length > 2 && (
                                  <p className="text-xs text-blue-600 font-medium mt-1">
                                    +{update.checklist.length - 2} more items...
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(update.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })} • Click to view full details
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No daily updates submitted</p>
                    </div>
                  )}
                </div>
              )}

              {/* Daily Update Detail Modal */}
              {showUpdateDetail && selectedUpdate && (
                <DailyUpdateDetail
                  update={selectedUpdate}
                  employeeName={employeeName}
                  onClose={() => setShowUpdateDetail(false)}
                />
              )}

              {/* Tasks Tab */}
              {activeTab === 'tasks' && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg mb-4">Assigned Tasks</h3>
                  {tasks.length > 0 ? (
                    <div className="space-y-2">
                      {tasks.map((task) => (
                        <div
                          key={task._id}
                          className={`flex items-start gap-3 p-3 rounded-lg border-l-4 transition-all ${
                            task.completedAt
                              ? 'bg-green-50 border-l-green-500'
                              : 'bg-gray-50 border-l-blue-500'
                          }`}
                        >
                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            checked={!!task.completedAt}
                            disabled
                            className="w-5 h-5 mt-0.5 flex-shrink-0 cursor-not-allowed accent-green-500"
                          />

                          {/* Task Info */}
                          <div className="flex-1">
                            <p className={`font-medium ${
                              task.completedAt ? 'line-through text-gray-500' : 'text-gray-900'
                            }`}>
                              {task.title}
                            </p>
                            {task.description && (
                              <p className={`text-sm mt-1 ${
                                task.completedAt ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                                {task.description}
                              </p>
                            )}
                            <div className="flex gap-2 mt-2 flex-wrap text-xs">
                              {task.priority && (
                                <span className={`px-2 py-1 rounded font-medium ${getPriorityColor(task.priority)}`}>
                                  {task.priority}
                                </span>
                              )}
                              {task.status && (
                                <span className={`px-2 py-1 rounded font-medium border ${getStatusColor(task.status)}`}>
                                  {task.status}
                                </span>
                              )}
                              {task.dueDate && (
                                <span className="px-2 py-1 rounded bg-blue-100 text-blue-800">
                                  Due: {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            {task.completedAt && (
                              <p className="text-xs text-green-600 mt-2 font-medium">
                                ✓ Completed: {new Date(task.completedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No tasks assigned</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
