import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, ArrowLeft, Sparkles, LogIn, Trophy } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'admin';
  const [role, setRole] = useState(initialRole);

  const getRoleDetails = () => {
    switch (role) {
      case 'admin':
        return { name: 'Admin', gradient: 'from-blue-600 to-indigo-600', icon: '🛡️' };
      case 'employee':
        return { name: 'Employee', gradient: 'from-green-600 to-teal-600', icon: '👤' };
      case 'freelancer':
        return { name: 'Freelancer', gradient: 'from-orange-600 to-red-600', icon: '💼' };
      case 'trainee':
        return { name: 'Trainee', gradient: 'from-pink-600 to-rose-600', icon: '🎓' };
      case 'hackathon':
        return { name: 'Hackathon', gradient: 'from-yellow-600 to-orange-600', icon: '🏆' };
      case 'client':
        return { name: 'Client', gradient: 'from-purple-600 to-indigo-600', icon: '👁️' };
      default:
        return { name: 'User', gradient: 'from-blue-600 to-indigo-600', icon: '✨' };
    }
  };

  const roleDetails = getRoleDetails();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (role === 'hackathon') {
        // For hackathon, store user info and redirect to player dashboard
        localStorage.setItem('token', 'hackathon-token');
        localStorage.setItem('user', JSON.stringify({ email, hackathonMode: true }));
        navigate('/hackathon/player');
      } else {
        await login(email, password);
        navigate(`/${role}/dashboard`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md animate-fadeIn">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="group flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-6 transition-all duration-300 ease-out"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300 ease-out" />
          <span className="text-sm font-medium">Back to Role Selection</span>
        </button>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header with Gradient */}
          <div className={`bg-gradient-to-r ${roleDetails.gradient} px-6 py-8 text-white relative overflow-hidden`}>
            <div className="absolute top-0 right-0 text-6xl opacity-10">{roleDetails.icon}</div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full mb-3">
                <Sparkles className="w-3 h-3" />
                <span className="text-xs font-semibold">Welcome Back</span>
              </div>
              <h1 className="text-3xl font-bold mb-1">Sign In</h1>
              <p className="text-white/90 text-sm">Login as {roleDetails.name}</p>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-slideDown">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all duration-300 ease-out hover:border-gray-400"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-all duration-300 ease-out hover:border-gray-400"
                    required
                  />
                </div>
              </div>

              {/* Role Switch for Employee/Freelancer/Trainee/Hackathon */}
              {(initialRole === 'employee') && (
                <div className="border border-indigo-200 rounded-xl p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
                  <p className="text-xs font-semibold text-gray-700 mb-3">Login as:</p>
                  <div className="grid grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('employee')}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 ease-out ${
                        role === 'employee'
                          ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-md'
                          : 'bg-white border border-green-300 text-green-700 hover:border-green-400'
                      }`}
                    >
                      Employee
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('freelancer')}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 ease-out ${
                        role === 'freelancer'
                          ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-md'
                          : 'bg-white border border-orange-300 text-orange-700 hover:border-orange-400'
                      }`}
                    >
                      Freelancer
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('trainee')}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 ease-out ${
                        role === 'trainee'
                          ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md'
                          : 'bg-white border border-pink-300 text-pink-700 hover:border-pink-400'
                      }`}
                    >
                      Trainee
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('hackathon')}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 ease-out flex items-center justify-center gap-1 ${
                        role === 'hackathon'
                          ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-md'
                          : 'bg-white border border-yellow-300 text-yellow-700 hover:border-yellow-400'
                      }`}
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      <span>Hackathon</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-gradient-to-r ${roleDetails.gradient} text-white py-2.5 rounded-lg font-semibold shadow-md hover:shadow-xl transition-all duration-500 ease-out transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-md flex items-center justify-center gap-2 text-sm mt-6`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Create Account Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Don't have an account?{' '}
                <button
                  onClick={() => navigate(`/register?role=${role}`)}
                  className="text-indigo-600 hover:text-indigo-700 font-semibold transition-all duration-300 ease-out"
                >
                  Create one
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
