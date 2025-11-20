import { useState, useEffect } from 'react';
import { Calendar, Download, RotateCw, Users } from 'lucide-react';
import { getToken } from '../utils/auth';
import { API_BASE_URL } from '../config/api';

interface AttendanceRecord {
  _id: string;
  employeeId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  date: string;
  status: string;
  checkInTime: string;
  checkOutTime?: string;
  selectedProjectId?: {
    _id: string;
    title: string;
  };
  workingMinutes: number;
}

export function AttendanceRegister() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    wfh: 0,
    onLeave: 0,
    halfDay: 0,
  });

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/attendance/admin/date/${selectedDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch attendance');
      const data = await response.json();
      setRecords(data);

      // Calculate stats
      const newStats = {
        present: 0,
        absent: 0,
        late: 0,
        wfh: 0,
        onLeave: 0,
        halfDay: 0,
      };

      data.forEach((record: AttendanceRecord) => {
        switch (record.status) {
          case 'Present':
            newStats.present++;
            break;
          case 'Absent':
            newStats.absent++;
            break;
          case 'Late':
            newStats.late++;
            break;
          case 'WFH':
            newStats.wfh++;
            break;
          case 'On Leave':
            newStats.onLeave++;
            break;
          case 'Half-day':
            newStats.halfDay++;
            break;
        }
      });

      setStats(newStats);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Present':
        return 'bg-green-100 text-green-800';
      case 'WFH':
        return 'bg-blue-100 text-blue-800';
      case 'Late':
        return 'bg-yellow-100 text-yellow-800';
      case 'Absent':
        return 'bg-red-100 text-red-800';
      case 'On Leave':
        return 'bg-purple-100 text-purple-800';
      case 'Half-day':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Employee Name',
      'Email',
      'Status',
      'Check-in Time',
      'Check-out Time',
      'Project',
      'Working Minutes',
    ];

    const rows = records.map(r => [
      `${r.employeeId.firstName} ${r.employeeId.lastName}`,
      r.employeeId.email,
      r.status,
      new Date(r.checkInTime).toLocaleTimeString(),
      r.checkOutTime ? new Date(r.checkOutTime).toLocaleTimeString() : '-',
      r.selectedProjectId?.title || '-',
      r.workingMinutes.toString(),
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${selectedDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-6 h-6" />
            Daily Attendance Register
          </h2>
          <button
            onClick={fetchAttendance}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <RotateCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Present</p>
            <p className="text-2xl font-bold text-green-600">{stats.present}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Absent</p>
            <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Late</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">WFH</p>
            <p className="text-2xl font-bold text-blue-600">{stats.wfh}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">On Leave</p>
            <p className="text-2xl font-bold text-purple-600">{stats.onLeave}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-600">Half-day</p>
            <p className="text-2xl font-bold text-orange-600">{stats.halfDay}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded-full animate-bounce"></div>
              <span className="text-gray-600">Loading attendance data...</span>
            </div>
          </div>
        ) : records.length === 0 ? (
          <div className="p-8 text-center text-gray-500 flex items-center justify-center gap-2">
            <Users className="w-5 h-5" />
            No attendance records for this date
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Employee</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Check-in</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Check-out</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Project</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Duration</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record._id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        {record.employeeId.firstName} {record.employeeId.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{record.employeeId.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(record.status)}`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-900">
                    {new Date(record.checkInTime).toLocaleTimeString()}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-900">
                    {record.checkOutTime ? new Date(record.checkOutTime).toLocaleTimeString() : '-'}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-900">
                    {record.selectedProjectId?.title || '-'}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-900">
                    {record.workingMinutes ? `${Math.floor(record.workingMinutes / 60)}h ${record.workingMinutes % 60}m` : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AttendanceRegister;
