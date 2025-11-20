import { useEffect, useState } from 'react';
import { Award, BarChart3, AlertTriangle, Plus, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { getToken } from '../utils/auth';

interface EmployeePoints {
  rank: number;
  employeeId: string;
  employeeName: string;
  email: string;
  totalPoints: number;
  monthlyPoints: number;
  currentMonth: string;
  isActive: boolean;
  expiryDate: string;
  transactionCount: number;
  lastTransaction?: string;
}

interface SystemSummary {
  totalEmployees: number;
  totalPointsDistributed: number;
  averagePointsPerEmployee: number;
  maxPoints: number;
  minPoints: number;
  activeEmployees: number;
}

export default function AdminPointsManagement() {
  const [pointsList, setPointsList] = useState<EmployeePoints[]>([]);
  const [summary, setSummary] = useState<SystemSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [showPenaltyForm, setShowPenaltyForm] = useState(false);
  const [penaltyForm, setPenaltyForm] = useState({
    employeeId: '',
    penaltyAmount: 20,
    reason: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'points' | 'name' | 'monthly'>('points');

  useEffect(() => {
    fetchPointsData();
  }, []);

  const fetchPointsData = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };
      const [pointsRes, summaryRes] = await Promise.all([
        axios.get('/api/points/admin/all', { headers }),
        axios.get('/api/points/admin/summary', { headers }),
      ]);
      setPointsList(pointsRes.data.points);
      setSummary(summaryRes.data.systemSummary);
    } catch (error) {
      console.error('Failed to fetch points data:', error);
      toast.error('Failed to load points data');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPenalty = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!penaltyForm.employeeId || !penaltyForm.reason) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const token = getToken();
      await axios.post('/api/points/admin/penalty', {
        employeeId: penaltyForm.employeeId,
        penaltyAmount: penaltyForm.penaltyAmount,
        reason: penaltyForm.reason,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success('Penalty applied successfully');
      setPenaltyForm({ employeeId: '', penaltyAmount: 20, reason: '' });
      setShowPenaltyForm(false);
      fetchPointsData(); // Refresh data
    } catch (error) {
      console.error('Failed to apply penalty:', error);
      toast.error('Failed to apply penalty');
    }
  };

  const filteredList = pointsList
    .filter(emp => 
      emp.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'points') return b.totalPoints - a.totalPoints;
      if (sortBy === 'monthly') return b.monthlyPoints - a.monthlyPoints;
      return a.employeeName.localeCompare(b.employeeName);
    });

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* System Summary */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 text-white rounded-lg p-4 shadow-md">
            <p className="text-purple-200 text-sm mb-1">Total Employees</p>
            <p className="text-3xl font-bold">{summary.totalEmployees}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-lg p-4 shadow-md">
            <p className="text-blue-200 text-sm mb-1">Points Distributed</p>
            <p className="text-3xl font-bold">{summary.totalPointsDistributed}</p>
          </div>
          <div className="bg-gradient-to-br from-green-600 to-green-800 text-white rounded-lg p-4 shadow-md">
            <p className="text-green-200 text-sm mb-1">Avg Per Employee</p>
            <p className="text-3xl font-bold">{Math.round(summary.averagePointsPerEmployee)}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 text-white rounded-lg p-4 shadow-md">
            <p className="text-yellow-200 text-sm mb-1">Active Employees</p>
            <p className="text-3xl font-bold">{summary.activeEmployees}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-600 to-orange-800 text-white rounded-lg p-4 shadow-md">
            <p className="text-orange-200 text-sm mb-1">Range</p>
            <p className="text-sm font-bold mt-2">
              {summary.minPoints} - {summary.maxPoints}
            </p>
          </div>
        </div>
      )}

      {/* Training Employees Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border-2 border-indigo-300 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">👨‍🎓</span>
            <h3 className="font-bold text-indigo-900">Training Employees</h3>
          </div>
          <p className="text-3xl font-bold text-indigo-700">
            {pointsList.filter(emp => emp.totalPoints < 100).length}
          </p>
          <p className="text-sm text-indigo-600 mt-1">Employees with &lt; 100 points</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-4 border-2 border-cyan-300 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">⭐</span>
            <h3 className="font-bold text-cyan-900">Employee Points</h3>
          </div>
          <p className="text-3xl font-bold text-cyan-700">
            {pointsList.length > 0 ? pointsList[0]?.totalPoints : 0}
          </p>
          <p className="text-sm text-cyan-600 mt-1">Top performer's total points</p>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-lg p-4 border-2 border-rose-300 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">🏆</span>
            <h3 className="font-bold text-rose-900">Top Employee</h3>
          </div>
          <p className="text-lg font-bold text-rose-700 truncate">
            {pointsList.length > 0 ? pointsList[0]?.employeeName : 'N/A'}
          </p>
          <p className="text-sm text-rose-600 mt-1">Based on total points</p>
        </div>
      </div>

      {/* Controls and Search */}
      <div className="bg-white rounded-lg shadow-md p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
        >
          <option value="points">Sort by Total</option>
          <option value="monthly">Sort by Monthly</option>
          <option value="name">Sort by Name</option>
        </select>
        <button
          onClick={() => setShowPenaltyForm(!showPenaltyForm)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          <AlertTriangle className="w-4 h-4" />
          Apply Penalty
        </button>
        <button
          onClick={fetchPointsData}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          Refresh
        </button>
      </div>

      {/* Penalty Form */}
      {showPenaltyForm && (
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <form onSubmit={handleApplyPenalty} className="space-y-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Apply Penalty to Employee
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={penaltyForm.employeeId}
                onChange={(e) => setPenaltyForm({ ...penaltyForm, employeeId: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                <option value="">Select Employee</option>
                {pointsList.map(emp => (
                  <option key={emp.employeeId} value={emp.employeeId}>
                    {emp.employeeName} ({emp.email})
                  </option>
                ))}
              </select>
              <select
                value={penaltyForm.penaltyAmount}
                onChange={(e) => setPenaltyForm({ ...penaltyForm, penaltyAmount: parseInt(e.target.value) })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                <option value="20">-20 Points (Minor)</option>
                <option value="50">-50 Points (Moderate)</option>
                <option value="100">-100 Points (Major)</option>
              </select>
              <input
                type="text"
                placeholder="Reason for penalty..."
                value={penaltyForm.reason}
                onChange={(e) => setPenaltyForm({ ...penaltyForm, reason: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Apply Penalty
              </button>
              <button
                type="button"
                onClick={() => setShowPenaltyForm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Points Leaderboard Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-800">Employee Points Ranking</h3>
          <span className="ml-auto text-sm text-gray-600">{filteredList.length} employees</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rank</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Employee Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Total Points 🎯</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Monthly 📅</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Level</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Expiry</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    No employees found
                  </td>
                </tr>
              ) : (
                filteredList.map(emp => {
                  const isTraining = emp.totalPoints < 100;
                  const isDeveloping = emp.totalPoints >= 100 && emp.totalPoints < 200;
                  const isExperienced = emp.totalPoints >= 200;
                  
                  return (
                    <tr key={emp.employeeId} className="border-b border-gray-200 hover:bg-gray-50 transition">
                      <td className="px-4 py-3">
                        <div className="text-center">
                          {emp.rank === 1 && <span className="text-2xl">🥇</span>}
                          {emp.rank === 2 && <span className="text-2xl">🥈</span>}
                          {emp.rank === 3 && <span className="text-2xl">🥉</span>}
                          {emp.rank > 3 && <span className="font-bold text-purple-600">#{emp.rank}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">{emp.employeeName}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-600">{emp.email}</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <p className="text-lg font-bold text-purple-600">{emp.totalPoints}</p>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="text-sm text-gray-700">
                          <p className="font-semibold">{emp.monthlyPoints}/200</p>
                          <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-blue-500 h-full rounded-full"
                              style={{ width: `${(emp.monthlyPoints / 200) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {emp.isActive ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                            Expired
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isTraining && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
                            👨‍🎓 Training
                          </span>
                        )}
                        {isDeveloping && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                            📈 Developing
                          </span>
                        )}
                        {isExperienced && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                            ⭐ Experienced
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">
                        {new Date(emp.expiryDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setSelectedEmployee(selectedEmployee === emp.employeeId ? null : emp.employeeId)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          <ChevronDown className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scoring Guide */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h3 className="font-semibold text-gray-800 mb-3">Points System Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <p className="font-semibold mb-2">📍 Attendance Points</p>
            <ul className="space-y-1">
              <li>• Present/WFH: +5 points</li>
              <li>• On-time bonus: +2 points</li>
              <li>• Late: -1 point</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-2">📝 Updates & Tasks</p>
            <ul className="space-y-1">
              <li>• Rich Update: +3 points</li>
              <li>• Simple Update: +1 point</li>
              <li>• Task Completion: +4 + priority bonus</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-2">🎯 Projects & Milestones</p>
            <ul className="space-y-1">
              <li>• Project Completion: +10 per employee</li>
              <li>• Early Completion: +10 bonus</li>
              <li>• Milestones: +20 to +30</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-2">⚙️ System Rules</p>
            <ul className="space-y-1">
              <li>• Monthly Cap: 200 points</li>
              <li>• Expiry: 24 months</li>
              <li>• Penalties: -20 to -100</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
