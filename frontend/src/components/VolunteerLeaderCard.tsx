import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { API_BASE_URL } from '../config/api';
import { Trophy, AlertCircle, CheckCircle, Clock, XCircle, Flame, Crown } from 'lucide-react';

interface AvailableProject {
  _id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: string;
  startDate: string;
  endDate: string;
  hasVolunteered: boolean;
  volunteerStatus?: 'pending' | 'accepted' | 'rejected' | 'completed';
  hasLeader: boolean;
  projectLeader?: {
    firstName: string;
    lastName: string;
  };
}

const VolunteerLeaderCard: React.FC = () => {
  const [availableProjects, setAvailableProjects] = useState<AvailableProject[]>([]);
  const [loading, setLoading] = useState(false);

  const getToken = () => {
    const role = window.location.pathname.split('/')[1];
    return sessionStorage.getItem(`auth_${role}_token`);
  };

  useEffect(() => {
    fetchAvailableProjects();
  }, []);

  const fetchAvailableProjects = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/volunteer-leader/available-projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAvailableProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch available projects:', error);
    }
  };

  const handleVolunteer = async (projectId: string) => {
    setLoading(true);
    try {
      const token = getToken();
      const response = await axios.post(
        `${API_BASE_URL}/volunteer-leader/volunteer/${projectId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('🎉 ' + response.data.message);
      fetchAvailableProjects();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to volunteer');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'accepted': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'completed': return <Trophy className="w-4 h-4" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Volunteer as Leader</h2>
            <p className="text-sm text-gray-600">Take charge & earn 2x points!</p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-orange-900 mb-1">Risk & Reward System:</p>
            <p className="text-orange-800">
              ✅ <strong>Success:</strong> Earn <strong className="text-green-600">+2x points</strong> for completing the project successfully<br />
              ❌ <strong>Failure:</strong> Lose <strong className="text-red-600">-2x points</strong> if the project fails
            </p>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Projects ({availableProjects.length})</h3>
        {availableProjects.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No projects assigned to you</p>
            <p className="text-sm mt-2">Projects you're assigned to will appear here</p>
          </div>
        ) : (
          availableProjects.map((project) => (
              <div key={project._id} className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg text-gray-900">{project.title}</h3>
                      {project.hasLeader && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                          <Crown className="w-3 h-3" />
                          Has Leader
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                    {project.hasLeader && project.projectLeader && (
                      <p className="text-xs text-purple-600 mt-1">
                        Current Leader: {project.projectLeader.firstName} {project.projectLeader.lastName}
                      </p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                    {project.priority.toUpperCase()}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>Status: <strong>{project.status}</strong></span>
                    <span>Start: {new Date(project.startDate).toLocaleDateString()}</span>
                  </div>

                  {project.hasVolunteered ? (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${getStatusColor(project.volunteerStatus!)}`}>
                      {getStatusIcon(project.volunteerStatus!)}
                      <span className="text-sm font-medium capitalize">{project.volunteerStatus}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleVolunteer(project._id)}
                      disabled={loading}
                      className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : '🔥 Volunteer'}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
    </div>
  );
};

export default VolunteerLeaderCard;