import { useAuth } from '../../context/AuthContext';
import { LogOut, Eye, Calendar, Users, CheckCircle, AlertCircle, Send, Mail, Menu, X, FolderOpen, BarChart3, MessageSquare, ChevronLeft, ChevronRight, Video, Clock, Timer, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function ClientDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('projects');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [clientMessages, setClientMessages] = useState<any[]>([]);
  const [adminReplies, setAdminReplies] = useState<any[]>([]);
  const [dashboardMessages, setDashboardMessages] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [selectedReply, setSelectedReply] = useState<any>(null);
  const [readReplies, setReadReplies] = useState<Set<number>>(new Set());
  const [messageForm, setMessageForm] = useState({
    subject: '',
    content: '',
  });

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const fetchMeetings = () => {
    const storedMeetings = localStorage.getItem('meetings');
    if (storedMeetings) {
      const allMeetings = JSON.parse(storedMeetings);
      console.log('All meetings:', allMeetings);
      console.log('Current user ID:', user?.id);
      console.log('User object:', user);
      setMeetings(allMeetings);
    } else {
      console.log('No meetings found in localStorage');
    }
  };

  // Load admin replies when component mounts
  useEffect(() => {
    const loadData = () => {
      let allReplies = JSON.parse(localStorage.getItem('allClientReplies') || '[]');
      
      // Add sample replies if none exist
      if (allReplies.length === 0) {
        allReplies = [
        {
          _id: 1,
          messageId: 1,
          adminReply: 'Hi John,\n\nThank you for reaching out! We\'re making excellent progress on the website redesign. The homepage mockups are 85% complete and will be ready for your review by end of this week.\n\nThe current timeline remains on track for the December 31st deadline.\n\nBest regards,\nProject Manager',
          repliedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
          adminName: 'John Wilson',
        },
        {
          _id: 2,
          messageId: 2,
          adminReply: 'Hi Sarah,\n\nThank you for informing us about the scope changes. We\'d be happy to discuss this with you.\n\nBased on the requirements you mentioned, we estimate an additional 40 hours of development work. This would add approximately $2,800 to the project cost.\n\nWould you like to schedule a meeting for tomorrow at 2 PM?\n\nRegards,\nBilling Team',
          repliedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
          adminName: 'Jane Davis',
        },
        {
          _id: 3,
          messageId: 3,
          adminReply: 'URGENT - We have received your alert and our senior database administrator is currently investigating the performance issues.\n\nInitial analysis suggests query optimization on the migration scripts is needed. We expect to have a fix deployed within the next 2 hours.\n\nWe will keep you updated every 30 minutes. Our emergency contact: +1-555-0123\n\nThank you for your patience!\nEmergency Response Team',
          repliedAt: new Date(Date.now() - 7 * 60 * 60 * 1000),
          adminName: 'Mike Johnson',
        },
        {
          _id: 4,
          messageId: 4,
          adminReply: 'Hi Emily,\n\nThank you so much for the kind words! It was a pleasure working with your team on the API integration project. Your team\'s clear communication and feedback made the development process smooth and efficient.\n\nWe look forward to supporting your future projects as well. Please don\'t hesitate to reach out if you need anything!\n\nBest regards,\nProject Team',
          repliedAt: new Date(Date.now() - 22 * 60 * 60 * 1000),
          adminName: 'Sarah Chen',
        },
      ];
      localStorage.setItem('allClientReplies', JSON.stringify(allReplies));
    }
    
    setAdminReplies(allReplies);
    
    // Load read status
    const readRepliesData = JSON.parse(localStorage.getItem('readClientReplies') || '[]');
    setReadReplies(new Set(readRepliesData));
    
    // Load dashboard messages from admin
    const allDashboardMessages = JSON.parse(localStorage.getItem('allDashboardMessages') || '[]');
    setDashboardMessages(allDashboardMessages);

    // Load meetings from localStorage
    fetchMeetings();
    };

    // Initial load
    loadData();

    // Auto-refresh data every 5 seconds for real-time updates
    const interval = setInterval(() => {
      loadData();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Sample project data for client
  const projects = [
    {
      id: 1,
      name: 'Website Redesign',
      description: 'Complete redesign of company website with modern UI/UX',
      progress: 65,
      status: 'In Progress',
      startDate: '2025-10-01',
      endDate: '2025-12-31',
      team: ['John Doe', 'Jane Smith', 'Mike Johnson'],
      updates: 12,
      nextMilestone: 'Frontend Complete',
      daysRemaining: 45,
    },
    {
      id: 2,
      name: 'Mobile App Development',
      description: 'Native iOS and Android mobile application',
      progress: 70,
      status: 'In Progress',
      startDate: '2025-11-01',
      endDate: '2026-01-15',
      team: ['Alice Brown', 'Bob Wilson', 'Carol Davis', 'David Lee'],
      updates: 8,
      nextMilestone: 'API Integration',
      daysRemaining: 75,
    },
    {
      id: 3,
      name: 'Database Migration',
      description: 'Migration from legacy database to modern cloud solution',
      progress: 90,
      status: 'In Progress',
      startDate: '2025-09-15',
      endDate: '2025-11-30',
      team: ['Eve Martinez', 'Frank Garcia'],
      updates: 15,
      nextMilestone: 'Testing & Validation',
      daysRemaining: 14,
    },
  ];

  const menuItems = [
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'meetings', label: 'Meetings', icon: Video },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-white shadow-xl transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-20'
      } ${mobileMenuOpen ? 'translate-x-0 z-50' : '-translate-x-full lg:translate-x-0'} lg:z-30`}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {sidebarOpen ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">Client</h2>
                    <p className="text-xs text-gray-500">Dashboard</p>
                  </div>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg mx-auto">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            )}
          </div>

          {/* Toggle Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-white border-2 border-gray-200 rounded-full items-center justify-center hover:bg-gray-50 transition-colors shadow-md z-10"
          >
            {sidebarOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  } ${!sidebarOpen && 'justify-center'}`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                  {sidebarOpen && <span className="font-medium text-sm sm:text-base">{item.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center">
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-700" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Client Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Welcome back, {user?.firstName}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-3 sm:p-4 lg:p-6 xl:p-8">
        {/* Projects Tab */}
        {activeTab === 'projects' && (
        <div className="space-y-6 animate-fadeIn">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {[
              { label: 'Total Projects', value: projects.length.toString(), gradient: 'from-purple-500 to-purple-600', icon: FolderOpen, iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
              { label: 'Active Projects', value: projects.filter(p => p.status === 'In Progress').length.toString(), gradient: 'from-blue-500 to-blue-600', icon: BarChart3, iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
              { label: 'Avg Progress', value: `${Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length || 0)}%`, gradient: 'from-green-500 to-green-600', icon: CheckCircle, iconBg: 'bg-green-100', iconColor: 'text-green-600' },
              { label: 'Team Members', value: Array.from(new Set(projects.flatMap(p => p.team))).length.toString(), gradient: 'from-orange-500 to-orange-600', icon: Users, iconBg: 'bg-orange-100', iconColor: 'text-orange-600' },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={idx} 
                  className="group bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
               <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className={`${stat.iconBg} w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-5 h-5 sm:w-7 sm:h-7 ${stat.iconColor}`} />
                    </div>
                  </div>
                  <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1 sm:mb-2">{stat.label}</p>
                  <p className="text-2xl sm:text-4xl font-bold text-gray-900">{stat.value}</p>
                </div>
              );
            })}
          </div>
          {/* Projects Section */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Your Projects</h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Track progress and monitor all your projects</p>
            </div>
            <div className="p-3 sm:p-4 lg:p-6">
          
          {projects.length === 0 ? (
            <div className="text-center py-16 sm:py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 mb-6">
                <Eye className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">No Projects Yet</h3>
              <p className="text-gray-500 text-sm sm:text-base mb-6 max-w-md mx-auto">Projects will appear here once assigned by the admin team.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div 
                  key={project.id} 
                  className="group bg-gradient-to-br from-gray-50 to-purple-50/30 rounded-xl p-4 sm:p-5 hover:shadow-lg hover:scale-[1.01] sm:hover:scale-[1.02] transition-all duration-300 cursor-pointer border border-gray-100 hover:border-purple-200"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-3">
                    <div className="flex-1 w-full">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors mb-2">{project.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {project.startDate} - {project.endDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {project.team.length} team members
                        </span>
                        <span className="flex items-center gap-1 text-green-600 font-semibold">
                          <CheckCircle className="w-4 h-4" />
                          {project.daysRemaining} days left
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <span className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                        project.status === 'In Progress' ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-200' : 'bg-green-100 text-green-700 ring-2 ring-green-200'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                      <span className="text-sm font-bold text-purple-600">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-indigo-600 h-full transition-all duration-500 rounded-full"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white/60 backdrop-blur rounded-lg p-3 border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Next Milestone</p>
                      <p className="text-sm font-semibold text-gray-900">{project.nextMilestone}</p>
                    </div>
                    <div className="bg-white/60 backdrop-blur rounded-lg p-3 border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Updates</p>
                      <p className="text-sm font-semibold text-gray-900">{project.updates} total</p>
                    </div>
                    <div className="bg-white/60 backdrop-blur rounded-lg p-3 border border-gray-200 col-span-2">
                      <p className="text-xs text-gray-600 mb-2">Team</p>
                      <div className="flex gap-1">
                        {project.team.slice(0, 4).map((member, idx) => (
                          <div key={idx} className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-xs text-white font-bold shadow-md" title={member}>
                            {member.charAt(0)}
                          </div>
                        ))}
                        {project.team.length > 4 && (
                          <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-xs text-white font-bold shadow-md">
                            +{project.team.length - 4}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
            </div>
          </div>
        </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="space-y-4 sm:space-y-6 animate-fadeIn">
            {/* Send Message Form */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Contact Admin</h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Send a message to the admin team</p>
              </div>
              <div className="p-4 sm:p-6">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!messageForm.subject || !messageForm.content) {
                    toast.error('Please fill in all fields');
                    return;
                  }
                  const newMessage = {
                    _id: Date.now(),
                    subject: messageForm.subject,
                    content: messageForm.content,
                    sentAt: new Date(),
                    sender: `${user?.firstName} ${user?.lastName}`,
                    clientId: user?._id,
                    clientName: user?.firstName + ' ' + user?.lastName,
                  };
                  setClientMessages([newMessage, ...clientMessages]);
                  
                  const allClientMessages = JSON.parse(localStorage.getItem('allClientMessages') || '[]');
                  allClientMessages.unshift(newMessage);
                  localStorage.setItem('allClientMessages', JSON.stringify(allClientMessages));
                  
                  setMessageForm({ subject: '', content: '' });
                  toast.success('Message sent to admin successfully!');
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Subject</label>
                  <input
                    type="text"
                    value={messageForm.subject}
                    onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
                    placeholder="Message subject..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Message</label>
                  <textarea
                    value={messageForm.content}
                    onChange={(e) => setMessageForm({ ...messageForm, content: e.target.value })}
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-white transition-all resize-none"
                    rows={5}
                    placeholder="Type your message here..."
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-[1.01] flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  Send Message
                </button>
              </form>
              </div>
            </div>

            {/* Admin Dashboard Messages */}
            {dashboardMessages.length > 0 && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    Admin Messages
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">Messages from the admin team</p>
                </div>
                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 max-h-[600px] overflow-y-auto">
                  {dashboardMessages.map((msg: any) => (
                    <div 
                      key={msg._id} 
                      className="group bg-gradient-to-br from-blue-50 to-indigo-50/30 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-200 hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-3">
                        <div className="flex-1 w-full">
                          <p className="text-blue-700 font-semibold text-sm sm:text-base">{msg.subject}</p>
                          <p className="text-gray-600 text-xs sm:text-sm">From: Admin ({msg.sender?.firstName} {msg.sender?.lastName})</p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="bg-blue-600 text-white text-xs px-2 sm:px-3 py-1 rounded-full font-medium flex items-center gap-1">
                            📧 {msg.app}
                          </span>
                          <span className={`text-xs px-2 sm:px-3 py-1 rounded-full font-medium ${
                            msg.status === 'read' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {msg.status === 'read' ? 'Read' : 'Unread'}
                          </span>
                        </div>
                      </div>
                      <div className="bg-white/80 backdrop-blur rounded-lg p-3 sm:p-4 mb-2 border-l-4 border-blue-500">
                        <p className="text-gray-700 text-xs sm:text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      <p className="text-gray-500 text-xs flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {new Date(msg.createdAt || msg.sentAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Your Messages */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Your Messages</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Messages you've sent to admin</p>
              </div>
              <div className="p-4 sm:p-6">
              {clientMessages.length === 0 ? (
                <div className="text-center py-12 sm:py-16">
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 mb-4">
                    <MessageSquare className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Messages Yet</h3>
                  <p className="text-gray-500 text-sm sm:text-base">Use the form above to send your first message to admin</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {clientMessages.map((msg: any) => (
                    <div key={msg._id} className="bg-gradient-to-br from-gray-50 to-purple-50/20 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-3">
                        <div className="flex-1 w-full">
                          <p className="text-gray-900 font-semibold text-sm sm:text-base break-words">{msg.subject}</p>
                          <p className="text-gray-600 text-xs sm:text-sm">From: {msg.sender}</p>
                        </div>
                        <span className="self-start bg-green-100 text-green-700 text-xs px-2 sm:px-3 py-1 rounded-full font-medium whitespace-nowrap">Sent</span>
                      </div>
                      <div className="bg-white/60 rounded-lg p-3 mb-2 border-l-4 border-purple-500">
                        <p className="text-gray-700 text-xs sm:text-sm break-words whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      <p className="text-gray-500 text-xs flex items-center gap-2">
                        <Clock className="w-3 h-3" />
                        {new Date(msg.sentAt).toLocaleString()}
                      </p>
                      
                      {adminReplies.filter((r: any) => r.messageId === msg._id).length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-green-600 text-xs sm:text-sm font-semibold mb-2 flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Admin Reply:
                          </p>
                          {adminReplies.filter((r: any) => r.messageId === msg._id).map((reply: any) => (
                            <div key={reply._id} className="bg-green-50 rounded-lg p-3 sm:p-4 border-l-4 border-green-500">
                              <p className="text-gray-700 text-xs sm:text-sm whitespace-pre-wrap break-words">{reply.adminReply}</p>
                              <p className="text-gray-600 text-xs mt-2">
                                <span className="font-semibold">From:</span> {reply.adminName} • {new Date(reply.repliedAt).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              </div>
            </div>

            {/* Admin Replies Section */}
            {adminReplies.length > 0 && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                        Recent Admin Replies
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">Replies from the admin team</p>
                    </div>
                    <button
                      onClick={() => {
                        setReadReplies(new Set());
                        localStorage.setItem('readClientReplies', JSON.stringify([]));
                        toast.success('All replies marked as unread');
                      }}
                      className="text-xs sm:text-sm bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-all font-medium whitespace-nowrap"
                    >
                      Mark all as Unread
                    </button>
                  </div>
                </div>
                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 max-h-[600px] overflow-y-auto">
                  {adminReplies.map((reply: any) => {
                    const originalMsg = clientMessages.find((m: any) => m._id === reply.messageId);
                    const isRead = readReplies.has(reply._id);
                    return (
                      <div 
                        key={reply._id} 
                        onClick={() => {
                          setSelectedReply(reply);
                          const newReadReplies = new Set(readReplies);
                          newReadReplies.add(reply._id);
                          setReadReplies(newReadReplies);
                          localStorage.setItem('readClientReplies', JSON.stringify(Array.from(newReadReplies)));
                        }}
                        className={`rounded-lg sm:rounded-xl p-3 sm:p-4 border cursor-pointer transition-all ${
                          isRead 
                            ? 'bg-gradient-to-br from-gray-50 to-green-50/20 border-green-200 hover:border-green-300' 
                            : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-400 hover:border-green-500 shadow-md'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                          <div className="flex-1 w-full">
                            <p className="text-green-700 font-semibold text-sm sm:text-base break-words">{originalMsg?.subject || 'Message'}</p>
                            <p className="text-gray-600 text-xs sm:text-sm">From: {reply.adminName}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {!isRead && (
                              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            )}
                            <span className={`text-xs px-2 sm:px-3 py-1 rounded-full font-medium whitespace-nowrap ${isRead ? 'bg-gray-200 text-gray-600' : 'bg-green-600 text-white'}`}>
                              {isRead ? 'Read' : 'New'}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white/80 backdrop-blur rounded-lg p-3 mb-2 border-l-4 border-green-500">
                          <p className="text-gray-700 text-xs sm:text-sm line-clamp-2 break-words">{reply.adminReply}</p>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3 hidden sm:inline" />
                          <span>{new Date(reply.repliedAt).toLocaleString()}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="text-purple-600 font-medium">Click to view full reply</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Meetings Tab */}
        {activeTab === 'meetings' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Meetings Container */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">My Meetings</h2>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">View and manage your scheduled meetings</p>
                  </div>
                  <button
                    onClick={() => {
                      fetchMeetings();
                      toast.success('Meetings refreshed!');
                    }}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all flex items-center gap-2 shadow-md hover:shadow-lg font-medium text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-3 sm:p-4 lg:p-6">
                {(() => {
                  const filteredMeetings = meetings.filter((meeting: any) => {
                    const isAttendee = meeting.attendees?.includes(user?.id);
                    console.log('Meeting:', meeting.title, 'Attendees:', meeting.attendees, 'User ID:', user?.id, 'Is Attendee:', isAttendee);
                    return isAttendee;
                  });
                  console.log('Filtered meetings count:', filteredMeetings.length);
                  
                  return filteredMeetings.length === 0 ? (
                  <div className="text-center py-16 sm:py-20">
                    <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 mb-6">
                      <Video className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">No Meetings Scheduled</h3>
                    <p className="text-gray-500 text-sm sm:text-base mb-6 max-w-md mx-auto">You don't have any meetings scheduled yet. Your upcoming meetings will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">{filteredMeetings
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .map((meeting: any) => (
                    <div
                      key={meeting._id}
                      className="group bg-gradient-to-br from-gray-50 to-purple-50/30 rounded-xl p-4 sm:p-5 hover:shadow-lg hover:scale-[1.01] sm:hover:scale-[1.02] transition-all duration-300 cursor-pointer border border-gray-100 hover:border-purple-200"
                    >
                      {/* Meeting Header */}
                      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 -mx-4 sm:-mx-5 -mt-4 sm:-mt-5 px-4 sm:px-5 py-4 mb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex-1">
                            <h3 className="text-lg sm:text-xl font-bold text-white mb-1">{meeting.title}</h3>
                            {meeting.description && (
                              <p className="text-purple-100 text-sm line-clamp-2">{meeting.description}</p>
                            )}
                          </div>
                          <span className="self-start sm:self-auto px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-xs sm:text-sm font-semibold rounded-full border border-white/30 whitespace-nowrap">
                            {meeting.status || 'Scheduled'}
                          </span>
                        </div>
                      </div>

                      {/* Meeting Details Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        {/* Date */}
                        <div className="bg-white/60 backdrop-blur rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Calendar className="w-4 h-4 text-white" />
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 mb-1">Date</p>
                          <p className="font-semibold text-gray-900 text-sm">
                            {new Date(meeting.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </div>

                        {/* Time */}
                        <div className="bg-white/60 backdrop-blur rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Clock className="w-4 h-4 text-white" />
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 mb-1">Time</p>
                          <p className="font-semibold text-gray-900 text-sm">{meeting.time}</p>
                        </div>

                        {/* Duration */}
                        <div className="bg-white/60 backdrop-blur rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Timer className="w-4 h-4 text-white" />
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 mb-1">Duration</p>
                          <p className="font-semibold text-gray-900 text-sm">{meeting.duration || '30 minutes'}</p>
                        </div>

                        {/* Attendees */}
                        <div className="bg-white/60 backdrop-blur rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Users className="w-4 h-4 text-white" />
                            </div>
                          </div>
                          <p className="text-xs text-gray-600 mb-1">Attendees</p>
                          <p className="font-semibold text-gray-900 text-sm">{meeting.attendees?.length || 0} people</p>
                        </div>
                      </div>

                      {/* Join Meeting Button */}
                      {meeting.meetingLink && (
                        <div className="pt-3 border-t border-gray-200">
                          <a
                            href={meeting.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg text-sm"
                          >
                            <Video className="w-4 h-4" />
                            Join Meeting
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                  </div>
                );
                })()}
              </div>
            </div>
          </div>
        )}
        </main>
      </div>

      {/* Reply Detail Modal */}
      {selectedReply && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedReply(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-5 flex justify-between items-center border-b border-green-600 sticky top-0 z-10">
              <div>
                <h3 className="text-xl font-bold text-white">Admin Reply</h3>
                <p className="text-green-50 text-sm">From: {selectedReply.adminName}</p>
              </div>
              <button
                onClick={() => setSelectedReply(null)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Timestamp */}
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Calendar className="w-4 h-4" />
                <span>{new Date(selectedReply.repliedAt).toLocaleString()}</span>
              </div>

              {/* Reply Content */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200">
                <p className="text-gray-800 whitespace-pre-wrap text-base leading-relaxed">
                  {selectedReply.adminReply}
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Marked as Read
                </span>
              </div>

              {/* Close Button */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                <button
                  onClick={() => setSelectedReply(null)}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-2.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
