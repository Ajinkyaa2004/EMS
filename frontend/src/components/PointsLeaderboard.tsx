import { useEffect, useState } from 'react';
import { Award } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { getToken } from '../utils/auth';

interface LeaderboardEntry {
  rank: number;
  employeeName: string;
  email: string;
  totalPoints: number;
  monthlyPoints: number;
  recentActivity: any[];
}

export default function PointsLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await axios.get('/api/points/leaderboard?limit=10', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaderboard(response.data.leaderboard);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Points Leaderboard</h2>
        </div>
        <button
          onClick={fetchLeaderboard}
          className="px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm sm:text-base"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-6 sm:py-8">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-gray-300 border-t-purple-600 rounded-full"></div>
          <p className="mt-2 text-gray-500 text-sm">Loading leaderboard...</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-6 sm:py-8 text-gray-500 text-sm">
          No leaderboard data available yet.
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {leaderboard.map((entry, index) => (
            <div
              key={index}
              className={`p-3 sm:p-4 rounded-lg border-2 ${
                entry.rank === 1
                  ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-transparent'
                  : entry.rank === 2
                  ? 'border-gray-400 bg-gradient-to-r from-gray-50 to-transparent'
                  : entry.rank === 3
                  ? 'border-orange-400 bg-gradient-to-r from-orange-50 to-transparent'
                  : 'border-blue-200 bg-blue-50/30'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3 sm:gap-4 flex-1">
                  <div className={`text-xl sm:text-2xl font-bold w-8 sm:w-10 text-center flex-shrink-0`}>
                    {getMedalIcon(entry.rank)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">{entry.employeeName}</h3>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">{entry.email}</p>
                  </div>
                </div>
                <div className="flex sm:flex-row gap-2 sm:gap-4">
                  <div className="bg-white rounded-lg p-2 sm:p-3 border border-purple-200 flex-1 sm:flex-none">
                    <p className="text-xs text-gray-600">Total Points</p>
                    <p className="text-xl sm:text-2xl font-bold text-purple-600">{entry.totalPoints}</p>
                  </div>
                  <div className="bg-white rounded-lg p-2 sm:p-3 border border-blue-200 flex-1 sm:flex-none">
                    <p className="text-xs text-gray-600">This Month</p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-600">{entry.monthlyPoints}</p>
                  </div>
                </div>
              </div>
              {entry.recentActivity.length > 0 && (
                <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-500 mb-1 sm:mb-2">Recent Activity:</p>
                  <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                    {entry.recentActivity.slice(0, 3).map((activity, i) => (
                      <span key={i} className="text-xs bg-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded border border-gray-200 truncate max-w-[120px] sm:max-w-none">
                        {activity.description.substring(0, 30)}...
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
