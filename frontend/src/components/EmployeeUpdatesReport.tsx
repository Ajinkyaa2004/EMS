import { useState, useEffect } from 'react';
import { FileText, Filter, Search } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { getToken } from '../utils/auth';
import { API_BASE_URL } from '../config/api';

interface UpdateRecord {
  _id: string;
  employeeId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  date: string;
  title: string;
  description?: string;
  type?: string;
  status?: string;
  checklist?: Array<{
    item: string;
    completed: boolean;
  }>;
}

interface EmployeeUpdatesReportProps {
  month?: number;
  year?: number;
}

export default function EmployeeUpdatesReport({ month, year }: EmployeeUpdatesReportProps) {
  const [updates, setUpdates] = useState<UpdateRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');

  const now = new Date();
  const currentMonth = month ?? now.getMonth();
  const currentYear = year ?? now.getFullYear();

  useEffect(() => {
    fetchUpdates();
  }, [currentMonth, currentYear]);

  const fetchUpdates = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/updates`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      // Filter updates by month and year
      let filteredUpdates = response.data.filter((update: UpdateRecord) => {
        const updateDate = new Date(update.date);
        return (
          updateDate.getMonth() === currentMonth &&
          updateDate.getFullYear() === currentYear
        );
      });

      setUpdates(filteredUpdates.sort((a: UpdateRecord, b: UpdateRecord) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      ));
      toast.success('Updates loaded successfully');
    } catch (error) {
      console.error('Error fetching updates:', error);
      toast.error('Failed to fetch updates');
    } finally {
      setLoading(false);
    }
  };

  // Get unique employees
  const employees = Array.from(
    new Map(
      updates.map((u) => [u.employeeId?._id, u.employeeId])
    ).values()
  ).filter(Boolean) as any[];

  // Filter updates based on search and employee selection
  const filteredUpdates = updates.filter((update) => {
    const matchesSearch =
      update.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      update.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      update.employeeId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      update.employeeId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEmployee = !selectedEmployee || update.employeeId?._id === selectedEmployee;

    return matchesSearch && matchesEmployee;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="w-4 h-4 inline mr-2" />
              Search Updates
            </label>
            <input
              type="text"
              placeholder="Search by title, description, or employee name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Employee Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-2" />
              Filter by Employee
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Employees</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Total Updates</p>
          <p className="text-3xl font-bold text-blue-600">{updates.length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Active Employees</p>
          <p className="text-3xl font-bold text-green-600">{employees.length}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Filtered Results</p>
          <p className="text-3xl font-bold text-purple-600">{filteredUpdates.length}</p>
        </div>
      </div>

      {/* Updates List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredUpdates.length > 0 ? (
          filteredUpdates.map((update) => (
            <div
              key={update._id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all p-6 border-l-4 border-l-blue-500"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">{update.title}</h3>
                    {update.type && (
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        update.type === 'rich'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {update.type}
                      </span>
                    )}
                  </div>
                  {update.employeeId && (
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Employee:</strong> {update.employeeId.firstName} {update.employeeId.lastName}{' '}
                      <span className="text-gray-500">({update.employeeId.email})</span>
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {new Date(update.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {update.status && (
                    <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium ${
                      update.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : update.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {update.status}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              {update.description && (
                <p className="text-gray-700 text-sm mb-4">{update.description}</p>
              )}

              {/* Checklist */}
              {update.checklist && update.checklist.length > 0 && (
                <div className="mt-4 bg-gray-50 rounded p-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">Tasks:</p>
                  <div className="space-y-1">
                    {update.checklist.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          disabled
                          className="w-4 h-4 cursor-not-allowed accent-green-500"
                        />
                        <span className={item.completed ? 'line-through text-gray-500' : 'text-gray-700'}>
                          {item.item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No updates found for the selected filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
