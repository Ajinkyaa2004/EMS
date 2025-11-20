import { useState, useEffect } from 'react';
import { Calendar, Download, TrendingUp, Users, CheckCircle, AlertCircle, Clock, FileText } from 'lucide-react';
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
      toast.success('Weekly report loaded successfully');
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
      toast.success('Monthly report loaded successfully');
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

  return (
    <div className="space-y-6 p-6 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen rounded-lg">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            Aggregate Employee Reports
          </h2>
          <p className="text-slate-600 mt-1">View comprehensive attendance statistics for all employees</p>
        </div>
      </div>

      {/* View Selection Tabs */}
      <div className="flex gap-4 border-b border-gray-200 bg-white px-6 pt-6 rounded-t-lg">
        <button
          onClick={() => setActiveView('attendance')}
          className={`px-6 py-3 font-medium transition-all border-b-2 ${
            activeView === 'attendance'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Attendance Report
        </button>
        <button
          onClick={() => setActiveView('updates')}
          className={`px-6 py-3 font-medium transition-all border-b-2 ${
            activeView === 'updates'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Daily Updates
        </button>
      </div>

      {/* Attendance View */}
      {activeView === 'attendance' && (
        <div className="space-y-6">
          {/* Report Type Selection */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setReportType('weekly')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  reportType === 'weekly'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                📅 Weekly Report
              </button>
              <button
                onClick={() => setReportType('monthly')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  reportType === 'monthly'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                📊 Monthly Report
              </button>
            </div>

            {/* Date/Month Selector */}
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                {reportType === 'weekly' ? (
                  <>
                    <label className="text-sm font-medium text-slate-700">Week Start Date:</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={handleWeekStartChange}
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </>
                ) : (
                  <>
                    <label className="text-sm font-medium text-slate-700">Select Month:</label>
                    <input
                      type="month"
                      value={selectedMonth}
                      onChange={handleMonthChange}
                      className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </>
                )}
              </div>
              <button
                onClick={exportToCSV}
                disabled={loading}
                className="ml-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-all flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Report Summary Cards */}
          {reportData && !loading && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-medium">Total Employees</p>
                      <p className="text-3xl font-bold text-green-600">{reportData.employees?.length || 0}</p>
                    </div>
                    <Users className="w-8 h-8 text-green-600 opacity-50" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-medium">Avg Attendance Rate</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {reportData.employees?.length > 0
                          ? (
                              reportData.employees.reduce((sum, emp) => sum + (Number(emp.attendanceRate) || 0), 0) /
                              reportData.employees.length
                            ).toFixed(1)
                          : 0}
                        %
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-600 opacity-50" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-medium">Total Present</p>
                      <p className="text-3xl font-bold text-green-500">
                        {reportData.employees?.reduce((sum, emp) => sum + emp.present, 0) || 0}
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-600 text-sm font-medium">Total Absent</p>
                      <p className="text-3xl font-bold text-red-600">
                        {reportData.employees?.reduce((sum, emp) => sum + emp.absent, 0) || 0}
                      </p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-red-600 opacity-50" />
                  </div>
                </div>
              </div>

              {/* Employees Table */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                      <tr>
                        <th className="px-6 py-3 text-left font-semibold">Employee</th>
                        <th className="px-6 py-3 text-center font-semibold">Total Days</th>
                        <th className="px-6 py-3 text-center font-semibold">
                          <div className="flex items-center justify-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Present
                          </div>
                        </th>
                        <th className="px-6 py-3 text-center font-semibold">
                          <div className="flex items-center justify-center gap-1">
                            <Clock className="w-4 h-4" />
                            Late
                          </div>
                        </th>
                        <th className="px-6 py-3 text-center font-semibold">
                          <div className="flex items-center justify-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            Absent
                          </div>
                        </th>
                        <th className="px-6 py-3 text-center font-semibold">WFH</th>
                        <th className="px-6 py-3 text-center font-semibold">Half-day</th>
                        <th className="px-6 py-3 text-center font-semibold">On Leave</th>
                        <th className="px-6 py-3 text-center font-semibold">Attendance Rate</th>
                        <th className="px-6 py-3 text-left font-semibold">Projects</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {reportData.employees && reportData.employees.length > 0 ? (
                        reportData.employees.map((employee, index) => (
                          <tr 
                            key={employee.employeeId} 
                            className={`${index % 2 === 0 ? 'bg-slate-50' : 'bg-white'} hover:bg-blue-50 cursor-pointer transition-colors`}
                            onClick={() => {
                              setSelectedEmployee(employee);
                              setShowEmployeeModal(true);
                            }}
                          >
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-semibold text-slate-800">{employee.employeeName}</p>
                                <p className="text-sm text-slate-600">{employee.email}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center font-semibold text-slate-700">{employee.totalDays}</td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-3 py-1 rounded-full font-semibold ${getStatusColor('present')}`}>
                                {employee.present}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-3 py-1 rounded-full font-semibold ${getStatusColor('late')}`}>
                                {employee.late}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-3 py-1 rounded-full font-semibold ${getStatusColor('absent')}`}>
                                {employee.absent}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-3 py-1 rounded-full font-semibold ${getStatusColor('wfh')}`}>
                                {employee.wfh}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-3 py-1 rounded-full font-semibold ${getStatusColor('halfDay')}`}>
                                {employee.halfDay}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`px-3 py-1 rounded-full font-semibold ${getStatusColor('onLeave')}`}>
                                {employee.onLeave}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center">
                                <div className="w-24 bg-slate-200 rounded-full h-2 mr-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${Math.min(Number(employee.attendanceRate), 100)}%` }}
                                  ></div>
                                </div>
                                <span className="font-semibold text-slate-700">{employee.attendanceRate}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                {employee.projects && employee.projects.length > 0 ? (
                                  employee.projects.map((project, idx) => (
                                    <span
                                      key={idx}
                                      className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                                    >
                                      {project}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-slate-500 text-sm italic">No projects</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={10} className="px-6 py-8 text-center text-slate-500">
                            No employee data available for the selected period
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Report Period Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-slate-700">
                <p className="font-semibold mb-2">Report Period:</p>
                {reportType === 'weekly' && reportData.weekStart ? (
                  <p>
                    <strong>Week:</strong> {new Date(reportData.weekStart).toLocaleDateString()} to{' '}
                    {new Date(reportData.weekEnd || '').toLocaleDateString()}
                  </p>
                ) : reportData.month ? (
                  <p>
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
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">Select a date/month to generate the report</p>
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
