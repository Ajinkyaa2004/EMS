import { useState, useEffect } from 'react';
import { Clock, LogIn, LogOut, AlertCircle, CheckCircle } from 'lucide-react';
import { getToken } from '../utils/auth';
import { API_BASE_URL } from '../config/api';

interface AttendanceState {
  status: string | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  selectedProject: string | null;
  loading: boolean;
}

interface Project {
  _id: string;
  title: string;
}

export function AttendanceCard({ assignedProjects }: { assignedProjects: Project[] }) {
  const [state, setStateData] = useState<AttendanceState>({
    status: null,
    checkInTime: null,
    checkOutTime: null,
    selectedProject: null,
    loading: true,
  });

  const [selectedProject, setSelectedProject] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    fetchTodayAttendance();
    // Auto-select if only one project
    if (assignedProjects.length === 1) {
      setSelectedProject(assignedProjects[0]._id);
    }
  }, [assignedProjects]);

  const fetchTodayAttendance = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/attendance/today`, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch attendance');
      const data = await response.json();

      if (data) {
        setStateData({
          status: data.status,
          checkInTime: data.checkInTime,
          checkOutTime: data.checkOutTime,
          selectedProject: data.selectedProjectId?._id || null,
          loading: false,
        });
        if (data.selectedProjectId?._id) {
          setSelectedProject(data.selectedProjectId._id);
        }
      } else {
        setStateData(prev => ({ ...prev, loading: false }));
      }
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setStateData(prev => ({ ...prev, loading: false }));
    }
  };

  const handleMarkAttendance = async (attendanceStatus: string) => {
    if (attendanceStatus === 'Present' || attendanceStatus === 'WFH' || attendanceStatus === 'Late') {
      if (!selectedProject) {
        setError('Please select a project first');
        return;
      }
    }

    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/attendance/mark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          status: attendanceStatus,
          selectedProjectId: selectedProject || null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setStateData({
          status: data.attendance.status,
          checkInTime: data.attendance.checkInTime,
          checkOutTime: data.attendance.checkOutTime,
          selectedProject: data.attendance.selectedProjectId?._id || null,
          loading: false,
        });
        setSuccess(`Attendance marked as ${attendanceStatus}`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const err = await response.json();
        setError(err.error || 'Failed to mark attendance');
      }
    } catch (err) {
      setError('Error marking attendance');
      console.error(err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Present':
        return 'bg-green-50 border-green-200';
      case 'WFH':
        return 'bg-blue-50 border-blue-200';
      case 'Late':
        return 'bg-yellow-50 border-yellow-200';
      case 'Absent':
        return 'bg-red-50 border-red-200';
      case 'On Leave':
        return 'bg-purple-50 border-purple-200';
      case 'Half-day':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (state.loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <div className="flex items-center justify-center gap-2">
          <Clock className="w-5 h-5 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading attendance...</span>
        </div>
      </div>
    );
  }

  if (state.status) {
    return (
      <div className={`p-6 rounded-lg shadow border ${getStatusColor(state.status)}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Today's Attendance</h3>
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className="text-xl font-bold text-gray-900">{state.status}</p>
          </div>
          {state.checkInTime && (
            <div>
              <p className="text-sm text-gray-600">Check-in Time</p>
              <p className="text-sm text-gray-900">
                {new Date(state.checkInTime).toLocaleTimeString()}
              </p>
            </div>
          )}
          {state.checkOutTime && (
            <div>
              <p className="text-sm text-gray-600">Check-out Time</p>
              <p className="text-sm text-gray-900">
                {new Date(state.checkOutTime).toLocaleTimeString()}
              </p>
            </div>
          )}
          {state.selectedProject && (
            <div>
              <p className="text-sm text-gray-600">Working on Project</p>
              <p className="text-sm text-gray-900">
                {assignedProjects.find(p => (typeof p === 'string' ? p : p._id) === state.selectedProject) 
                  ? (typeof assignedProjects[0] === 'string' ? assignedProjects[0] : assignedProjects.find(p => (typeof p === 'string' ? p : p._id) === state.selectedProject)?.title)
                  : 'Project'}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (assignedProjects.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Mark Your Attendance
        </h3>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
          <p className="text-sm">No projects assigned yet. Please contact your admin to assign projects.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5" />
        Mark Your Attendance
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Select Your Project for Today
        </label>
        {assignedProjects.length === 1 ? (
          <div>
            <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-semibold">
              {typeof assignedProjects[0] === 'string' ? assignedProjects[0] : assignedProjects[0].title}
            </div>
            <input
              type="hidden"
              value={typeof assignedProjects[0] === 'string' ? assignedProjects[0] : assignedProjects[0]._id}
              onChange={(e) => setSelectedProject(e.target.value)}
            />
          </div>
        ) : (
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Choose a project --</option>
            {assignedProjects.map(project => (
              <option key={typeof project === 'string' ? project : project._id} value={typeof project === 'string' ? project : project._id}>
                {typeof project === 'string' ? project : project.title}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Check-in / Check-out Section */}
      {state.checkInTime && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-gray-900 mb-3">Work Hours Tracking</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">✓ Checked in at:</span>
              <span className="font-semibold text-green-600">{new Date(state.checkInTime).toLocaleTimeString()}</span>
            </div>
            {state.checkOutTime && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">✓ Checked out at:</span>
                <span className="font-semibold text-red-600">{new Date(state.checkOutTime).toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={() => handleMarkAttendance('Present')}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          <LogIn className="w-4 h-4" />
          Present
        </button>
        <button
          onClick={() => handleMarkAttendance('Late')}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
        >
          <Clock className="w-4 h-4" />
          Late
        </button>
        <button
          onClick={() => handleMarkAttendance('WFH')}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <LogIn className="w-4 h-4" />
          Work From Home
        </button>
        <button
          onClick={() => handleMarkAttendance('Absent')}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          <LogOut className="w-4 h-4" />
          Absent
        </button>
        <button
          onClick={() => handleMarkAttendance('Half-day')}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition col-span-1"
        >
          Half-day
        </button>
        <button
          onClick={() => handleMarkAttendance('On Leave')}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition col-span-1"
        >
          On Leave
        </button>
      </div>
    </div>
  );
}

export default AttendanceCard;
