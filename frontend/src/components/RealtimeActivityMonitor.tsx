import { useState, useEffect } from 'react';
import { Activity, Clock, RefreshCw } from 'lucide-react';
import { getToken } from '../utils/auth';
import { API_BASE_URL } from '../config/api';

export function RealtimeActivityMonitor() {
  const [data, setData] = useState<any>({ attendance: [], activeSessions: [] });
  const [message, setMessage] = useState('Loading...');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const token = getToken();
      if (!token) {
        setMessage('Please login first');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/attendance/admin/realtime`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        setData(result);
        setMessage('');
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error || `Error: ${response.status}`;
        setMessage(errorMsg);
        
        if (response.status === 403) {
          setMessage('Admin access required. Please login with an admin account.');
        }
      }
    } catch (err) {
      setMessage(`Error: ${err instanceof Error ? err.message : 'Failed to fetch'}`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return '🟢';
      case 'Idle':
        return '🟡';
      case 'Offline':
        return '🔴';
      default:
        return '⚪';
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 p-2 md:p-0">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-lg md:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
            <span className="leading-tight">Real-time Employee Activity</span>
          </h2>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm md:text-base w-full sm:w-auto justify-center"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
        {message && <p className="text-red-600 mt-2 text-xs md:text-sm font-medium">{message}</p>}
      </div>

      {/* Today's Check-ins */}
      <div className="bg-white rounded-lg shadow p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">📋 Today's Check-ins ({data.attendance?.length || 0})</h3>
        {data.attendance && data.attendance.length > 0 ? (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-900 font-semibold">Employee</th>
                    <th className="px-4 py-2 text-left text-gray-900 font-semibold">Status</th>
                    <th className="px-4 py-2 text-left text-gray-900 font-semibold">Project</th>
                    <th className="px-4 py-2 text-left text-gray-900 font-semibold">Check-in Time</th>
                  </tr>
                </thead>
                <tbody>
                  {data.attendance.map((record: any) => (
                    <tr key={record._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <div>
                          <p className="font-medium text-gray-900">{record.employeeId?.firstName} {record.employeeId?.lastName}</p>
                          <p className="text-xs text-gray-500">{record.employeeId?.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          record.status === 'Present' ? 'bg-green-100 text-green-800' :
                          record.status === 'WFH' ? 'bg-blue-100 text-blue-800' :
                          record.status === 'Late' ? 'bg-yellow-100 text-yellow-800' :
                          record.status === 'Absent' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>{record.status}</span>
                      </td>
                      <td className="px-4 py-2">{record.selectedProjectId?.title || '-'}</td>
                      <td className="px-4 py-2 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {data.attendance.map((record: any) => (
                <div key={record._id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">{record.employeeId?.firstName} {record.employeeId?.lastName}</p>
                      <p className="text-xs text-gray-500">{record.employeeId?.email}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ml-2 ${
                      record.status === 'Present' ? 'bg-green-100 text-green-800' :
                      record.status === 'WFH' ? 'bg-blue-100 text-blue-800' :
                      record.status === 'Late' ? 'bg-yellow-100 text-yellow-800' :
                      record.status === 'Absent' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>{record.status}</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <p className="flex items-center gap-1">
                      <span className="text-gray-600">Project:</span>
                      <span className="font-medium text-gray-900">{record.selectedProjectId?.title || '-'}</span>
                    </p>
                    <p className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-600" />
                      <span className="text-gray-600">Check-in:</span>
                      <span className="font-medium text-gray-900">
                        {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '-'}
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">No check-ins today</div>
        )}
      </div>

      {/* Active Sessions */}
      <div className="bg-white rounded-lg shadow p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">⚡ Active Working Sessions ({data.activeSessions?.length || 0})</h3>
        {data.activeSessions && data.activeSessions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {data.activeSessions.map((session: any) => (
              <div key={session._id} className="bg-green-50 border-2 border-green-200 rounded-lg p-3 md:p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-900 text-sm md:text-base truncate pr-2">{session.employeeId?.firstName} {session.employeeId?.lastName}</p>
                  <span className="text-base md:text-lg flex-shrink-0">{getStatusIcon(session.status)}</span>
                </div>
                <p className="text-xs text-gray-600 mb-2 md:mb-3 truncate">{session.employeeId?.email}</p>
                <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
                  <p className="flex flex-wrap items-baseline">
                    <span className="text-gray-600">Project:</span> 
                    <span className="font-medium text-gray-900 ml-1 break-words">{session.projectId?.title}</span>
                  </p>
                  <p className="flex flex-wrap items-baseline">
                    <span className="text-gray-600">Started:</span> 
                    <span className="font-medium text-gray-900 ml-1">{session.sessionStartTime ? new Date(session.sessionStartTime).toLocaleTimeString() : '-'}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">No active sessions</div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white rounded-lg shadow p-3 md:p-4 text-center">
          <p className="text-xl md:text-2xl font-bold text-green-600">{data.attendance?.filter((a: any) => a.status === 'Present').length || 0}</p>
          <p className="text-xs md:text-sm text-gray-600">Present</p>
        </div>
        <div className="bg-white rounded-lg shadow p-3 md:p-4 text-center">
          <p className="text-xl md:text-2xl font-bold text-blue-600">{data.attendance?.filter((a: any) => a.status === 'WFH').length || 0}</p>
          <p className="text-xs md:text-sm text-gray-600">WFH</p>
        </div>
        <div className="bg-white rounded-lg shadow p-3 md:p-4 text-center">
          <p className="text-xl md:text-2xl font-bold text-red-600">{data.attendance?.filter((a: any) => a.status === 'Absent').length || 0}</p>
          <p className="text-xs md:text-sm text-gray-600">Absent</p>
        </div>
        <div className="bg-white rounded-lg shadow p-3 md:p-4 text-center">
          <p className="text-xl md:text-2xl font-bold text-purple-600">{data.activeSessions?.length || 0}</p>
          <p className="text-xs md:text-sm text-gray-600">Active</p>
        </div>
      </div>
    </div>
  );
}

export default RealtimeActivityMonitor;
