import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { API_BASE_URL } from '../../config/api';

interface HackathonLoginProps {
  onBack: () => void;
}

export default function HackathonLogin({ onBack }: HackathonLoginProps) {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('');
  const [isPlayer, setIsPlayer] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });

      const { token, user } = response.data;

      // Check if user is valid for hackathon
      if (isPlayer && user.role !== 'trainee') {
        toast.error('Only trainees can join as hackathon players');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('hackathonRole', isPlayer ? 'player' : 'admin');

      if (isPlayer) {
        navigate('/hackathon/player');
      } else {
        navigate('/hackathon/admin');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white mb-6 hover:opacity-80 transition-opacity"
        >
          <span>← Back to Role Selection</span>
        </button>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-3xl">🚀</div>
              <h1 className="text-3xl font-bold">Hackathon</h1>
            </div>
            <p className="text-purple-100">
              {isPlayer ? 'Join as Hackathon Player' : 'Admin Dashboard'}
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Login as:
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPlayer(true)}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                      isPlayer
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🎮 Player
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPlayer(false)}
                    className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                      !isPlayer
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    👨‍💼 Admin
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Sign In'}
              </button>
            </form>

            {/* Info */}
            <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-700">
                <strong>Demo Account:</strong>
                <br />
                Email: admin@example.com
                <br />
                Use your registered credentials
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
