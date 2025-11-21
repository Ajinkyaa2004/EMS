import { useState, useEffect } from 'react';
import { Calendar, Download, TrendingUp, Users, CheckCircle, AlertCircle, Clock, FileText, Search, X, RefreshCw, Crown } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { getToken } from '../utils/auth';
import { API_BASE_URL } from '../config/api';
import EmployeeDetailModal from './EmployeeDetailModal';
import EmployeeUpdatesReport from './EmployeeUpdatesReport';

interface EmployeeStats {
  employeeId: string;
  employeeName: string;
  email: string;
  totalDays: number;
  present: number;
  late: number;
  absent: number;
  wfh: number;
  halfDay: number;
  onLeave: number;
  attendanceRate: number | string;
  projects: string[];
  projectDetails?: Array<{
    title: string;
    leader: string | null;
  }>;
}

interface ReportData {
  employees: EmployeeStats[];
  weekStart?: Date;
  weekEnd?: Date;
  month?: number;
  year?: number;
  monthStart?: Date;
  monthEnd?: Date;
}

export default function AggregateReport() {
  const [activeView, setActiveView] = useState<'attendance' | 'updates'>('attendance');
  const [reportType, setReportType] = useState<'weekly' | 'monthly'>('weekly');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState<string>(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchWeeklyReport = async (weekStart?: string) => {
    setLoading(true);
    try {
      const url = weekStart 
        ? `${API_BASE_URL}/attendance/admin/report/weekly?weekStart=${weekStart}`
        : `${API_BASE_URL}/attendance/admin/report/weekly`;
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching weekly report:', error);
      toast.error('Failed to fetch weekly report');
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyReport = async (month?: number, year?: number) => {
    setLoading(true);
    try {
      const now = new Date();
      const m = month ?? now.getMonth();
      const y = year ?? now.getFullYear();
      
      const url = `${API_BASE_URL}/attendance/admin/report/monthly?month=${m}&year=${y}`;
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching monthly report:', error);
      toast.error('Failed to fetch monthly report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (reportType === 'weekly') {
      fetchWeeklyReport(selectedDate);
    } else {
      const [year, month] = selectedMonth.split('-');
      fetchMonthlyReport(parseInt(month) - 1, parseInt(year));
    }
  }, [reportType]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (reportType === 'weekly') {
        fetchWeeklyReport(selectedDate);
      } else {
        const [year, month] = selectedMonth.split('-');
        fetchMonthlyReport(parseInt(month) - 1, parseInt(year));
      }
    }, 10000); // 10 seconds
    
    return () => clearInterval(interval);
  }, [reportType, selectedDate, selectedMonth]);

  const handleWeekStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    fetchWeeklyReport(newDate);
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMonth = e.target.value;
    setSelectedMonth(newMonth);
    const [year, month] = newMonth.split('-');
    fetchMonthlyReport(parseInt(month) - 1, parseInt(year));
  };

  const exportToCSV = () => {
    if (!reportData || !reportData.employees) {
      toast.error('No data to export');
      return;
    }

    const headers = [
      'Employee Name',
      'Email',
      'Total Days',
      'Present',
      'Late',
      'Absent',
      'WFH',
      'Half-day',
      'On Leave',
      'Attendance Rate (%)',
      'Projects',
    ];

    const rows = reportData.employees.map(emp => [
      emp.employeeName,
      emp.email,
      emp.totalDays,
      emp.present,
      emp.late,
      emp.absent,
      emp.wfh,
      emp.halfDay,
      emp.onLeave,
      emp.attendanceRate,
      emp.projects.join('; '),
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const reportTypeLabel = reportType === 'weekly' ? 'weekly' : 'monthly';
    const dateLabel = reportType === 'weekly' 
      ? selectedDate 
      : selectedMonth;
    
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance-${reportTypeLabel}-${dateLabel}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`${reportType === 'weekly' ? 'Weekly' : 'Monthly'} report exported successfully`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'text-green-600 bg-green-100';
      case 'late':
        return 'text-yellow-600 bg-yellow-100';
      case 'absent':
        return 'text-red-600 bg-red-100';
      case 'wfh':
        return 'text-blue-600 bg-blue-100';
      case 'halfDay':
        return 'text-orange-600 bg-orange-100';
      case 'onLeave':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getFilteredEmployees = () => {
    if (!reportData?.employees) return [];
    
    if (!searchQuery.trim()) {
      return reportData.employees;
    }

    const query = searchQuery.toLowerCase();
    return reportData.employees.filter(emp => 
      emp.employeeName.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query)
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Aggregate Employee Reports</h2>
            <p className="text-xs sm:text-sm text-gray-600">View comprehensive attendance statistics</p>
          </div>
        </div>
      </div>

      {/* View Selection Tabs */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveView('attendance')}
            className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 font-medium transition-all border-b-2 text-sm sm:text-base ${
              activeView === 'attendance'
                ? 'border-blue-600 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            <span className="hidden sm:inline">Attendance Report</span>
            <span className="sm:hidden">Attendance</span>
          </button>
          <button
            onClick={() => setActiveView('updates')}
            className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 font-medium transition-all border-b-2 text-sm sm:text-base ${
              activeView === 'updates'
                ? 'border-blue-600 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            <span className="hidden sm:inline">Daily Updates</span>
            <span className="sm:hidden">Updates</span>
          </button>
        </div>
      </div>

      {/* Attendance View */}
      {activeView === 'attendance' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Report Type Selection */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="space-y-4">
              {/* Report Type Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setReportType('weekly')}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all text-sm sm:text-base flex items-center justify-center gap-2 ${
                    reportType === 'weekly'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Weekly
                </button>
                <button
                  onClick={() => setReportType('monthly')}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all text-sm sm:text-base flex items-center justify-center gap-2 ${
                    reportType === 'monthly'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  Monthly
                </button>
              </div>

              {/* Date/Month Selector */}
              <div className="space-y-3">
                {reportType === 'weekly' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Week Start Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={handleWeekStartChange}
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Month</label>
                    <input
                      type="month"
                      value={selectedMonth}
                      onChange={handleMonthChange}
                      className="w-full px-4 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    if (reportType === 'weekly') {
                      fetchWeeklyReport(selectedDate);
                    } else {
                      const [year, month] = selectedMonth.split('-');
                      fetchMonthlyReport(parseInt(month) - 1, parseInt(year));
                    }
                    toast.success('Report refreshed!');
                  }}
                  disabled={loading}
                  className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 transition-all flex items-center justify-center gap-2 font-semibold text-sm sm:text-base"
                >
                  <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                  Refresh
                </button>
                <button
                  onClick={exportToCSV}
                  disabled={loading}
                  className="px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-400 transition-all flex items-center justify-center gap-2 font-semibold text-sm sm:text-base"
                >
                  <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          {reportData && !loading && (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="text-xs sm:text-sm text-gray-600 mt-2">
                  Found {getFilteredEmployees().length} of {reportData.employees?.length || 0} employees
                </p>
              )}
            </div>
          )}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Report Summary Cards */}
          {reportData && !loading && (
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1">Total Employees</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{reportData.employees?.length || 0}</p>
                </div>

                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1">Avg Rate</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {reportData.employees?.length > 0
                      ? (
                          reportData.employees.reduce((sum, emp) => sum + (Number(emp.attendanceRate) || 0), 0) /
                          reportData.employees.length
                        ).toFixed(1)
                      : 0}
                    %
                  </p>
                </div>

                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1">Total Present</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {reportData.employees?.reduce((sum, emp) => sum + emp.present, 0) || 0}
                  </p>
                </div>

                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-xl flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1">Total Absent</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {reportData.employees?.reduce((sum, emp) => sum + emp.absent, 0) || 0}
                  </p>
                </div>
              </div>

              {/* Employees Table */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px]">
                    <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                      <tr>
                        <th className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-left font-semibold text-xs sm:text-sm sticky left-0 bg-blue-600 z-10">Employee</th>
                        <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-center font-semibold text-xs sm:text-sm">Days</th>
                        <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-center font-semibold text-xs sm:text-sm">
                          <div className="flex items-center justify-center gap-1">
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Present</span>
                            <span className="sm:hidden">P</span>
                          </div>
                        </th>
                        <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-center font-semibold text-xs sm:text-sm">
                          <div className="flex items-center justify-center gap-1">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Late</span>
                            <span className="sm:hidden">L</span>
                          </div>
                        </th>
                        <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-center font-semibold text-xs sm:text-sm">
                          <div className="flex items-center justify-center gap-1">
                            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">Absent</span>
                            <span className="sm:hidden">A</span>
                          </div>
                        </th>
                        <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-center font-semibold text-xs sm:text-sm">WFH</th>
                        <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-center font-semibold text-xs sm:text-sm hidden md:table-cell">Half-day</th>
                        <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-center font-semibold text-xs sm:text-sm hidden lg:table-cell">Leave</th>
                        <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-center font-semibold text-xs sm:text-sm">Rate</th>
                        <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left font-semibold text-xs sm:text-sm hidden xl:table-cell">Projects</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {getFilteredEmployees().length > 0 ? (
                        getFilteredEmployees().map((employee, index) => (
                          <tr 
                            key={employee.employeeId} 
                            className={`${index % 2 === 0 ? 'bg-slate-50' : 'bg-white'} hover:bg-blue-50 cursor-pointer transition-colors`}
                            onClick={() => {
                              setSelectedEmployee(employee);
                              setShowEmployeeModal(true);
                            }}
                          >
                            <td className="px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 sticky left-0 bg-inherit z-10">
                              <div>
                                <p className="font-semibold text-slate-800 text-xs sm:text-sm md:text-base">{employee.employeeName}</p>
                                <p className="text-xs sm:text-sm text-slate-600 truncate max-w-[120px] sm:max-w-none">{employee.email}</p>
                              </div>
                            </td>
                            <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-center font-semibold text-slate-700 text-xs sm:text-sm">{employee.totalDays}</td>
                            <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-center">
                              <span className={`px-2 sm:px-3 py-1 rounded-full font-semibold text-xs sm:text-sm ${getStatusColor('present')}`}>
                                {employee.present}
                              </span>
                            </td>
                            <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-center">
                              <span className={`px-2 sm:px-3 py-1 rounded-full font-semibold text-xs sm:text-sm ${getStatusColor('late')}`}>
                                {employee.late}
                              </span>
                            </td>
                            <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-center">
                              <span className={`px-2 sm:px-3 py-1 rounded-full font-semibold text-xs sm:text-sm ${getStatusColor('absent')}`}>
                                {employee.absent}
                              </span>
                            </td>
                            <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-center">
                              <span className={`px-2 sm:px-3 py-1 rounded-full font-semibold text-xs sm:text-sm ${getStatusColor('wfh')}`}>
                                {employee.wfh}
                              </span>
                            </td>
                            <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-center hidden md:table-cell">
                              <span className={`px-2 sm:px-3 py-1 rounded-full font-semibold text-xs sm:text-sm ${getStatusColor('halfDay')}`}>
                                {employee.halfDay}
                              </span>
                            </td>
                            <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-center hidden lg:table-cell">
                              <span className={`px-2 sm:px-3 py-1 rounded-full font-semibold text-xs sm:text-sm ${getStatusColor('onLeave')}`}>
                                {employee.onLeave}
                              </span>
                            </td>
                            <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 text-center">
                              <div className="flex flex-col sm:flex-row items-center justify-center gap-1">
                                <div className="w-16 sm:w-20 md:w-24 bg-slate-200 rounded-full h-1.5 sm:h-2 hidden sm:block">
                                  <div
                                    className="bg-blue-600 h-1.5 sm:h-2 rounded-full"
                                    style={{ width: `${Math.min(Number(employee.attendanceRate), 100)}%` }}
                                  ></div>
                                </div>
                                <span className="font-semibold text-slate-700 text-xs sm:text-sm">{employee.attendanceRate}%</span>
                              </div>
                            </td>
                            <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 md:py-4 hidden xl:table-cell">
                              <div className="flex flex-wrap gap-1">
                                {employee.projectDetails && employee.projectDetails.length > 0 ? (
                                  employee.projectDetails.map((project, idx) => (
                                    <div
                                      key={idx}
                                      className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded flex items-center gap-1"
                                    >
                                      <span>{project.title}</span>
                                      {project.leader && (
                                        <span className="flex items-center gap-0.5 text-yellow-600 font-semibold" title={`Leader: ${project.leader}`}>
                                          <Crown className="w-3 h-3" />
                                          <span className="text-[10px]">{project.leader}</span>
                                        </span>
                                      )}
                                    </div>
                                  ))
                                ) : employee.projects && employee.projects.length > 0 ? (
                                  employee.projects.map((project, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                                    >
                                      {project}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-slate-500 text-xs sm:text-sm italic">No projects</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={10} className="px-3 sm:px-6 py-6 sm:py-8 text-center text-slate-500 text-xs sm:text-sm md:text-base">
                            {searchQuery ? `No employees found matching "${searchQuery}"` : 'No employee data available for the selected period'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Report Period Info */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl sm:rounded-2xl p-4 sm:p-5">
                <p className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Report Period:</p>
                {reportType === 'weekly' && reportData.weekStart ? (
                  <p className="text-gray-700 text-xs sm:text-sm">
                    <strong>Week:</strong> {new Date(reportData.weekStart).toLocaleDateString()} to{' '}
                    {new Date(reportData.weekEnd || '').toLocaleDateString()}
                  </p>
                ) : reportData.month ? (
                  <p className="text-gray-700 text-xs sm:text-sm">
                    <strong>Month:</strong> {new Date(reportData.year || 2024, (reportData.month || 1) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                ) : null}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Updates View */}
      {activeView === 'updates' && (
        <EmployeeUpdatesReport month={reportData?.month} year={reportData?.year} />
      )}

      {/* Empty State */}
      {!loading && !reportData && activeView === 'attendance' && (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 mb-4 sm:mb-6">
            <Calendar className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No Report Data</h3>
          <p className="text-gray-500 text-sm sm:text-base">Select a date or month to generate the report</p>
        </div>
      )}

      {/* Employee Detail Modal */}
      {showEmployeeModal && selectedEmployee && (
        <EmployeeDetailModal
          employeeId={selectedEmployee.employeeId}
          employeeName={selectedEmployee.employeeName}
          email={selectedEmployee.email}
          onClose={() => setShowEmployeeModal(false)}
          selectedMonth={reportData?.month}
          selectedYear={reportData?.year}
        />
      )}
    </div>
  );
}
