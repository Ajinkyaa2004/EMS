import { useNavigate } from 'react-router-dom';
import { Users, Shield, Eye, UserCheck, ArrowRight, Sparkles } from 'lucide-react';

export default function RoleSelection() {
  const navigate = useNavigate();

  const roles = [
    {
      id: 'admin',
      title: 'Admin',
      description: 'Manage projects, employees, and view analytics',
      icon: Shield,
      gradient: 'from-blue-500 via-blue-600 to-indigo-600',
      hoverGradient: 'hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700',
      shadowColor: 'hover:shadow-blue-500/50',
    },
    {
      id: 'employee',
      title: 'Employee',
      description: 'View assigned projects and post daily updates',
      icon: Users,
      gradient: 'from-green-500 via-emerald-600 to-teal-600',
      hoverGradient: 'hover:from-green-600 hover:via-emerald-700 hover:to-teal-700',
      shadowColor: 'hover:shadow-green-500/50',
    },
    {
      id: 'client',
      title: 'Client',
      description: 'View project progress and timelines',
      icon: Eye,
      gradient: 'from-purple-500 via-violet-600 to-indigo-600',
      hoverGradient: 'hover:from-purple-600 hover:via-violet-700 hover:to-indigo-700',
      shadowColor: 'hover:shadow-purple-500/50',
    },
    {
      id: 'applicant',
      title: 'Applicant',
      description: 'Apply for positions (Coming Soon)',
      icon: UserCheck,
      gradient: 'from-gray-400 via-gray-500 to-gray-600',
      disabled: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl w-full relative z-10">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-10 animate-fadeIn">
          <div className="inline-flex items-center justify-center gap-2 mb-3 px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to EMS
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 bg-clip-text text-transparent leading-normal pb-1">
            Employee Management System
          </h1>
          <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            Select your role to access your personalized dashboard
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          {roles.map((role, index) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => {
                  if (role.disabled) return;
                  navigate(`/login?role=${role.id}`);
                }}
                disabled={role.disabled}
                className={`group relative p-6 rounded-2xl transition-all duration-500 ease-out transform hover:-translate-y-1 ${
                  role.disabled
                    ? 'bg-gray-100 cursor-not-allowed opacity-60'
                    : 'bg-white shadow-lg hover:shadow-xl'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient Border Effect */}
                {!role.disabled && (
                  <div className={`absolute inset-0 bg-gradient-to-r ${role.gradient} rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 ease-out -z-10`}></div>
                )}

                {/* Icon Container */}
                <div className={`relative mb-4 mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center shadow-md transform transition-all duration-500 ease-out ${!role.disabled && 'group-hover:scale-105 group-hover:shadow-lg'}`}>
                  <Icon className="w-8 h-8 text-white" />
                  {!role.disabled && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                      <ArrowRight className="w-3 h-3 text-indigo-600" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:bg-clip-text transition-all duration-500 ease-out">
                    {role.title}
                  </h3>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    {role.description}
                  </p>
                </div>

                {/* Hover Indicator */}
                {!role.disabled && (
                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                    <span className="text-xs font-semibold text-indigo-600">Click to continue →</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="text-center animate-fadeIn">
          <div className="inline-block bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <p className="text-gray-700 mb-4 text-base font-medium">Don't have an account yet?</p>
            <button
              onClick={() => navigate('/register')}
              className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-md hover:shadow-xl transition-all duration-500 ease-out transform hover:-translate-y-0.5 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2 text-sm">
                Create Account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-500 ease-out" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
