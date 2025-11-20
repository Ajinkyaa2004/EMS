import { useEffect, useState } from 'react';
import { Zap, Calendar, TrendingUp, Target } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { getToken } from '../utils/auth';
import { API_BASE_URL } from '../config/api';

interface PointsSummary {
  totalPoints: number;
  monthlyPoints: number;
  monthlyCapRemaining: number;
  currentMonth: string;
  expiryDate: string;
  isActive: boolean;
}

export default function PointsSummary() {
  const [summary, setSummary] = useState<PointsSummary | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchPointsSummary();
  }, []);

  const fetchPointsSummary = async () => {
    try {
      setLoading(true);
      const token = getToken();
      if (!token) {
        toast.error('Please log in to view points');
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      const [summaryRes, historyRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/points/my-summary`, { headers }),
        axios.get(`${API_BASE_URL}/points/my-history?limit=10`, { headers }),
      ]);
      setSummary(summaryRes.data);
      setHistory(historyRes.data.transactions);
    } catch (error: any) {
      console.error('Failed to fetch points:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again');
      } else {
        toast.error('Failed to load points data');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const monthlyPercentage = (summary.monthlyPoints / 200) * 100;
  const isExpired = new Date(summary.expiryDate) < new Date();

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Main Points Card */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg shadow-md p-4 sm:p-6 text-white">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
            <h2 className="text-xl sm:text-2xl font-bold">EMS Points</h2>
          </div>
          {isExpired && (
            <span className="bg-red-500 text-white text-xs px-2.5 py-1 rounded-full">Expired</span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {/* Total Points */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4">
            <p className="text-purple-100 text-xs sm:text-sm mb-1">Total Points</p>
            <p className="text-3xl sm:text-4xl font-bold">{summary.totalPoints}</p>
            <p className="text-purple-200 text-xs mt-1.5 sm:mt-2">Lifetime accumulation</p>
          </div>

          {/* Monthly Points */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4">
            <p className="text-purple-100 text-xs sm:text-sm mb-1">This Month</p>
            <p className="text-3xl sm:text-4xl font-bold">{summary.monthlyPoints}</p>
            <div className="mt-2">
              <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-green-400 h-full transition-all duration-300"
                  style={{ width: `${Math.min(monthlyPercentage, 100)}%` }}
                ></div>
              </div>
              <p className="text-purple-200 text-xs mt-1">
                {summary.monthlyCapRemaining} remaining of 200
              </p>
            </div>
          </div>

          {/* Expiry Date */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:p-4">
            <p className="text-purple-100 text-xs sm:text-sm mb-1">Expiry</p>
            <p className="text-base sm:text-lg font-bold">
              {new Date(summary.expiryDate).toLocaleDateString()}
            </p>
            <p className="text-purple-200 text-xs mt-1.5 sm:mt-2">24-month validity</p>
          </div>
        </div>
      </div>

      {/* Monthly Progress Card */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Monthly Progress</h3>
          </div>
          <span className="text-xs sm:text-sm text-gray-600">{summary.currentMonth}</span>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-700 font-medium">Points earned</span>
              <span className="text-gray-900 font-bold">{summary.monthlyPoints}/200</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-full transition-all duration-500"
                style={{ width: `${Math.min(monthlyPercentage, 100)}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {summary.monthlyCapRemaining} points remaining until monthly cap
            </p>
          </div>
        </div>
      </div>

      {/* Points Activity */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Recent Activity</h3>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-xs sm:text-sm text-purple-600 hover:text-purple-800 font-medium"
          >
            {showHistory ? 'Hide' : 'Show'} Details
          </button>
        </div>

        {showHistory ? (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {history.length === 0 ? (
              <p className="text-gray-500 text-center py-4 text-sm">No activity yet</p>
            ) : (
              history.map((transaction, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-gray-50 rounded border border-gray-200">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 text-sm sm:text-base">{transaction.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString()}{' '}
                      {new Date(transaction.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="self-start sm:self-auto">
                    <span
                      className={`inline-block px-2.5 sm:px-3 py-1 rounded font-semibold text-xs sm:text-sm ${
                        transaction.points > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {transaction.points > 0 ? '+' : ''}{transaction.points}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Earned</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">{summary.totalPoints}</p>
            </div>
            <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">This Month</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">{summary.monthlyPoints}</p>
            </div>
          </div>
        )}
      </div>

      {/* Points Scoring Guide */}
      <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200">
        <div className="flex items-start gap-2">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">How to Earn Points</h4>
            <ul className="text-xs sm:text-sm text-gray-700 space-y-1">
              <li>📍 <strong>Attendance:</strong> +5 points (Present/WFH), +2 bonus (On-time), -1 (Late)</li>
              <li>📝 <strong>Daily Updates:</strong> +3 (Rich with attachments), +1 (Simple)</li>
              <li>✅ <strong>Tasks:</strong> +4 base + Priority bonus (+2 Medium, +5 High)</li>
              <li>🎯 <strong>Project Completion:</strong> +10 per employee, +10 early bonus</li>
              <li>🏆 <strong>Milestones:</strong> +20 (Standard), +30 (Premium)</li>
              <li>⚠️ <strong>Penalties:</strong> -20 to -100 (Admin assigned)</li>
            </ul>
            <p className="text-xs text-gray-600 mt-2 sm:mt-3">
              ℹ️ Monthly cap: 200 points | Expiry: 24 months
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
