import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, BarChart3, Users, FolderOpen, TrendingUp, CheckSquare, FileText, Key, Briefcase, Star, Award, Activity, Plus, Menu, X, ChevronLeft, ChevronRight, RefreshCw, Video, GraduationCap, UserPlus, Zap, MinusCircle, Trophy } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import RealtimeActivityMonitor from '../../components/RealtimeActivityMonitor';
import AggregateReport from '../../components/AggregateReport';
import { eventEmitter, EVENTS } from '../../utils/eventEmitter';
import { useRealtimeUpdates } from '../../hooks/useRealtimeUpdates';
import { getToken } from '../../utils/auth';
import { API_BASE_URL } from '../../config/api';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [freelancers, setFreelancers] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showFreelancerForm, setShowFreelancerForm] = useState(false);
  const [showClientForm, setShowClientForm] = useState(false);
  const [filterView, setFilterView] = useState('all');
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [selectedFreelancer, setSelectedFreelancer] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [projects, setProjects] = useState<any[]>([]);
  const [showProjectComplete, setShowProjectComplete] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    dueDate: '',
  });
  const [projectFormData, setProjectFormData] = useState({
    title: '',
    description: '',
    clientId: '',
    projectType: '',
    priority: 'medium',
    estimatedHours: '',
    startDate: '',
    endDate: '',
    leadAssignee: '',
    virtualAssistant: '',
    projectLeader: '',
    isStock: false,
  });
  const [freelancerFormData, setFreelancerFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [clientFormData, setClientFormData] = useState({
    name: '',
    type: '',
    email: '',
    phone: '',
    contactPerson: '',
    oneDriveLink: '',
    gitHubLink: '',
    notes: '',
  });
  const [showCoderRecommendation, setShowCoderRecommendation] = useState(false);
  const [showLeadershipAssignment, setShowLeadershipAssignment] = useState(false);
  const [coderRecData, setCoderRecData] = useState({
    employeeId: '',
    skills: '',
    experience: '',
    reason: '',
  });
  const [leadershipData, setLeadershipData] = useState({
    employeeId: '',
    leadership: '',
  });
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [leadershipAssignments, setLeadershipAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [clientMessages, setClientMessages] = useState<any[]>([]);
  const [selectedClientMessage, setSelectedClientMessage] = useState<any>(null);
  const [replyForm, setReplyForm] = useState('');
  const [messageForm, setMessageForm] = useState({
    recipientId: '',
    recipientType: 'employee', // 'employee' or 'client'
    subject: '',
    content: '',
    app: 'dashboard', // 'gmail' or 'dashboard'
  });
  const [showNewEmployeeModal, setShowNewEmployeeModal] = useState(false);
  const [newEmployeeForm, setNewEmployeeForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [showNewTraineeModal, setShowNewTraineeModal] = useState(false);
  const [newTraineeForm, setNewTraineeForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [meetings, setMeetings] = useState<any[]>([]);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: '30',
    meetingLink: '',
    attendees: [] as string[],
    attendeeType: [] as string[],
  });
  const [trainees, setTrainees] = useState<any[]>([]);
  const [trainingTasks, setTrainingTasks] = useState<any[]>([]);
  const [showTrainingForm, setShowTrainingForm] = useState(false);
  const [trainingForm, setTrainingForm] = useState({
    title: '',
    description: '',
    traineeId: '',
    traineeName: '',
    deadline: '',
    resources: '',
  });
  const [employeePoints, setEmployeePoints] = useState<any[]>([]);
  const [selectedEmployeePoints, setSelectedEmployeePoints] = useState<any>(null);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [pointsForm, setPointsForm] = useState({
    employeeId: '',
    amount: '',
    reason: '',
    type: 'penalty', // 'penalty' or 'bonus'
  });
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [showHackathonForm, setShowHackathonForm] = useState(false);
  const [hackathonForm, setHackathonForm] = useState({
    name: '',
    description: '',
    theme: '',
    startDate: '',
    endDate: '',
    maxPlayers: '',
  });
  const [hackathonTasks, setHackathonTasks] = useState<any[]>([]);
  const [showHackathonTaskForm, setShowHackathonTaskForm] = useState(false);
  const [selectedHackathon, setSelectedHackathon] = useState<any>(null);
  const [hackathonTaskForm, setHackathonTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
  });

  const fetchMessages = async () => {
    try {
      // Load dashboard messages from localStorage
      const dashboardMessages = JSON.parse(localStorage.getItem('dashboardMessages') || '[]');
      setMessages(dashboardMessages);
      
      // Optionally also fetch from API and merge
      // const response = await api.get('/messages/sent');
      // const apiMessages = response.data;
      // const allMessages = [...dashboardMessages, ...apiMessages];
      // setMessages(allMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Fallback to localStorage only
      const dashboardMessages = JSON.parse(localStorage.getItem('dashboardMessages') || '[]');
      setMessages(dashboardMessages);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchClients();
    fetchProjects();
    fetchTasks();
    fetchAllUpdates();
    fetchFreelancers();
    fetchMessages();
    
    // Load meetings from localStorage
    const storedMeetings = JSON.parse(localStorage.getItem('meetings') || '[]');
    setMeetings(storedMeetings);
    
    // Load client messages from localStorage
    let allClientMessages = JSON.parse(localStorage.getItem('allClientMessages') || '[]');
    
    // Add sample messages if none exist
    if (allClientMessages.length === 0) {
      allClientMessages = [
        {
          _id: 1,
          subject: 'Website Design Review',
          content: 'Hi Team,\n\nCould you please provide an update on the website redesign project? We are particularly interested in the progress on the homepage mockups and the current timeline.\n\nBest regards,\nAcme Corp',
          sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          sender: 'John Smith',
          clientId: 'client1',
          clientName: 'Acme Corporation',
        },
        {
          _id: 2,
          subject: 'Budget Inquiry - Mobile App Project',
          content: 'Hello,\n\nWe need to discuss the current budget allocation for the mobile app development project. There have been some changes in our requirements that might impact the scope.\n\nPlease advise on the best time to schedule a meeting.\n\nThank you',
          sentAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
          sender: 'Sarah Johnson',
          clientId: 'client2',
          clientName: 'Tech Solutions Inc',
        },
        {
          _id: 3,
          subject: 'Emergency: Database Migration Issue',
          content: 'URGENT - We are experiencing performance issues with the database migration. Please prioritize this as it\'s affecting our production environment.\n\nCan someone from the team contact us immediately?\n\nThank you',
          sentAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
          sender: 'Michael Chen',
          clientId: 'client3',
          clientName: 'Digital Enterprises',
        },
        {
          _id: 4,
          subject: 'Appreciation - Project Completion',
          content: 'Dear Team,\n\nWe wanted to express our sincere appreciation for the excellent work on the API integration project. The team did a fantastic job and delivered ahead of schedule.\n\nLooking forward to working with you on future projects!\n\nBest regards,\nGlobal Tech Services',
          sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          sender: 'Emily Davis',
          clientId: 'client4',
          clientName: 'Global Tech Services',
        },
      ];
      localStorage.setItem('allClientMessages', JSON.stringify(allClientMessages));
    }
    
    setClientMessages(allClientMessages);
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = getToken();
      console.log('Fetching employees with token:', token ? 'Token exists' : 'No token');
      const response = await axios.get(`${API_BASE_URL}/employees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Employees response:', response.data);
      setEmployees(response.data.filter((emp: any) => emp.role === 'employee'));
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const fetchClients = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/clients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients(response.data);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    }
  };

  const fetchProjects = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/tasks/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const fetchAllUpdates = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/updates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUpdates(response.data);
    } catch (error) {
      console.error('Failed to fetch updates:', error);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = getToken();
      await axios.post(`${API_BASE_URL}/tasks`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '' });
      setShowTaskForm(false);
      fetchTasks();
      toast.success('Task created successfully!');
      eventEmitter.emit(EVENTS.TASK_CREATED); // Emit event for real-time updates
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = getToken();
      const projectData = {
        title: projectFormData.title,
        description: projectFormData.description,
        clientId: projectFormData.clientId,
        projectType: projectFormData.projectType,
        priority: projectFormData.priority,
        estimatedHours: parseInt(projectFormData.estimatedHours),
        startDate: projectFormData.startDate,
        endDate: projectFormData.endDate,
        leadAssignee: projectFormData.leadAssignee || undefined,
        virtualAssistant: projectFormData.virtualAssistant || undefined,
        projectLeader: projectFormData.projectLeader || undefined,
        isStock: projectFormData.isStock,
        status: 'planning',
        tags: [],
        freelancers: [],
        coders: [],
      };
      await axios.post(`${API_BASE_URL}/projects`, projectData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjectFormData({
        title: '',
        description: '',
        clientId: '',
        projectType: '',
        priority: 'medium',
        estimatedHours: '',
        startDate: '',
        endDate: '',
        leadAssignee: '',
        virtualAssistant: '',
        projectLeader: '',
        isStock: false,
      });
      setShowProjectForm(false);
      fetchProjects();
      toast.success('Project created successfully!');
      eventEmitter.emit(EVENTS.PROJECT_CREATED); // Emit event for real-time updates
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }
    try {
      const token = getToken();
      await axios.delete(`${API_BASE_URL}/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProjects();
      toast.success('Project deleted successfully!');
    } catch (error) {
      console.error('Failed to delete project:', error);
      toast.error('Failed to delete project');
    }
  };

  const fetchFreelancers = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/auth/freelancers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFreelancers(response.data);
    } catch (error) {
      console.error('Failed to fetch freelancers:', error);
    }
  };

  // Setup realtime updates listener
  useRealtimeUpdates({
    [EVENTS.TASK_CREATED]: fetchTasks,
    [EVENTS.TASK_UPDATED]: fetchTasks,
    [EVENTS.TASK_DELETED]: fetchTasks,
    [EVENTS.PROJECT_CREATED]: fetchProjects,
    [EVENTS.PROJECT_UPDATED]: fetchProjects,
    [EVENTS.PROJECT_DELETED]: fetchProjects,
    [EVENTS.EMPLOYEE_CREATED]: fetchEmployees,
    [EVENTS.EMPLOYEE_UPDATED]: fetchEmployees,
    [EVENTS.UPDATE_CREATED]: fetchAllUpdates,
    [EVENTS.UPDATE_UPDATED]: fetchAllUpdates,
    [EVENTS.MESSAGE_SENT]: fetchMessages,
  });

  // Auto-refresh data every 5 seconds for real-time updates across dashboards
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTasks();
      fetchProjects();
      fetchEmployees();
      fetchClients();
      fetchFreelancers();
      fetchAllUpdates();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = getToken();
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        ...newEmployeeForm,
        role: 'employee',
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Reset form
      setNewEmployeeForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
      });
      setShowNewEmployeeModal(false);
      
      // Refresh employees list
      await fetchEmployees();
      
      // Auto-select the newly created employee in task form
      setFormData(prev => ({
        ...prev,
        assignedTo: response.data.user.id
      }));
      
      toast.success('Employee created successfully!');
      eventEmitter.emit(EVENTS.EMPLOYEE_CREATED);
    } catch (error: any) {
      console.error('Failed to create employee:', error);
      toast.error(error.response?.data?.error || 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrainee = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = getToken();
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        ...newTraineeForm,
        role: 'trainee',
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Reset form
      setNewTraineeForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
      });
      setShowNewTraineeModal(false);
      
      // Refresh trainees list
      await fetchTrainees();
      
      // Auto-select the newly created trainee in training form
      setTrainingForm(prev => ({
        ...prev,
        traineeId: response.data.user.id
      }));
      
      toast.success('Trainee created successfully!');
    } catch (error: any) {
      console.error('Failed to create trainee:', error);
      toast.error(error.response?.data?.error || 'Failed to create trainee');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFreelancer = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = getToken();
      await axios.post(`${API_BASE_URL}/auth/register`, {
        ...freelancerFormData,
        role: 'freelancer',
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFreelancerFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
      });
      setShowFreelancerForm(false);
      fetchFreelancers();
      toast.success('Freelancer created successfully!');
    } catch (error) {
      console.error('Failed to create freelancer:', error);
      toast.error('Failed to create freelancer');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = getToken();
      const response = await axios.post(`${API_BASE_URL}/clients`, clientFormData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Reset form
      setClientFormData({
        name: '',
        type: '',
        email: '',
        phone: '',
        contactPerson: '',
        oneDriveLink: '',
        gitHubLink: '',
        notes: '',
      });
      setShowClientForm(false);
      
      // Refresh clients list
      await fetchClients();
      
      // Auto-select the newly created client in project form
      setProjectFormData(prev => ({
        ...prev,
        clientId: response.data._id
      }));
      
      toast.success('Client created successfully!');
    } catch (error: any) {
      console.error('Failed to create client:', error);
      toast.error(error.response?.data?.error || 'Failed to create client');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/recommendations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecommendations(response.data);
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
    }
  };

  const fetchLeadershipAssignments = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/leadership`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeadershipAssignments(response.data);
    } catch (error) {
      console.error('Failed to fetch leadership assignments:', error);
    }
  };

  const handleAddCoderRecommendation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = getToken();
      await axios.post(`${API_BASE_URL}/recommendations`, coderRecData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoderRecData({
        employeeId: '',
        skills: '',
        experience: '',
        reason: '',
      });
      setShowCoderRecommendation(false);
      fetchRecommendations();
      toast.success('Coder recommendation added successfully!');
    } catch (error) {
      console.error('Failed to add recommendation:', error);
      toast.error('Failed to add recommendation');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignLeadership = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = getToken();
      await axios.post(`${API_BASE_URL}/leadership`, leadershipData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeadershipData({
        employeeId: '',
        leadership: '',
      });
      setShowLeadershipAssignment(false);
      fetchLeadershipAssignments();
      fetchEmployees();
      toast.success('Leadership assignment updated successfully!');
    } catch (error) {
      console.error('Failed to assign leadership:', error);
      toast.error('Failed to assign leadership');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!meetingForm.title || !meetingForm.date || !meetingForm.time || meetingForm.attendees.length === 0) {
      toast.error('Please fill in all required fields and select at least one attendee');
      return;
    }

    const newMeeting = {
      _id: Date.now(),
      ...meetingForm,
      createdBy: user?.id,
      createdByName: `${user?.firstName} ${user?.lastName}`,
      createdAt: new Date(),
      status: 'scheduled',
    };

    const allMeetings = JSON.parse(localStorage.getItem('meetings') || '[]');
    allMeetings.unshift(newMeeting);
    localStorage.setItem('meetings', JSON.stringify(allMeetings));
    setMeetings(allMeetings);

    setMeetingForm({
      title: '',
      description: '',
      date: '',
      time: '',
      duration: '30',
      meetingLink: '',
      attendees: [],
      attendeeType: [],
    });
    setShowMeetingForm(false);
    toast.success('Meeting scheduled successfully!');
  };

  const handleToggleAttendee = (id: string, type: string) => {
    const attendeeIndex = meetingForm.attendees.indexOf(id);
    if (attendeeIndex > -1) {
      setMeetingForm({
        ...meetingForm,
        attendees: meetingForm.attendees.filter((a) => a !== id),
        attendeeType: meetingForm.attendeeType.filter((_, i) => i !== attendeeIndex),
      });
    } else {
      setMeetingForm({
        ...meetingForm,
        attendees: [...meetingForm.attendees, id],
        attendeeType: [...meetingForm.attendeeType, type],
      });
    }
  };

  // Training-related functions
  const fetchTrainees = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/training/trainees`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrainees(response.data);
    } catch (error) {
      console.error('Failed to fetch trainees:', error);
    }
  };

  const fetchTrainingTasks = async () => {
    try {
      const token = getToken();
      if (!token) {
        console.error('No auth token found');
        toast.error('Please log in again');
        return;
      }
      const response = await axios.get(`${API_BASE_URL}/training`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrainingTasks(response.data);
    } catch (error: any) {
      console.error('Failed to fetch training tasks:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again');
      }
    }
  };

  const handleCreateTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = getToken();
      await axios.post(`${API_BASE_URL}/training`, trainingForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrainingForm({
        title: '',
        description: '',
        traineeId: '',
        traineeName: '',
        deadline: '',
        resources: '',
      });
      setShowTrainingForm(false);
      fetchTrainingTasks();
      toast.success('Training task assigned successfully!');
    } catch (error) {
      console.error('Failed to create training task:', error);
      toast.error('Failed to assign training task');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTraining = async (trainingId: string) => {
    if (!confirm('Are you sure you want to delete this training task?')) {
      return;
    }
    try {
      const token = getToken();
      await axios.delete(`${API_BASE_URL}/training/${trainingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTrainingTasks();
      toast.success('Training task deleted successfully!');
    } catch (error) {
      console.error('Failed to delete training task:', error);
      toast.error('Failed to delete training task');
    }
  };

  // Points Management Functions
  const fetchEmployeePoints = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/points/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployeePoints(response.data.points || []);
    } catch (error) {
      console.error('Failed to fetch employee points:', error);
      toast.error('Failed to load employee points');
    }
  };

  const handleApplyPenalty = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = getToken();
      await axios.post(`${API_BASE_URL}/points/admin/penalty`, {
        employeeId: pointsForm.employeeId,
        penaltyAmount: parseInt(pointsForm.amount),
        reason: pointsForm.reason,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setPointsForm({
        employeeId: '',
        amount: '',
        reason: '',
        type: 'penalty',
      });
      setShowPointsModal(false);
      fetchEmployeePoints();
      toast.success('Points updated successfully!');
    } catch (error) {
      console.error('Failed to apply penalty:', error);
      toast.error('Failed to update points');
    } finally {
      setLoading(false);
    }
  };

  const handleViewEmployeePoints = async (employeeId: string) => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/points/admin/employee/${employeeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedEmployeePoints(response.data);
    } catch (error) {
      console.error('Failed to fetch employee details:', error);
      toast.error('Failed to load employee points details');
    }
  };

  const fetchHackathons = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/hackathon`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHackathons(response.data);
      if (response.data.length > 0 && !selectedHackathon) {
        setSelectedHackathon(response.data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch hackathons:', error);
    }
  };

  const fetchHackathonTasks = async (hackathonId: string) => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/hackathon/${hackathonId}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHackathonTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch hackathon tasks:', error);
    }
  };

  const handleCreateHackathon = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = getToken();
      await axios.post(`${API_BASE_URL}/hackathon`, {
        ...hackathonForm,
        maxPlayers: parseInt(hackathonForm.maxPlayers),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHackathonForm({
        name: '',
        description: '',
        theme: '',
        startDate: '',
        endDate: '',
        maxPlayers: '',
      });
      setShowHackathonForm(false);
      fetchHackathons();
      toast.success('Hackathon created successfully!');
    } catch (error: any) {
      console.error('Failed to create hackathon:', error);
      toast.error(error.response?.data?.error || 'Failed to create hackathon');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHackathonTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHackathon) {
      toast.error('Please select a hackathon');
      return;
    }
    setLoading(true);
    try {
      const token = getToken();
      await axios.post(`${API_BASE_URL}/hackathon/${selectedHackathon._id}/task`, {
        title: hackathonTaskForm.title,
        description: hackathonTaskForm.description,
        priority: hackathonTaskForm.priority,
        dueDate: hackathonTaskForm.dueDate,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHackathonTaskForm({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
      });
      setShowHackathonTaskForm(false);
      fetchHackathonTasks(selectedHackathon._id);
      toast.success('Task assigned successfully!');
    } catch (error: any) {
      console.error('Failed to create task:', error);
      toast.error(error.response?.data?.error || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHackathonTask = async (taskId: string) => {
    if (!selectedHackathon || !confirm('Are you sure you want to delete this task?')) {
      return;
    }
    try {
      const token = getToken();
      await axios.delete(`${API_BASE_URL}/hackathon/${selectedHackathon._id}/task/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchHackathonTasks(selectedHackathon._id);
      toast.success('Task deleted successfully!');
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Failed to delete task');
    }
  }

  useEffect(() => {
    if (activeTab === 'training') {
      fetchTrainees();
      fetchTrainingTasks();
    }
    if (activeTab === 'points') {
      fetchEmployeePoints();
    }
    if (activeTab === 'hackathon') {
      fetchHackathons();
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedHackathon) {
      fetchHackathonTasks(selectedHackathon._id);
    }
  }, [selectedHackathon]);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      {/* Sidebar Navigation */}
      <aside className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-xl transition-all duration-300 z-30 ${
        sidebarOpen ? 'w-64' : 'w-20'
      } hidden lg:block`}>
        {/* Sidebar Header */}
        <div className="h-20 border-b border-gray-200 flex items-center justify-between px-4">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">Admin</h2>
                <p className="text-xs text-gray-500">Dashboard</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 5rem)' }}>
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'activity', label: 'Activity', icon: Activity },
            { id: 'reports', label: 'Reports', icon: BarChart3 },
            { id: 'projects', label: 'Projects', icon: FolderOpen },
            { id: 'tasks', label: 'Tasks', icon: CheckSquare },
            { id: 'employees', label: 'Employees', icon: Users },
            { id: 'freelancers', label: 'Freelancers', icon: Briefcase },
            { id: 'coder-rec', label: 'Coders', icon: Star },
            { id: 'leadership', label: 'Leadership', icon: Award },
            { id: 'credentials', label: 'Credentials', icon: Key },
            { id: 'points', label: 'Points', icon: Zap },
            { id: 'updates', label: 'Updates', icon: FileText },
            { id: 'client-messages', label: 'Messages', icon: FileText },
            { id: 'messages', label: 'Send', icon: TrendingUp },
            { id: 'meetings', label: 'Meetings', icon: Video },
            { id: 'training', label: 'Training', icon: GraduationCap },
            { id: 'hackathon', label: 'Hackathon', icon: Trophy },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title={!sidebarOpen ? item.label : ''}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${
                  activeTab === item.id ? 'text-white' : 'text-gray-600 group-hover:text-blue-600'
                }`} />
                {sidebarOpen && (
                  <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-72 sm:w-80 bg-white shadow-2xl transition-transform duration-300 z-50 lg:hidden overflow-y-auto ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Mobile Sidebar Header */}
        <div className="sticky top-0 bg-white h-16 sm:h-20 border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center">
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm sm:text-base">Admin</h2>
              <p className="text-xs text-gray-500">Dashboard</p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Mobile Navigation Items */}
        <nav className="p-3 sm:p-4 space-y-1 pb-6">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'activity', label: 'Activity', icon: Activity },
            { id: 'reports', label: 'Reports', icon: BarChart3 },
            { id: 'projects', label: 'Projects', icon: FolderOpen },
            { id: 'tasks', label: 'Tasks', icon: CheckSquare },
            { id: 'employees', label: 'Employees', icon: Users },
            { id: 'freelancers', label: 'Freelancers', icon: Briefcase },
            { id: 'coder-rec', label: 'Coders', icon: Star },
            { id: 'leadership', label: 'Leadership', icon: Award },
            { id: 'credentials', label: 'Credentials', icon: Key },
            { id: 'points', label: 'Points', icon: Zap },
            { id: 'updates', label: 'Updates', icon: FileText },
            { id: 'client-messages', label: 'Messages', icon: FileText },
            { id: 'messages', label: 'Send', icon: TrendingUp },
            { id: 'meetings', label: 'Meetings', icon: Video },
            { id: 'training', label: 'Training', icon: GraduationCap },
            { id: 'hackathon', label: 'Hackathon', icon: Trophy },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 sm:px-4 py-3.5 sm:py-4 rounded-lg sm:rounded-xl transition-all duration-200 touch-manipulation ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-[0.98]'
                    : 'text-gray-700 hover:bg-gray-100 active:scale-95'
                }`}
              >
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 ${
                  activeTab === item.id ? 'text-white' : 'text-gray-600'
                }`} />
                <span className="font-medium text-sm sm:text-base">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
          <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center">
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-700" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Admin Dashboard
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
        {activeTab === 'activity' && (
          <div className="animate-fadeIn">
            <RealtimeActivityMonitor />
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Modern KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {[
                { label: 'Total Projects', value: projects.length.toString(), gradient: 'from-blue-500 to-blue-600', icon: FolderOpen, iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
                { label: 'Active Employees', value: employees.length.toString(), gradient: 'from-green-500 to-green-600', icon: Users, iconBg: 'bg-green-100', iconColor: 'text-green-600' },
                { label: 'Total Clients', value: clients.length.toString(), gradient: 'from-purple-500 to-purple-600', icon: BarChart3, iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
                { label: 'Completion Rate', value: '72%', gradient: 'from-orange-500 to-orange-600', icon: TrendingUp, iconBg: 'bg-orange-100', iconColor: 'text-orange-600' },
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
                      <div className={`hidden sm:block px-3 py-1 rounded-full bg-gradient-to-r ${stat.gradient} bg-opacity-10`}>
                        <span className="text-xs font-semibold text-gray-100">Live</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-xs sm:text-sm font-medium mb-1 sm:mb-2">{stat.label}</p>
                    <p className="text-2xl sm:text-4xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                );
              })}
            </div>

            {/* Active Projects Section */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Active Projects</h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage and track all your projects</p>
              </div>
              <div className="p-3 sm:p-4 lg:p-6">
                {projects.length === 0 ? (
                  <div className="text-center py-16 sm:py-20">
                    <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 mb-6">
                      <FolderOpen className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600" />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">No Projects Yet</h3>
                    <p className="text-gray-500 text-sm sm:text-base mb-6 max-w-md mx-auto">Start managing your projects efficiently. Create your first project to track progress, assign tasks, and collaborate with your team.</p>
                    <button
                      onClick={() => setShowProjectForm(true)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all font-semibold"
                    >
                      <Plus className="w-5 h-5" />
                      Create Your First Project
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {projects.map((project: any) => (
                      <div 
                        key={project._id} 
                        onClick={() => navigate(`/admin/project/${project._id}`)}
                        className="group bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl p-4 sm:p-5 hover:shadow-lg hover:scale-[1.01] sm:hover:scale-[1.02] transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-200"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-3">
                          <div className="flex-1 w-full">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">{project.title}</h3>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'No deadline'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {project.clientId?.name || 'Unassigned'}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <span className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                              project.priority === 'high' ? 'bg-red-100 text-red-700 ring-2 ring-red-200' : 
                              project.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-200' :
                              'bg-green-100 text-green-700 ring-2 ring-green-200'
                            }`}>
                              {project.priority}
                            </span>
                            <span className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                              project.status === 'completed' ? 'bg-green-100 text-green-700 ring-2 ring-green-200' : 
                              project.status === 'active' ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-200' :
                              project.status === 'on-hold' ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-200' :
                              'bg-gray-100 text-gray-700 ring-2 ring-gray-200'
                            }`}>
                              {project.status}
                            </span>
                          </div>
                        </div>
                        
                        {/* Progress Indicator */}
                        {project.status === 'completed' ? (
                          <div className="p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-green-800 font-bold text-base sm:text-lg">100% Complete</p>
                              <p className="text-green-600 text-xs sm:text-sm">Project successfully delivered</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-gray-700">Project Progress</span>
                              <span className="text-sm font-bold text-blue-600">In Progress</span>
                            </div>
                            <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-500 rounded-full animate-pulse" style={{ width: '100%' }} />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-4 sm:space-y-6 animate-fadeIn">
            {/* Modern Projects Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Projects Management</h2>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">Create and manage your project portfolio</p>
              </div>
              <button
                onClick={() => setShowProjectForm(!showProjectForm)}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 text-sm sm:text-base ${
                  showProjectForm 
                    ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                }`}
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                {showProjectForm ? 'Cancel' : 'New Project'}
              </button>
            </div>

            {showProjectForm && (
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-100 shadow-xl animate-slideDown">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                    <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <span className="text-base sm:text-2xl">Create New Project</span>
                </h3>
                <form onSubmit={handleCreateProject}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-6">
                    <input
                      type="text"
                      placeholder="Project Title"
                      value={projectFormData.title}
                      onChange={(e) => setProjectFormData({ ...projectFormData, title: e.target.value })}
                      required
                      className="col-span-2 bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                    <textarea
                      placeholder="Project Description"
                      value={projectFormData.description}
                      onChange={(e) => setProjectFormData({ ...projectFormData, description: e.target.value })}
                      required
                      className="col-span-2 bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all min-h-24"
                    />
                    <select
                      value={projectFormData.clientId}
                      onChange={(e) => {
                        if (e.target.value === 'ADD_NEW') {
                          setShowClientForm(true);
                        } else {
                          setProjectFormData({ ...projectFormData, clientId: e.target.value });
                        }
                      }}
                      required
                      className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    >
                      <option value="">Select Client</option>
                      {clients.map((client: any) => (
                        <option key={client._id} value={client._id}>{client.name}</option>
                      ))}
                      <option value="ADD_NEW" className="text-blue-600 font-semibold">+ Add New Client</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Project Type (e.g., Web Development)"
                      value={projectFormData.projectType}
                      onChange={(e) => setProjectFormData({ ...projectFormData, projectType: e.target.value })}
                      required
                      className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                    <select
                      value={projectFormData.priority}
                      onChange={(e) => setProjectFormData({ ...projectFormData, priority: e.target.value })}
                      className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                    <input
                      type="number"
                      placeholder="Estimated Hours"
                      value={projectFormData.estimatedHours}
                      onChange={(e) => setProjectFormData({ ...projectFormData, estimatedHours: e.target.value })}
                      required
                      className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">Start Date</label>
                      <input
                        type="date"
                        value={projectFormData.startDate}
                        onChange={(e) => setProjectFormData({ ...projectFormData, startDate: e.target.value })}
                        required
                        className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-gray-700">End Date</label>
                      <input
                        type="date"
                        value={projectFormData.endDate}
                        onChange={(e) => setProjectFormData({ ...projectFormData, endDate: e.target.value })}
                        required
                        className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                      />
                    </div>
                    <select
                      value={projectFormData.leadAssignee}
                      onChange={(e) => setProjectFormData({ ...projectFormData, leadAssignee: e.target.value })}
                      className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    >
                      <option value="">Select Lead Assignee</option>
                      {employees.map((emp: any) => (
                        <option key={emp._id} value={emp._id}>{emp.name || emp.email}</option>
                      ))}
                    </select>
                    <select
                      value={projectFormData.virtualAssistant}
                      onChange={(e) => setProjectFormData({ ...projectFormData, virtualAssistant: e.target.value })}
                      className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    >
                      <option value="">Select Virtual Assistant</option>
                      {employees.map((emp: any) => (
                        <option key={emp._id} value={emp._id}>{emp.name || emp.email}</option>
                      ))}
                    </select>
                    <select
                      value={projectFormData.projectLeader}
                      onChange={(e) => setProjectFormData({ ...projectFormData, projectLeader: e.target.value })}
                      className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    >
                      <option value="">Select In Charge (Project Leader)</option>
                      {employees.map((emp: any) => (
                        <option key={emp._id} value={emp._id}>{emp.name || emp.email}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-3 mb-6">
                    <input
                      id="isStock"
                      type="checkbox"
                      checked={projectFormData.isStock}
                      onChange={(e) => setProjectFormData({ ...projectFormData, isStock: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <label htmlFor="isStock" className="text-gray-700 font-medium cursor-pointer">Mark as Stock Project</label>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
                  >
                    {loading ? 'Creating Project...' : 'Create Project'}
                  </button>
                </form>
              </div>
            )}

            {/* Modern Projects Grid */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">All Projects</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">{projects.length} total projects</p>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden">
                {projects.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 mb-4">
                      <FolderOpen className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
                    <p className="text-gray-500 text-sm mb-4">Create a new project to get started</p>
                    <button
                      onClick={() => setShowProjectForm(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      New Project
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {projects.map((project: any) => (
                      <div key={project._id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FolderOpen className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-gray-900 mb-1">{project.title}</h4>
                            <p className="text-xs text-gray-500 line-clamp-2">{project.description}</p>
                          </div>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Client:</span>
                            <span className="font-medium text-gray-900">{project.clientId?.name || 'N/A'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Status:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                              project.status === 'completed' ? 'bg-green-100 text-green-700' : 
                              project.status === 'active' ? 'bg-blue-100 text-blue-700' :
                              project.status === 'on-hold' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>{project.status}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Priority:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                              project.priority === 'high' ? 'bg-red-100 text-red-700' : 
                              project.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>{project.priority}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-gray-600">Due Date:</span>
                            <span className="font-medium text-gray-900">
                              {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                          <button
                            onClick={() => navigate(`/admin/project/${project._id}`)}
                            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project._id)}
                            className="px-3 py-2 bg-red-100 text-red-600 rounded-lg text-xs font-medium hover:bg-red-200"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Project</th>
                      <th className="px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Client</th>
                      <th className="px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Priority</th>
                      <th className="px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Due Date</th>
                      <th className="px-4 lg:px-6 py-3 sm:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {projects.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-16">
                          <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 mb-4">
                              <FolderOpen className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
                            <p className="text-gray-500 text-sm mb-4">Create a new project to get started</p>
                            <button
                              onClick={() => setShowProjectForm(true)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg text-sm font-medium"
                            >
                              <Plus className="w-4 h-4" />
                              New Project
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : projects.map((project: any) => (
                      <tr key={project._id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
                        <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 whitespace-nowrap">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs sm:text-sm font-bold text-gray-900 truncate max-w-[150px]">{project.title}</div>
                              <div className="text-xs text-gray-500 truncate max-w-[150px]">{project.description?.substring(0, 30)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-5 whitespace-nowrap">
                          <div className="text-xs sm:text-sm font-medium text-gray-900">{project.clientId?.name || 'N/A'}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-5 whitespace-nowrap">
                          <span className={`px-2 sm:px-3 py-1 sm:py-1.5 inline-flex text-xs font-bold rounded-full uppercase tracking-wide ${
                            project.status === 'completed' ? 'bg-green-100 text-green-700 ring-2 ring-green-200' : 
                            project.status === 'active' ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-200' :
                            project.status === 'on-hold' ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-200' :
                            'bg-gray-100 text-gray-700 ring-2 ring-gray-200'
                          }`}>
                            {project.status}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-5 whitespace-nowrap">
                          <span className={`px-2 sm:px-3 py-1 sm:py-1.5 inline-flex text-xs font-bold rounded-full uppercase tracking-wide ${
                            project.priority === 'high' ? 'bg-red-100 text-red-700 ring-2 ring-red-200' : 
                            project.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-200' :
                            'bg-green-100 text-green-700 ring-2 ring-green-200'
                          }`}>
                            {project.priority}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                          {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                          <div className="flex gap-2 sm:gap-4">
                            <button
                              onClick={() => navigate(`/admin/project/${project._id}`)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleDeleteProject(project._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Tasks Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
              <h2 className="text-xl sm:text-2xl font-bold" style={{ color: '#1F2937' }}>Task Management</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchTasks()}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm sm:text-base shadow-md hover:shadow-lg"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
                <button
                  onClick={() => setShowTaskForm(!showTaskForm)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm sm:text-base shadow-md hover:shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  {showTaskForm ? 'Cancel' : 'Assign Task'}
                </button>
              </div>
            </div>

            {showTaskForm && (
              <form onSubmit={handleCreateTask} className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200">
                <h3 className="text-lg sm:text-xl font-bold mb-4" style={{ color: '#1F2937' }}>Create New Task</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">Task Title</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                      placeholder="Enter task title"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">Assign To</label>
                    <div className="flex gap-2">
                      <select
                        required
                        value={formData.assignedTo}
                        onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                        className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded text-gray-900 focus:outline-none focus:border-blue-500"
                      >
                        <option value="">Select an employee</option>
                        {employees.map((emp) => (
                          <option key={emp._id} value={emp._id}>
                            {emp.firstName} {emp.lastName} ({emp.email})
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowNewEmployeeModal(true)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded transition whitespace-nowrap flex items-center gap-1 shadow-md hover:shadow-lg"
                      >
                        <Plus className="w-4 h-4" />
                        New Employee
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-semibold mb-2">Description</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="Enter task description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded text-gray-900 focus:outline-none focus:border-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-semibold mb-2">Due Date</label>
                    <input
                      type="date"
                      required
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded text-gray-900 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition font-semibold shadow-md hover:shadow-lg"
                >
                  {loading ? 'Creating...' : 'Create Task'}
                </button>
              </form>
            )}

            {/* New Employee Modal */}
            {showNewEmployeeModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl animate-slideDown">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <span>Add New Employee</span>
                  </h3>
                  <form onSubmit={handleCreateEmployee}>
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">First Name *</label>
                        <input
                          type="text"
                          value={newEmployeeForm.firstName}
                          onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, firstName: e.target.value })}
                          required
                          className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                          placeholder="Enter first name"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">Last Name *</label>
                        <input
                          type="text"
                          value={newEmployeeForm.lastName}
                          onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, lastName: e.target.value })}
                          required
                          className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                          placeholder="Enter last name"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">Email *</label>
                        <input
                          type="email"
                          value={newEmployeeForm.email}
                          onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, email: e.target.value })}
                          required
                          className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                          placeholder="employee@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">Password *</label>
                        <input
                          type="password"
                          value={newEmployeeForm.password}
                          onChange={(e) => setNewEmployeeForm({ ...newEmployeeForm, password: e.target.value })}
                          required
                          minLength={6}
                          className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                          placeholder="Minimum 6 characters"
                        />
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewEmployeeModal(false);
                          setNewEmployeeForm({
                            firstName: '',
                            lastName: '',
                            email: '',
                            password: '',
                          });
                        }}
                        className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
                      >
                        {loading ? 'Creating...' : 'Add Employee'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Tasks Table */}
            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-base sm:text-lg font-semibold" style={{ color: '#1F2937' }}>All Tasks</h3>
                  <button
                    onClick={() => fetchTasks()}
                    className="text-gray-600 hover:text-blue-600 transition flex items-center gap-1 text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden">
                {tasks.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 mb-4">
                      <CheckSquare className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tasks Assigned</h3>
                    <p className="text-gray-500 text-sm mb-4">Start organizing work by creating and assigning tasks.</p>
                    <button
                      onClick={() => setShowTaskForm(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Create First Task
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {tasks.map((task) => (
                      <div key={task._id} className="p-4 hover:bg-gray-50">
                        <div className="mb-3">
                          <h4 className="text-sm font-semibold text-gray-900 mb-1">{task.title}</h4>
                          <p className="text-xs text-gray-600">Assigned to: {task.assignedTo?.firstName} {task.assignedTo?.lastName}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-gray-600">Priority:</span>
                            <span className={`ml-2 px-2 py-1 rounded-full font-semibold ${
                              task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {task.priority}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Status:</span>
                            <span className={`ml-2 px-2 py-1 rounded-full font-semibold ${
                              task.status === 'completed' ? 'bg-green-100 text-green-800' :
                              task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                              task.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {task.status}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 text-xs">
                          <span className="text-gray-600">Due Date:</span>
                          <span className="ml-2 font-medium text-gray-900">{new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                        <button
                          onClick={() => {
                            setFormData({
                              title: task.title,
                              description: task.description,
                              assignedTo: task.assignedTo?._id || '',
                              priority: task.priority,
                              dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
                            });
                            setEditingTaskId(task._id);
                            setShowTaskForm(true);
                          }}
                          className="mt-3 w-full px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700"
                        >
                          Edit Task
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tasks.length === 0 ? (
                      <tr>
                        <td className="px-6 py-16 text-center" colSpan={6}>
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 mb-4">
                            <CheckSquare className="w-8 h-8 text-green-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tasks Assigned</h3>
                          <p className="text-gray-500 text-sm mb-4 max-w-md mx-auto">Start organizing work by creating and assigning tasks to your team members.</p>
                          <button
                            onClick={() => setShowTaskForm(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg text-sm font-medium"
                          >
                            <Plus className="w-4 h-4" />
                            Create First Task
                          </button>
                        </td>
                      </tr>
                    ) : (
                      tasks.map((task) => (
                        <tr key={task._id} className="hover:bg-gray-50">
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <div className="text-xs sm:text-sm font-medium truncate max-w-[150px]" style={{ color: '#1F2937' }}>{task.title}</div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <div className="text-xs sm:text-sm" style={{ color: '#1F2937' }}>{task.assignedTo?.firstName} {task.assignedTo?.lastName}</div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {task.priority}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              task.status === 'completed' ? 'bg-green-100 text-green-800' :
                              task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                              task.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {task.status}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                            {new Date(task.dueDate).toLocaleDateString()}
                          </td>
                          <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                            <button
                              onClick={() => {
                                setFormData({
                                  title: task.title,
                                  description: task.description,
                                  assignedTo: task.assignedTo?._id || '',
                                  priority: task.priority,
                                  dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
                                });
                                setEditingTaskId(task._id);
                                setShowTaskForm(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'employees' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Employees Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="w-full sm:w-auto">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4" style={{ color: '#1F2937' }}>Users Management</h2>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                  <label className="text-gray-700 font-semibold text-sm sm:text-base">Filter by:</label>
                  <select
                    value={filterView}
                    onChange={(e) => setFilterView(e.target.value)}
                    className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gray-50 border border-gray-300 rounded text-gray-900 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                  >
                    <option value="all">All Users ({employees.length + clients.length})</option>
                    <option value="employees">Employees ({employees.length})</option>
                    <option value="clients">Clients ({clients.length})</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    fetchEmployees();
                    fetchClients();
                    toast.success('Employee list refreshed!');
                  }}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm sm:text-base shadow-md hover:shadow-lg"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
                <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm sm:text-base shadow-md hover:shadow-lg">
                  <Plus className="w-4 h-4" />
                  Add User
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200">
                <p className="text-gray-600 text-xs sm:text-sm mb-1 sm:mb-2">Total Employees</p>
                <p className="text-2xl sm:text-3xl font-bold" style={{ color: '#3B82F6' }}>{employees.length}</p>
              </div>
              <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-200">
                <p className="text-gray-600 text-xs sm:text-sm mb-1 sm:mb-2">Total Clients</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">{clients.length}</p>
              </div>
            </div>

            {/* Employees List */}
            {(filterView === 'all' || filterView === 'employees') && employees.length > 0 && (
              <div className="mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4" style={{ color: '#1F2937' }}>Employees ({employees.length})</h3>
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Email</th>
                          <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Phone</th>
                          <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Work Progress</th>
                          <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {employees.map((emp) => {
                          const empTasks = tasks.filter((t: any) => t.assignedTo?._id === emp._id);
                          const avgProgress = empTasks.length > 0 
                            ? Math.round(empTasks.reduce((sum: number, t: any) => sum + (t.workProgress || 0), 0) / empTasks.length)
                            : 0;
                          
                          return (
                            <tr key={emp._id} className="hover:bg-gray-50">
                              <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                                <div className="text-xs sm:text-sm font-medium" style={{ color: '#1F2937' }}>{emp.firstName} {emp.lastName}</div>
                                <div className="text-xs text-gray-500 md:hidden mt-1">{emp.email}</div>
                              </td>
                              <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap hidden md:table-cell">
                                <div className="text-xs sm:text-sm text-gray-500">{emp.email}</div>
                              </td>
                              <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap hidden lg:table-cell">
                                <div className="text-xs sm:text-sm text-gray-500">{emp.phone || 'N/A'}</div>
                              </td>
                              <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                                <div className="flex items-center gap-2">
                                  <div className="w-20 sm:w-32 bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <div 
                                      className="bg-blue-500 h-full transition-all duration-300"
                                      style={{ width: `${avgProgress}%`, backgroundColor: '#3B82F6' }}
                                    />
                                  </div>
                                  <span className="text-xs sm:text-sm font-semibold" style={{ color: '#1F2937' }}>{avgProgress}%</span>
                                </div>
                              </td>
                              <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  emp.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {emp.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Clients List */}
            {(filterView === 'all' || filterView === 'clients') && clients.length > 0 && (
              <div>
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4" style={{ color: '#1F2937' }}>Clients ({clients.length})</h3>
                <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Name</th>
                          <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Type</th>
                          <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Email</th>
                          <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Phone</th>
                          <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Contact Person</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {clients.map((client) => (
                          <tr key={client._id} className="hover:bg-gray-50">
                            <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                              <div className="text-xs sm:text-sm font-medium" style={{ color: '#1F2937' }}>{client.name}</div>
                              <div className="text-xs text-gray-500 sm:hidden mt-1">{client.type || 'N/A'}</div>
                            </td>
                            <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                              <div className="text-xs sm:text-sm text-gray-500">{client.type || 'N/A'}</div>
                            </td>
                            <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap hidden md:table-cell">
                              <div className="text-xs sm:text-sm text-gray-500">{client.email || 'N/A'}</div>
                            </td>
                            <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap hidden lg:table-cell">
                              <div className="text-xs sm:text-sm text-gray-500">{client.phone || 'N/A'}</div>
                            </td>
                            <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap hidden lg:table-cell">
                              <div className="text-sm text-gray-500">{client.contactPerson || 'N/A'}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {employees.length === 0 && clients.length === 0 && (
              <div className="bg-white rounded-xl p-16 text-center shadow-sm border border-gray-200">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 mb-6">
                  <Users className="w-10 h-10 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Users Yet</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">Start building your team by adding employees and clients to your workspace.</p>
                <div className="flex gap-3 justify-center">
                  <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg font-medium">
                    <Plus className="w-4 h-4" />
                    Add Employee
                  </button>
                  <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg font-medium">
                    <Plus className="w-4 h-4" />
                    Add Client
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'updates' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold" style={{ color: '#1F2937' }}>Employee Updates</h2>
              <button
                onClick={() => {
                  fetchAllUpdates();
                  toast.success('Updates refreshed!');
                }}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>

            {updates.length === 0 ? (
              <div className="bg-white rounded-xl p-16 text-center shadow-sm border border-gray-200">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-orange-100 to-yellow-100 mb-6">
                  <FileText className="w-10 h-10 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Updates Yet</h3>
                <p className="text-gray-500 text-sm mb-4 max-w-md mx-auto">Employee updates will appear here once your team starts submitting their daily progress reports.</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm">
                  <Activity className="w-4 h-4" />
                  Waiting for employee submissions
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {updates.map((update: any) => (
                  <div
                    key={update._id}
                    className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-sm transition cursor-pointer"
                    onClick={() => setSelectedUpdate(update)}
                  >
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold" style={{ color: '#1F2937' }}>
                          {update.employeeId?.firstName} {update.employeeId?.lastName}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          {new Date(update.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {update.projectId?.title || 'Project'}
                      </span>
                    </div>

                    {/* Summary */}
                    <p className="text-gray-700 mb-4 whitespace-pre-wrap">{update.summary}</p>

                    {/* Hours Attended */}
                    {update.hoursAttended && update.hoursAttended > 0 && (
                      <div className="mb-4 p-3 bg-orange-50 rounded border-l-4 border-orange-500">
                        <p className="text-xs font-semibold text-orange-700 mb-1">HOURS ATTENDED</p>
                        <p className="text-lg font-bold text-orange-800">{update.hoursAttended} hours</p>
                      </div>
                    )}

                    {/* PROJECT MANAGEMENT Checklist */}
                    {update.projectManagement && update.projectManagement.length > 0 && (
                      <div className="mb-4 p-3 bg-purple-50 rounded border-l-4 border-purple-500">
                        <p className="text-xs font-semibold text-purple-700 mb-2">📊 PROJECT MANAGEMENT</p>
                        <div className="space-y-1">
                          {update.projectManagement.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-start gap-2">
                              <input
                                type="checkbox"
                                checked={item.completed}
                                disabled
                                className="w-4 h-4 mt-0.5 accent-purple-600"
                              />
                              <span className={`text-xs ${item.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                                {item.item}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 text-xs text-purple-700 font-semibold">
                          {update.projectManagement.filter((i: any) => i.completed).length} / {update.projectManagement.length} completed
                        </div>
                      </div>
                    )}

                    {/* DAILY UPDATE Checklist */}
                    {update.dailyUpdate && update.dailyUpdate.length > 0 && (
                      <div className="mb-4 p-3 bg-blue-50 rounded border-l-4 border-blue-500">
                        <p className="text-xs font-semibold text-blue-700 mb-2">📋 DAILY UPDATE</p>
                        <div className="space-y-1">
                          {update.dailyUpdate.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-start gap-2">
                              <input
                                type="checkbox"
                                checked={item.completed}
                                disabled
                                className="w-4 h-4 mt-0.5 accent-blue-600"
                              />
                              <span className={`text-xs ${item.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                                {item.item}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-2 text-xs text-blue-700 font-semibold">
                          {update.dailyUpdate.filter((i: any) => i.completed).length} / {update.dailyUpdate.length} completed
                        </div>
                      </div>
                    )}

                    {/* Next Plan */}
                    {update.nextPlan && (
                      <div className="mb-4 p-3 bg-green-50 rounded border-l-4 border-green-500">
                        <p className="text-xs font-semibold text-green-700 mb-1">NEXT DAY PLAN</p>
                        <p className="text-gray-700 text-sm whitespace-pre-wrap">{update.nextPlan}</p>
                      </div>
                    )}

                    {/* Video Link */}
                    {update.loomVideoLink && (
                      <div className="mb-4">
                        <a
                          href={update.loomVideoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition shadow-md hover:shadow-lg"
                        >
                          🎥 Watch Loom Video
                        </a>
                      </div>
                    )}

                    {/* Employee Info */}
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <p className="text-gray-600 text-sm">
                        <span className="font-semibold">Email:</span> {update.employeeId?.email}
                      </p>
                      {update.employeeId?.phone && (
                        <p className="text-gray-600 text-sm">
                          <span className="font-semibold">Phone:</span> {update.employeeId.phone}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'freelancers' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Freelancers Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
              <h2 className="text-xl sm:text-2xl font-bold" style={{ color: '#1F2937' }}>Freelancer Management</h2>
              <button
                onClick={() => setShowFreelancerForm(!showFreelancerForm)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm sm:text-base shadow-md hover:shadow-lg"
              >
                <Plus className="w-4 h-4" />
                {showFreelancerForm ? 'Cancel' : 'Create Freelancer'}
              </button>
            </div>

            {showFreelancerForm && (
              <form onSubmit={handleCreateFreelancer} className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200">
                <h3 className="text-lg sm:text-xl font-bold mb-4" style={{ color: '#1F2937' }}>Create New Freelancer Account</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={freelancerFormData.firstName}
                    onChange={(e) => setFreelancerFormData({ ...freelancerFormData, firstName: e.target.value })}
                    required
                    className="col-span-1 bg-gray-50 border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={freelancerFormData.lastName}
                    onChange={(e) => setFreelancerFormData({ ...freelancerFormData, lastName: e.target.value })}
                    required
                    className="col-span-1 bg-gray-50 border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={freelancerFormData.email}
                    onChange={(e) => setFreelancerFormData({ ...freelancerFormData, email: e.target.value })}
                    required
                    className="col-span-2 bg-gray-50 border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={freelancerFormData.password}
                    onChange={(e) => setFreelancerFormData({ ...freelancerFormData, password: e.target.value })}
                    required
                    className="col-span-2 bg-gray-50 border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition shadow-md hover:shadow-lg"
                >
                  {loading ? 'Creating...' : 'Create Freelancer'}
                </button>
              </form>
            )}

            {freelancers.length === 0 ? (
              <div className="bg-white rounded-xl p-16 text-center shadow-sm border border-gray-200">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 mb-6">
                  <Briefcase className="w-10 h-10 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Freelancers Yet</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">Expand your team by adding freelancers. They can work on specific projects and tasks.</p>
                <button
                  onClick={() => setShowFreelancerForm(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  Add First Freelancer
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                  <h3 className="text-base sm:text-lg font-semibold" style={{ color: '#1F2937' }}>All Freelancers</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Email</th>
                        <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {freelancers.map((freelancer: any) => (
                        <tr key={freelancer._id} className="hover:bg-gray-50">
                          <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div className="text-xs sm:text-sm font-medium" style={{ color: '#1F2937' }}>{freelancer.firstName} {freelancer.lastName}</div>
                            <div className="text-xs text-gray-500 sm:hidden mt-1">{freelancer.email}</div>
                          </td>
                          <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                            <div className="text-xs sm:text-sm text-gray-500">{freelancer.email}</div>
                          </td>
                          <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              freelancer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {freelancer.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium hidden md:table-cell">
                            <button
                              onClick={() => {
                                setSelectedFreelancer(freelancer);
                                setShowPasswordReset(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Reset Password
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Client Creation Modal */}
        {showClientForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Add New Client</h3>
                <button
                  onClick={() => setShowClientForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleCreateClient} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <input
                    type="text"
                    placeholder="Client Name *"
                    value={clientFormData.name}
                    onChange={(e) => setClientFormData({ ...clientFormData, name: e.target.value })}
                    required
                    className="col-span-2 bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                  <input
                    type="text"
                    placeholder="Client Type (e.g., Corporation, Individual) *"
                    value={clientFormData.type}
                    onChange={(e) => setClientFormData({ ...clientFormData, type: e.target.value })}
                    required
                    className="col-span-2 bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                  <input
                    type="email"
                    placeholder="Email Address *"
                    value={clientFormData.email}
                    onChange={(e) => setClientFormData({ ...clientFormData, email: e.target.value })}
                    required
                    className="col-span-2 bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={clientFormData.phone}
                    onChange={(e) => setClientFormData({ ...clientFormData, phone: e.target.value })}
                    className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                  <input
                    type="text"
                    placeholder="Contact Person Name"
                    value={clientFormData.contactPerson}
                    onChange={(e) => setClientFormData({ ...clientFormData, contactPerson: e.target.value })}
                    className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                  <input
                    type="url"
                    placeholder="OneDrive Link"
                    value={clientFormData.oneDriveLink}
                    onChange={(e) => setClientFormData({ ...clientFormData, oneDriveLink: e.target.value })}
                    className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                  <input
                    type="url"
                    placeholder="GitHub Link"
                    value={clientFormData.gitHubLink}
                    onChange={(e) => setClientFormData({ ...clientFormData, gitHubLink: e.target.value })}
                    className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                  <textarea
                    placeholder="Additional Notes"
                    value={clientFormData.notes}
                    onChange={(e) => setClientFormData({ ...clientFormData, notes: e.target.value })}
                    rows={3}
                    className="col-span-2 bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowClientForm(false)}
                    className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white px-6 py-3 rounded-xl transition-all font-semibold shadow-md hover:shadow-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl"
                  >
                    {loading ? 'Creating...' : 'Create Client'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'coder-rec' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Coder Recommendations Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
              <h2 className="text-xl sm:text-2xl font-bold" style={{ color: '#1F2937' }}>Coder Recommendations</h2>
              <button
                onClick={() => setShowCoderRecommendation(!showCoderRecommendation)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm sm:text-base shadow-md hover:shadow-lg"
              >
                <Plus className="w-4 h-4" />
                {showCoderRecommendation ? 'Cancel' : 'Add Recommendation'}
              </button>
            </div>

            {showCoderRecommendation && (
              <form onSubmit={handleAddCoderRecommendation} className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200">
                <h3 className="text-lg sm:text-xl font-bold mb-4" style={{ color: '#1F2937' }}>Add Coder Recommendation</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                  <select
                    value={coderRecData.employeeId}
                    onChange={(e) => setCoderRecData({ ...coderRecData, employeeId: e.target.value })}
                    required
                    className="col-span-1 sm:col-span-2 bg-gray-50 border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                  >
                    <option value="">Select Employee</option>
                    {employees.map((emp: any) => (
                      <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName} - {emp.email}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Skills (e.g., React, Node.js, MongoDB)"
                    value={coderRecData.skills}
                    onChange={(e) => setCoderRecData({ ...coderRecData, skills: e.target.value })}
                    required
                    className="col-span-1 bg-gray-50 border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                  />
                  <input
                    type="text"
                    placeholder="Experience Level (e.g., 3 years)"
                    value={coderRecData.experience}
                    onChange={(e) => setCoderRecData({ ...coderRecData, experience: e.target.value })}
                    required
                    className="col-span-1 bg-gray-50 border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                  />
                  <textarea
                    placeholder="Reason for Recommendation"
                    value={coderRecData.reason}
                    onChange={(e) => setCoderRecData({ ...coderRecData, reason: e.target.value })}
                    required
                    className="col-span-1 sm:col-span-2 bg-gray-50 border border-gray-300 rounded px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 min-h-20 text-sm sm:text-base"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition shadow-md hover:shadow-lg"
                >
                  {loading ? 'Adding...' : 'Add Recommendation'}
                </button>
              </form>
            )}

            {recommendations.length === 0 ? (
              <div className="bg-white rounded-xl p-16 text-center shadow-sm border border-gray-200">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 mb-6">
                  <Star className="w-10 h-10 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Recommendations Yet</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">Highlight your top coders by adding recommendations based on their skills and experience.</p>
                <button
                  onClick={() => setShowCoderRecommendation(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  Add First Recommendation
                </button>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {recommendations.map((rec: any) => (
                  <div key={rec._id} className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200 hover:shadow-sm transition">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0 mb-3">
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-semibold" style={{ color: '#1F2937' }}>
                          {rec.employeeId?.firstName} {rec.employeeId?.lastName}
                        </h3>
                        <p className="text-gray-500 text-xs sm:text-sm">{rec.employeeId?.email}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 whitespace-nowrap">
                        ★ Recommended
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3">
                      <div>
                        <p className="text-gray-600 text-xs sm:text-sm">Skills</p>
                        <p className="font-medium text-sm sm:text-base" style={{ color: '#1F2937' }}>{rec.skills}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs sm:text-sm">Experience</p>
                        <p className="font-medium text-sm sm:text-base" style={{ color: '#1F2937' }}>{rec.experience}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs sm:text-sm mb-2">Reason</p>
                      <p className="text-gray-700 text-sm sm:text-base">{rec.reason}</p>
                    </div>
                    <p className="text-gray-500 text-xs mt-3">
                      Added: {new Date(rec.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'leadership' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Leadership Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
              <h2 className="text-xl sm:text-2xl font-bold" style={{ color: '#1F2937' }}>Leadership Assignments</h2>
              <button
                onClick={() => setShowLeadershipAssignment(!showLeadershipAssignment)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2 text-sm sm:text-base shadow-md hover:shadow-lg"
              >
                <Plus className="w-4 h-4" />
                {showLeadershipAssignment ? 'Cancel' : 'Assign Leadership'}
              </button>
            </div>

            {showLeadershipAssignment && (
              <form onSubmit={handleAssignLeadership} className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200">
                <h3 className="text-lg sm:text-xl font-bold mb-4" style={{ color: '#1F2937' }}>Assign Leadership Role</h3>
                <div className="grid grid-cols-1 gap-4 mb-4">
                  <select
                    value={leadershipData.employeeId}
                    onChange={(e) => setLeadershipData({ ...leadershipData, employeeId: e.target.value })}
                    required
                    className="bg-gray-50 border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Employee</option>
                    {employees.map((emp: any) => (
                      <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName} - {emp.email}</option>
                    ))}
                  </select>
                  <select
                    value={leadershipData.leadership}
                    onChange={(e) => setLeadershipData({ ...leadershipData, leadership: e.target.value })}
                    required
                    className="bg-gray-50 border border-gray-300 rounded px-3 py-2 text-gray-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Leadership Role</option>
                    <option value="team-lead">Team Lead</option>
                    <option value="project-manager">Project Manager</option>
                    <option value="technical-lead">Technical Lead</option>
                    <option value="senior-developer">Senior Developer</option>
                    <option value="department-head">Department Head</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition shadow-md hover:shadow-lg"
                >
                  {loading ? 'Assigning...' : 'Assign Leadership'}
                </button>
              </form>
            )}

            <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold" style={{ color: '#1F2937' }}>Leadership Assignments</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee Name</th>
                      <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Email</th>
                      <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Leadership Role</th>
                      <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Assigned Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {leadershipAssignments.length === 0 ? (
                      <tr>
                        <td className="px-6 py-16 text-center" colSpan={4}>
                          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 mb-4">
                            <Award className="w-8 h-8 text-purple-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Leadership Roles Assigned</h3>
                          <p className="text-gray-500 text-sm mb-4 max-w-md mx-auto">Assign leadership roles to empower your team members with additional responsibilities.</p>
                          <button
                            onClick={() => setShowLeadershipAssignment(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                          >
                            <Plus className="w-4 h-4" />
                            Assign Leadership
                          </button>
                        </td>
                      </tr>
                    ) : (
                      leadershipAssignments.map((lead: any) => (
                        <tr key={lead._id} className="hover:bg-gray-50">
                          <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div className="text-xs sm:text-sm font-medium" style={{ color: '#1F2937' }}>
                              {lead.employeeId?.firstName} {lead.employeeId?.lastName}
                            </div>
                            <div className="text-xs text-gray-500 md:hidden mt-1">{lead.employeeId?.email}</div>
                          </td>
                          <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap hidden md:table-cell">
                            <div className="text-xs sm:text-sm text-gray-500">{lead.employeeId?.email}</div>
                          </td>
                          <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <span className="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                              {lead.leadership}
                            </span>
                          </td>
                          <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden lg:table-cell">
                            {new Date(lead.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'credentials' && (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold" style={{ color: '#1F2937' }}>Employee Credentials</h2>

            {employees.length === 0 ? (
              <div className="bg-white rounded-xl p-16 text-center shadow-sm border border-gray-200">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 mb-6">
                  <Key className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Credentials Available</h3>
                <p className="text-gray-500 text-sm mb-4 max-w-md mx-auto">Employee credentials will appear here once you add team members to your workspace.</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm">
                  <Users className="w-4 h-4" />
                  Add employees to view credentials
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                  <h3 className="text-base sm:text-lg font-semibold" style={{ color: '#1F2937' }}>Employee Credentials</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Email</th>
                        <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Employee ID</th>
                        <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-3 sm:px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {employees.map((employee: any) => (
                        <tr key={employee._id} className="hover:bg-gray-50">
                          <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <div className="text-xs sm:text-sm font-medium" style={{ color: '#1F2937' }}>
                              {employee.firstName} {employee.lastName}
                            </div>
                            <div className="text-xs text-gray-500 md:hidden mt-1">{employee.email}</div>
                          </td>
                          <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap hidden md:table-cell">
                            <div className="text-xs sm:text-sm text-gray-500">{employee.email}</div>
                          </td>
                          <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap hidden lg:table-cell">
                            <div className="text-xs sm:text-sm text-gray-500 font-mono truncate max-w-[150px]">{employee._id}</div>
                          </td>
                          <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              employee.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {employee.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium hidden sm:table-cell">
                            <button
                              onClick={() => {
                                setSelectedEmployee(employee);
                                setShowPasswordReset(true);
                                setNewPassword('');
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Reset Password
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
            {/* Send Message Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold" style={{ color: '#1F2937' }}>Send Message</h2>
                <button
                  type="button"
                  onClick={() => {
                    fetchMessages();
                    toast.success('Messages refreshed!');
                  }}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2 shadow-md hover:shadow-lg text-sm w-full sm:w-auto justify-center"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
              </div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  
                  if (!messageForm.recipientId || !messageForm.subject || !messageForm.content) {
                    toast.error('Please fill in all required fields');
                    return;
                  }

                  try {
                    setLoading(true);

                    // Handle different send methods
                    if (messageForm.app === 'gmail') {
                      // Open Gmail compose window
                      const recipient = messageForm.recipientType === 'employee' 
                        ? employees.find(e => e._id === messageForm.recipientId)
                        : clients.find(c => c._id === messageForm.recipientId);
                      
                      if (recipient) {
                        const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${recipient.email}&su=${encodeURIComponent(messageForm.subject)}&body=${encodeURIComponent(messageForm.content)}`;
                        window.open(gmailUrl, '_blank');
                        toast.success('Gmail compose window opened!');
                      } else {
                        toast.error('Please select a recipient');
                        setLoading(false);
                        return;
                      }
                    } else if (messageForm.app === 'whatsapp') {
                      // Open WhatsApp with message
                      const recipient = messageForm.recipientType === 'employee' 
                        ? employees.find(e => e._id === messageForm.recipientId)
                        : clients.find(c => c._id === messageForm.recipientId);
                      
                      if (recipient && recipient.phone) {
                        const whatsappMessage = `*${messageForm.subject}*\n\n${messageForm.content}`;
                        const phone = recipient.phone.replace(/[^0-9]/g, ''); // Remove non-numeric characters
                        const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage)}`;
                        window.open(whatsappUrl, '_blank');
                        toast.success('WhatsApp opened!');
                      } else {
                        toast.error('Recipient phone number not available');
                        setLoading(false);
                        return;
                      }
                    } else {
                      // Dashboard - send via API
                      await axios.post(`${API_BASE_URL}/messages`, {
                        recipientId: messageForm.recipientId,
                        recipientType: messageForm.recipientType === 'employee' ? 'User' : 'Client',
                        subject: messageForm.subject,
                        content: messageForm.content,
                        app: messageForm.app,
                      }, {
                        headers: {
                          Authorization: `Bearer ${getToken()}`,
                        },
                      });

                      toast.success(`Message sent successfully!`);
                      eventEmitter.emit(EVENTS.MESSAGE_SENT);
                      fetchMessages();
                    }

                    setMessageForm({ recipientId: '', recipientType: 'employee', subject: '', content: '', app: 'dashboard' });
                  } catch (error: any) {
                    console.error('Error sending message:', error);
                    toast.error(error.response?.data?.error || 'Failed to send message');
                  } finally {
                    setLoading(false);
                  }
                }}
                className="space-y-3 sm:space-y-4"
              >
                {/* Recipient Type */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Recipient Type</label>
                  <select
                    value={messageForm.recipientType}
                    onChange={(e) => setMessageForm({ ...messageForm, recipientType: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-900 focus:outline-none focus:border-blue-500 transition"
                  >
                    <option value="employee">Employee</option>
                    <option value="client">Client</option>
                  </select>
                </div>

                {/* Recipient Selection */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Select {messageForm.recipientType === 'employee' ? 'Employee' : 'Client'}</label>
                  <select
                    value={messageForm.recipientId}
                    onChange={(e) => setMessageForm({ ...messageForm, recipientId: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-900 focus:outline-none focus:border-blue-500 transition"
                  >
                    <option value="">Select a {messageForm.recipientType}...</option>
                    {messageForm.recipientType === 'employee'
                      ? employees.map((emp) => (
                          <option key={emp._id} value={emp._id}>
                            {emp.firstName} {emp.lastName} ({emp.email})
                          </option>
                        ))
                      : clients.map((client) => (
                          <option key={client._id} value={client._id}>
                            {client.companyName} ({client.email})
                          </option>
                        ))}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Subject</label>
                  <input
                    type="text"
                    value={messageForm.subject}
                    onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-900 focus:outline-none focus:border-blue-500 transition"
                    placeholder="Message subject..."
                  />
                </div>

                {/* Message Content */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Message</label>
                  <textarea
                    value={messageForm.content}
                    onChange={(e) => setMessageForm({ ...messageForm, content: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-900 focus:outline-none focus:border-blue-500 transition resize-none"
                    rows={5}
                    placeholder="Type your message here..."
                  ></textarea>
                </div>

                {/* App Selection */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-sm sm:text-base">Send via</label>
                  <div className="flex gap-3 sm:gap-4 flex-wrap">
                    {['gmail', 'dashboard'].map((app) => (
                      <label key={app} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="app"
                          value={app}
                          checked={messageForm.app === app}
                          onChange={(e) => setMessageForm({ ...messageForm, app: e.target.value })}
                          className="w-4 h-4"
                        />
                        <span className="text-gray-700 capitalize text-sm sm:text-base">
                          {app === 'dashboard' ? 'Dashboard' : 'Gmail'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-all duration-300 w-full shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            </div>

            {/* Message History */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold mb-4" style={{ color: '#1F2937' }}>Message History</h3>
              {messages.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 mb-3 sm:mb-4">
                    <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">No Messages Sent</h3>
                  <p className="text-gray-500 text-xs sm:text-sm">Your sent messages will appear here</p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {messages.map((msg: any) => (
                    <div key={msg._id} className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200 hover:border-indigo-300 transition-colors duration-300">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{msg.subject}</p>
                          <p className="text-gray-600 text-xs sm:text-sm truncate">
                            To: {msg.recipient?.firstName 
                              ? `${msg.recipient.firstName} ${msg.recipient.lastName}` 
                              : msg.recipientId?.firstName 
                              ? `${msg.recipientId.firstName} ${msg.recipientId.lastName}` 
                              : msg.recipient?.companyName || msg.recipientId?.companyName} 
                            ({msg.recipient?.email || msg.recipientId?.email})
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full uppercase font-semibold">{msg.app}</span>
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            msg.status === 'read' ? 'bg-green-100 text-green-800' :
                            msg.status === 'delivered' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>{msg.status}</span>
                        </div>
                      </div>
                      <p className="text-gray-700 text-xs sm:text-sm mt-2 whitespace-pre-wrap line-clamp-3 sm:line-clamp-none">{msg.content}</p>
                      <p className="text-gray-500 text-xs mt-2 sm:mt-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span>Sent {new Date(msg.createdAt).toLocaleString()}</span>
                        {msg.readAt && (
                          <span className="text-green-600">• Read {new Date(msg.readAt).toLocaleString()}</span>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'client-messages' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold" style={{ color: '#1F2937' }}>Client Messages</h2>
              <button
                onClick={() => {
                  const allClientMessages = JSON.parse(localStorage.getItem('allClientMessages') || '[]');
                  setClientMessages(allClientMessages);
                  toast.success('Client messages refreshed!');
                }}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>

            {clientMessages.length === 0 ? (
              <div className="bg-white rounded-xl p-16 text-center shadow-sm border border-gray-200">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 mb-6">
                  <FileText className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Client Messages</h3>
                <p className="text-gray-500 text-sm mb-4 max-w-md mx-auto">Messages from your clients will appear here. Stay connected and respond promptly to maintain great client relationships.</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm">
                  <Activity className="w-4 h-4" />
                  Inbox is empty
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {clientMessages.map((msg: any) => (
                  <div
                    key={msg._id}
                    className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-sm transition"
                  >
                    {/* Message Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold" style={{ color: '#1F2937' }}>{msg.subject}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-gray-600 text-sm">
                            From: <span className="text-purple-600 font-semibold">{msg.sender}</span>
                          </p>
                          {msg.clientId && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                              {msg.clientId.companyName}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-gray-500 text-sm">
                        {new Date(msg.sentAt).toLocaleString()}
                      </span>
                    </div>

                    {/* Message Content */}
                    <div className="bg-gray-50 rounded p-4 mb-4 border-l-4 border-purple-500">
                      <p className="text-gray-700 whitespace-pre-wrap">{msg.content}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedClientMessage(msg)}
                        className="text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded transition shadow-md hover:shadow-lg"
                      >
                        Reply
                      </button>
                      <button className="text-sm bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded transition shadow-md hover:shadow-lg">
                        Archive
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      {/* Reply to Client Message Modal */}
      {selectedClientMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg sm:rounded-xl max-w-2xl w-full border border-gray-600 shadow-2xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center border-b border-gray-600 rounded-t-lg sm:rounded-t-xl">
              <h3 className="text-base sm:text-xl font-bold text-white truncate pr-2">Reply to {selectedClientMessage.sender}</h3>
              <button
                onClick={() => {
                  setSelectedClientMessage(null);
                  setReplyForm('');
                }}
                className="text-white hover:text-gray-300 text-2xl font-bold flex-shrink-0 w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {/* Original Message */}
              <div className="bg-gray-700 rounded-lg p-3 sm:p-4 border-l-4 border-purple-500">
                <p className="text-gray-400 text-xs sm:text-sm mb-2 font-semibold">Original Message:</p>
                <p className="text-white font-semibold mb-2 text-sm sm:text-base">{selectedClientMessage.subject}</p>
                <p className="text-gray-300 text-xs sm:text-sm whitespace-pre-wrap break-words">{selectedClientMessage.content}</p>
              </div>

              {/* Reply Form */}
              <div>
                <label className="block text-gray-300 font-semibold mb-2 text-sm sm:text-base">Your Reply</label>
                <textarea
                  value={replyForm}
                  onChange={(e) => setReplyForm(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-white text-sm sm:text-base focus:outline-none focus:border-blue-500 transition resize-none"
                  rows={4}
                  placeholder="Type your reply here..."
                ></textarea>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end p-4 sm:p-6 pt-0 border-t border-gray-700">
              <button
                onClick={() => {
                  setSelectedClientMessage(null);
                  setReplyForm('');
                }}
                className="text-xs sm:text-sm bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 sm:px-6 py-2 rounded-lg transition font-medium shadow-md hover:shadow-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!replyForm.trim()) {
                    toast.error('Please enter a reply');
                    return;
                  }
                  
                  // Create reply object
                  const reply = {
                    _id: Date.now(),
                    messageId: selectedClientMessage._id,
                    adminReply: replyForm,
                    repliedAt: new Date(),
                    adminName: user?.firstName + ' ' + user?.lastName,
                  };
                  
                  // Store reply in localStorage
                  const allReplies = JSON.parse(localStorage.getItem('allClientReplies') || '[]');
                  allReplies.push(reply);
                  localStorage.setItem('allClientReplies', JSON.stringify(allReplies));
                  
                  toast.success('Reply sent successfully!');
                  setSelectedClientMessage(null);
                  setReplyForm('');
                }}
                className="text-xs sm:text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 sm:px-6 py-2 rounded-lg transition font-medium shadow-md hover:shadow-lg"
              >
                Send Reply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark Project Complete Modal */}
      {showProjectComplete && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full border border-gray-600">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-800 px-6 py-4 flex justify-between items-center border-b border-gray-600">
              <h3 className="text-xl font-bold text-white">Mark Project Complete</h3>
              <button
                onClick={() => {
                  setShowProjectComplete(false);
                  setSelectedProject(null);
                }}
                className="text-white hover:text-gray-300 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-4">
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Project</h4>
                <p className="text-gray-200 text-lg font-semibold">{selectedProject.title}</p>
                <p className="text-gray-400 text-sm">{selectedProject.description}</p>
              </div>

              <div className="mb-4 p-3 bg-green-700 bg-opacity-20 rounded-lg border border-green-600">
                <p className="text-sm text-green-300">
                  <strong>✓ Note:</strong> Once marked as complete, this project will be added to all assigned employees' project history.
                </p>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-300"><strong>Status:</strong> <span className="capitalize text-blue-400">{selectedProject.status}</span></p>
                <p className="text-sm text-gray-300"><strong>Priority:</strong> <span className="capitalize text-yellow-400">{selectedProject.priority}</span></p>
                <p className="text-sm text-gray-300"><strong>Client:</strong> <span className="text-blue-400">{selectedProject.clientId?.name || 'N/A'}</span></p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-700 px-6 py-4 border-t border-gray-600 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowProjectComplete(false);
                  setSelectedProject(null);
                }}
                className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg transition shadow-md hover:shadow-lg"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    const token = getToken();
                    await axios.put(
                      `${API_BASE_URL}/projects/${selectedProject._id}`,
                      { status: 'completed' },
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    toast.success('Project marked as complete! Employees will see it in their project history.');
                    setShowProjectComplete(false);
                    setSelectedProject(null);
                    fetchProjects();
                  } catch (error: any) {
                    toast.error(error.response?.data?.error || 'Failed to mark project as complete');
                  }
                }}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition shadow-md hover:shadow-lg"
              >
                Mark Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Meetings Tab */}
      {activeTab === 'meetings' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Meeting Scheduler</h2>
            <button
              onClick={() => setShowMeetingForm(!showMeetingForm)}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl transition-all flex items-center gap-2 shadow-lg hover:shadow-xl font-semibold"
            >
              <Plus className="w-5 h-5" />
              Schedule Meeting
            </button>
          </div>

          {/* Create Meeting Form */}
          {showMeetingForm && (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50">
                <h3 className="text-xl font-bold text-gray-900">Schedule New Meeting</h3>
              </div>
              <form onSubmit={handleCreateMeeting} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <input
                    type="text"
                    placeholder="Meeting Title *"
                    value={meetingForm.title}
                    onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
                    required
                    className="col-span-2 bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
                  />
                  <textarea
                    placeholder="Description"
                    value={meetingForm.description}
                    onChange={(e) => setMeetingForm({ ...meetingForm, description: e.target.value })}
                    rows={3}
                    className="col-span-2 bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-white transition-all resize-none"
                  />
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Meeting Date *</label>
                    <input
                      type="date"
                      value={meetingForm.date}
                      onChange={(e) => setMeetingForm({ ...meetingForm, date: e.target.value })}
                      required
                      className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700">Meeting Time *</label>
                    <input
                      type="time"
                      value={meetingForm.time}
                      onChange={(e) => setMeetingForm({ ...meetingForm, time: e.target.value })}
                      required
                      className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
                    />
                  </div>
                  <select
                    value={meetingForm.duration}
                    onChange={(e) => setMeetingForm({ ...meetingForm, duration: e.target.value })}
                    className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                  </select>
                  <input
                    type="url"
                    placeholder="Meeting Link (Zoom, Google Meet, etc.)"
                    value={meetingForm.meetingLink}
                    onChange={(e) => setMeetingForm({ ...meetingForm, meetingLink: e.target.value })}
                    className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:bg-white transition-all"
                  />
                </div>

                {/* Attendee Selection */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Select Attendees *</h4>
                  
                  {/* Employees */}
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Employees</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-lg border border-gray-200">
                      {employees.map((emp: any) => (
                        <label key={emp._id} className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={meetingForm.attendees.includes(emp._id)}
                            onChange={() => handleToggleAttendee(emp._id, 'employee')}
                            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                          />
                          <span className="text-sm text-gray-700">{emp.firstName} {emp.lastName}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Clients */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Clients</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-lg border border-gray-200">
                      {clients.map((client: any) => (
                        <label key={client._id} className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={meetingForm.attendees.includes(client._id)}
                            onChange={() => handleToggleAttendee(client._id, 'client')}
                            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                          />
                          <span className="text-sm text-gray-700">{client.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowMeetingForm(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-xl transition-all font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl"
                  >
                    Schedule Meeting
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Meetings List */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
              <h3 className="text-xl font-bold text-gray-900">Scheduled Meetings</h3>
            </div>
            <div className="p-6">
              {meetings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100 mb-4">
                    <Video className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Meetings Scheduled</h3>
                  <p className="text-gray-500 text-sm">Schedule a meeting to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {meetings.map((meeting: any) => (
                    <div key={meeting._id} className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-5 border border-purple-200 hover:border-purple-300 hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-gray-900 mb-1">{meeting.title}</h4>
                          {meeting.description && (
                            <p className="text-sm text-gray-600 mb-2">{meeting.description}</p>
                          )}
                        </div>
                        <span className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-medium capitalize">
                          {meeting.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Activity className="w-4 h-4 text-purple-600" />
                          <span>{new Date(meeting.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Activity className="w-4 h-4 text-purple-600" />
                          <span>{meeting.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Activity className="w-4 h-4 text-purple-600" />
                          <span>{meeting.duration} min</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Users className="w-4 h-4 text-purple-600" />
                          <span>{meeting.attendees.length} attendees</span>
                        </div>
                      </div>
                      {meeting.meetingLink && (
                        <a
                          href={meeting.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                        >
                          <Video className="w-4 h-4" />
                          Join Meeting
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordReset && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full border border-gray-600">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 flex justify-between items-center border-b border-gray-600">
              <h3 className="text-xl font-bold text-white">Reset Password</h3>
              <button
                onClick={() => {
                  setShowPasswordReset(false);
                  setSelectedEmployee(null);
                  setNewPassword('');
                }}
                className="text-white hover:text-gray-300 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-4">
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Employee</h4>
                <p className="text-gray-200">
                  {(selectedEmployee || selectedFreelancer)?.firstName} {(selectedEmployee || selectedFreelancer)?.lastName}
                </p>
                <p className="text-gray-400 text-sm">{(selectedEmployee || selectedFreelancer)?.email}</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-300 mb-2">New Password</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="mb-4 p-3 bg-gray-700 rounded-lg">
                <p className="text-xs text-gray-400">
                  <strong>Note:</strong> The {selectedFreelancer ? 'freelancer' : 'employee'} will use this password to login. Make sure to share it securely.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-700 px-6 py-4 border-t border-gray-600 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPasswordReset(false);
                  setSelectedEmployee(null);
                  setSelectedFreelancer(null);
                  setNewPassword('');
                }}
                className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg transition shadow-md hover:shadow-lg"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!newPassword.trim()) {
                    toast.error('Please enter a new password');
                    return;
                  }
                  try {
                    const token = getToken();
                    const userId = selectedEmployee?._id || selectedFreelancer?._id;
                    await axios.post(
                      `${API_BASE_URL}/auth/reset-password/${userId}`,
                      { newPassword },
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    toast.success('Password reset successfully!');
                    setShowPasswordReset(false);
                    setSelectedEmployee(null);
                    setSelectedFreelancer(null);
                    setNewPassword('');
                    fetchEmployees();
                    fetchFreelancers();
                  } catch (error: any) {
                    toast.error(error.response?.data?.error || 'Failed to reset password');
                  }
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition shadow-md hover:shadow-lg"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Details Modal */}
      {selectedUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto border border-gray-600">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 flex justify-between items-center border-b border-gray-600">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {selectedUpdate.employeeId?.firstName} {selectedUpdate.employeeId?.lastName}
                </h3>
                <p className="text-blue-100 text-sm">
                  {new Date(selectedUpdate.date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <button
                onClick={() => setSelectedUpdate(null)}
                className="text-white hover:text-gray-300 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-4">
              {/* Project Tag */}
              <div className="mb-4">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {selectedUpdate.projectId?.title || 'Project'}
                </span>
              </div>

              {/* Summary */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Summary</h4>
                <p className="text-gray-200 whitespace-pre-wrap">{selectedUpdate.summary}</p>
              </div>

              {/* Checklist */}
              {selectedUpdate.checklist && selectedUpdate.checklist.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">Checklist</h4>
                  <ul className="space-y-2">
                    {selectedUpdate.checklist.map((item: any, idx: number) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-200">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          disabled
                          className="w-4 h-4"
                        />
                        <span>{item.task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Hours Attended */}
              {selectedUpdate.hoursAttended && selectedUpdate.hoursAttended > 0 && (
                <div className="mb-4 p-3 bg-orange-900/30 rounded border-l-4 border-orange-500">
                  <p className="text-xs font-semibold text-orange-300 mb-1">HOURS ATTENDED</p>
                  <p className="text-lg font-bold text-orange-200">{selectedUpdate.hoursAttended} hours</p>
                </div>
              )}

              {/* PROJECT MANAGEMENT Checklist */}
              {selectedUpdate.projectManagement && selectedUpdate.projectManagement.length > 0 && (
                <div className="mb-4 p-3 bg-purple-900/30 rounded border-l-4 border-purple-500">
                  <p className="text-xs font-semibold text-purple-300 mb-2">📊 PROJECT MANAGEMENT</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {selectedUpdate.projectManagement.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          disabled
                          className="w-4 h-4 mt-0.5"
                        />
                        <span className={`text-xs ${item.completed ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                          {item.item}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-purple-300 font-semibold">
                    {selectedUpdate.projectManagement.filter((i: any) => i.completed).length} / {selectedUpdate.projectManagement.length} completed
                  </div>
                </div>
              )}

              {/* DAILY UPDATE Checklist */}
              {selectedUpdate.dailyUpdate && selectedUpdate.dailyUpdate.length > 0 && (
                <div className="mb-4 p-3 bg-blue-900/30 rounded border-l-4 border-blue-500">
                  <p className="text-xs font-semibold text-blue-300 mb-2">📋 DAILY UPDATE</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {selectedUpdate.dailyUpdate.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          disabled
                          className="w-4 h-4 mt-0.5"
                        />
                        <span className={`text-xs ${item.completed ? 'line-through text-gray-500' : 'text-gray-300'}`}>
                          {item.item}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-blue-300 font-semibold">
                    {selectedUpdate.dailyUpdate.filter((i: any) => i.completed).length} / {selectedUpdate.dailyUpdate.length} completed
                  </div>
                </div>
              )}

              {/* Next Plan */}
              {selectedUpdate.nextPlan && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">Next Plan</h4>
                  <p className="text-gray-200 whitespace-pre-wrap">{selectedUpdate.nextPlan}</p>
                </div>
              )}

              {/* Loom Video Link */}
              {selectedUpdate.loomVideoLink && (
                <div className="mb-4">
                  <a
                    href={selectedUpdate.loomVideoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg transition shadow-md hover:shadow-lg"
                  >
                    🎥 Watch Loom Video
                  </a>
                </div>
              )}

              {/* Attachments */}
              {selectedUpdate.attachments && selectedUpdate.attachments.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">Attachments</h4>
                  <div className="space-y-2">
                    {selectedUpdate.attachments.map((attachment: any, idx: number) => (
                      <a
                        key={idx}
                        href={attachment.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-blue-400 hover:text-blue-300 text-sm truncate"
                      >
                        📎 {attachment.fileName}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Employee Info */}
              <div className="border-t border-gray-600 pt-4 mt-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Employee Information</h4>
                <p className="text-gray-400 text-sm">
                  <span className="font-semibold">Email:</span> {selectedUpdate.employeeId?.email}
                </p>
                {selectedUpdate.employeeId?.phone && (
                  <p className="text-gray-400 text-sm">
                    <span className="font-semibold">Phone:</span> {selectedUpdate.employeeId.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-700 px-6 py-4 border-t border-gray-600 flex justify-end">
              <button
                onClick={() => setSelectedUpdate(null)}
                className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg transition shadow-md hover:shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Training Tab */}
      {activeTab === 'training' && (
        <div className="space-y-4 sm:space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Employee Training</h2>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => setShowNewTraineeModal(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl font-semibold text-sm sm:text-base"
              >
                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                Add Trainee
              </button>
              <button
                onClick={() => setShowTrainingForm(!showTrainingForm)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl font-semibold text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                Assign Training
              </button>
            </div>
          </div>

          {/* Add Trainee Modal */}
          {showNewTraineeModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl animate-slideDown">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-white" />
                  </div>
                  <span>Add New Trainee</span>
                </h3>
                <form onSubmit={handleCreateTrainee}>
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">First Name *</label>
                      <input
                        type="text"
                        value={newTraineeForm.firstName}
                        onChange={(e) => setNewTraineeForm({ ...newTraineeForm, firstName: e.target.value })}
                        required
                        className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:bg-white transition-all"
                        placeholder="Enter first name"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Last Name *</label>
                      <input
                        type="text"
                        value={newTraineeForm.lastName}
                        onChange={(e) => setNewTraineeForm({ ...newTraineeForm, lastName: e.target.value })}
                        required
                        className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:bg-white transition-all"
                        placeholder="Enter last name"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Email *</label>
                      <input
                        type="email"
                        value={newTraineeForm.email}
                        onChange={(e) => setNewTraineeForm({ ...newTraineeForm, email: e.target.value })}
                        required
                        className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:bg-white transition-all"
                        placeholder="trainee@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Password *</label>
                      <input
                        type="password"
                        value={newTraineeForm.password}
                        onChange={(e) => setNewTraineeForm({ ...newTraineeForm, password: e.target.value })}
                        required
                        minLength={6}
                        className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:bg-white transition-all"
                        placeholder="Minimum 6 characters"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewTraineeModal(false);
                        setNewTraineeForm({
                          firstName: '',
                          lastName: '',
                          email: '',
                          password: '',
                        });
                      }}
                      className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
                    >
                      {loading ? 'Creating...' : 'Add Trainee'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Create Training Form */}
          {showTrainingForm && (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Assign New Training Task</h3>
              </div>
              <form onSubmit={handleCreateTraining} className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <input
                    type="text"
                    placeholder="Training Task Title *"
                    value={trainingForm.title}
                    onChange={(e) => setTrainingForm({ ...trainingForm, title: e.target.value })}
                    required
                    className="col-span-2 bg-gray-50 border-2 border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  />
                  <textarea
                    placeholder="Description *"
                    value={trainingForm.description}
                    onChange={(e) => setTrainingForm({ ...trainingForm, description: e.target.value })}
                    required
                    rows={4}
                    className="col-span-2 bg-gray-50 border-2 border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all resize-none"
                  />
                  <div className="flex flex-col gap-2">
                    <label className="text-xs sm:text-sm font-medium text-gray-700">Select Trainee *</label>
                    <select
                      value={trainingForm.traineeId}
                      onChange={(e) => {
                        const selectedTrainee = trainees.find(t => t._id === e.target.value);
                        setTrainingForm({ 
                          ...trainingForm, 
                          traineeId: e.target.value,
                          traineeName: selectedTrainee ? `${selectedTrainee.firstName} ${selectedTrainee.lastName}` : ''
                        });
                      }}
                      required
                      className="bg-gray-50 border-2 border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    >
                      <option value="">Choose a trainee...</option>
                      {trainees.map((trainee: any) => (
                        <option key={trainee._id} value={trainee._id}>
                          {trainee.firstName} {trainee.lastName} - {trainee.email}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs sm:text-sm font-medium text-gray-700">Deadline *</label>
                    <input
                      type="date"
                      value={trainingForm.deadline}
                      onChange={(e) => setTrainingForm({ ...trainingForm, deadline: e.target.value })}
                      required
                      className="bg-gray-50 border-2 border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-900 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    />
                  </div>
                  <textarea
                    placeholder="Resources (links, documents, etc.)"
                    value={trainingForm.resources}
                    onChange={(e) => setTrainingForm({ ...trainingForm, resources: e.target.value })}
                    rows={3}
                    className="col-span-2 bg-gray-50 border-2 border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setShowTrainingForm(false)}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl transition shadow-md hover:shadow-lg font-medium text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition shadow-md hover:shadow-lg font-medium disabled:opacity-50 text-sm sm:text-base"
                  >
                    {loading ? 'Assigning...' : 'Assign Training'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Training Tasks List */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Training Tasks ({trainingTasks.length})</h3>
            </div>
            
            {trainingTasks.length === 0 ? (
              <div className="p-6 sm:p-8 text-center text-gray-500">
                <GraduationCap className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-300" />
                <p className="text-base sm:text-lg">No training tasks assigned yet</p>
                <p className="text-xs sm:text-sm mt-2">Click "Assign Training" to create your first training task</p>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-gray-100">
                  {trainingTasks.map((task: any) => (
                    <div key={task._id} className="p-4 space-y-3">
                      <div>
                        <div className="font-semibold text-gray-900 mb-1">{task.title}</div>
                        <div className="text-sm text-gray-500 line-clamp-2">{task.description}</div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600 font-medium">Trainee:</span>
                          <div className="text-gray-900">{task.traineeName}</div>
                          <div className="text-xs text-gray-500">{task.traineeId?.email}</div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-gray-600 font-medium">Deadline:</span>
                            <div className="text-gray-900">{new Date(task.deadline).toLocaleDateString()}</div>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            task.status === 'completed' ? 'bg-green-100 text-green-700' :
                            task.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-600 font-medium">Progress:</span>
                            <span className="text-sm text-gray-600 font-medium">{task.progress}%</span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleDeleteTraining(task._id)}
                        className="w-full py-2 text-red-600 hover:bg-red-50 font-medium text-sm rounded-lg transition-colors"
                      >
                        Delete Task
                      </button>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Task</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Trainee</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Deadline</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Progress</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {trainingTasks.map((task: any) => (
                        <tr key={task._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{task.title}</div>
                            <div className="text-sm text-gray-500 line-clamp-2">{task.description}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-gray-900">{task.traineeName}</div>
                            <div className="text-sm text-gray-500">{task.traineeId?.email}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-900">
                            {new Date(task.deadline).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              task.status === 'completed' ? 'bg-green-100 text-green-700' :
                              task.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {task.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                                <div 
                                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all"
                                  style={{ width: `${task.progress}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600 font-medium">{task.progress}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleDeleteTraining(task._id)}
                              className="text-red-600 hover:text-red-800 font-medium text-sm"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>

          {/* Trainees Overview */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Training Employees ({trainees.length})</h3>
            </div>
            <div className="p-4 sm:p-6">
              {trainees.length === 0 ? (
                <div className="text-center text-gray-500 py-6 sm:py-8">
                  <Users className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-300" />
                  <p className="text-sm sm:text-base">No training employees found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {trainees.map((trainee: any) => (
                    <div key={trainee._id} className="p-3 sm:p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {trainee.firstName[0]}{trainee.lastName[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm sm:text-base">{trainee.firstName} {trainee.lastName}</div>
                          <div className="text-xs sm:text-sm text-gray-500 truncate max-w-[150px] sm:max-w-none">{trainee.email}</div>
                        </div>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">
                        <div>Phone: {trainee.phone || 'N/A'}</div>
                        <div>Status: <span className={`font-medium ${trainee.isActive ? 'text-green-600' : 'text-red-600'}`}>
                          {trainee.isActive ? 'Active' : 'Inactive'}
                        </span></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Points Management Tab */}
      {activeTab === 'points' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Employee Points Management</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowPointsModal(true)}
                className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl font-semibold text-sm sm:text-base"
              >
                <MinusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                Apply Penalty
              </button>
              <button
                onClick={fetchEmployeePoints}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl font-semibold text-sm sm:text-base"
              >
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                Refresh
              </button>
            </div>
          </div>

          {/* Apply Penalty Modal */}
          {showPointsModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl animate-slideDown">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-500 rounded-lg flex items-center justify-center">
                    <MinusCircle className="w-5 h-5 text-white" />
                  </div>
                  <span>Apply Penalty</span>
                </h3>
                <form onSubmit={handleApplyPenalty}>
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Select Employee *</label>
                      <select
                        value={pointsForm.employeeId}
                        onChange={(e) => setPointsForm({ ...pointsForm, employeeId: e.target.value })}
                        required
                        className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                      >
                        <option value="">Choose an employee...</option>
                        {employeePoints.map((emp: any) => (
                          <option key={emp.employeeId} value={emp.employeeId}>
                            {emp.employeeName} - {emp.totalPoints} points
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Penalty Amount *</label>
                      <input
                        type="number"
                        value={pointsForm.amount}
                        onChange={(e) => setPointsForm({ ...pointsForm, amount: e.target.value })}
                        required
                        min="1"
                        className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:bg-white transition-all"
                        placeholder="Enter penalty amount"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Reason *</label>
                      <textarea
                        value={pointsForm.reason}
                        onChange={(e) => setPointsForm({ ...pointsForm, reason: e.target.value })}
                        required
                        rows={3}
                        className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:bg-white transition-all resize-none"
                        placeholder="Why is this penalty being applied?"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPointsModal(false);
                        setPointsForm({
                          employeeId: '',
                          amount: '',
                          reason: '',
                          type: 'penalty',
                        });
                      }}
                      className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
                    >
                      {loading ? 'Applying...' : 'Apply Penalty'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Points Table */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Employee Points Summary</h3>
            </div>
            {employeePoints.length === 0 ? (
              <div className="p-6 sm:p-8 text-center text-gray-500">
                <Zap className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-base sm:text-lg">No employee points data available</p>
                <p className="text-sm mt-2">Points will appear here as employees earn them</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Rank</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Employee</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total Points</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Monthly Points</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {employeePoints.map((emp: any) => (
                        <tr key={emp.employeeId} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {emp.rank === 1 && <span className="text-2xl">🥇</span>}
                              {emp.rank === 2 && <span className="text-2xl">🥈</span>}
                              {emp.rank === 3 && <span className="text-2xl">🥉</span>}
                              <span className="font-semibold text-gray-900">#{emp.rank}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{emp.employeeName}</div>
                            <div className="text-sm text-gray-500">{emp.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Zap className="w-5 h-5 text-yellow-500" />
                              <span className="font-bold text-lg text-gray-900">{emp.totalPoints}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-900">{emp.monthlyPoints}</span>
                            <span className="text-gray-500 text-sm"> / 200</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              emp.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {emp.isActive ? 'Active' : 'Expired'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleViewEmployeePoints(emp.employeeId)}
                              className="text-blue-600 hover:text-blue-800 font-medium text-sm hover:underline"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden divide-y divide-gray-100">
                  {employeePoints.map((emp: any) => (
                    <div key={emp.employeeId} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {emp.rank === 1 && <span className="text-xl">🥇</span>}
                          {emp.rank === 2 && <span className="text-xl">🥈</span>}
                          {emp.rank === 3 && <span className="text-xl">🥉</span>}
                          <span className="font-semibold text-gray-900 text-sm">#{emp.rank}</span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          emp.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {emp.isActive ? 'Active' : 'Expired'}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <div className="font-medium text-gray-900">{emp.employeeName}</div>
                        <div className="text-sm text-gray-500 mt-0.5">{emp.email}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-3 rounded-lg border border-yellow-100">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            <span className="text-xs text-gray-600 font-medium">Total Points</span>
                          </div>
                          <span className="font-bold text-lg text-gray-900">{emp.totalPoints}</span>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-100">
                          <div className="text-xs text-gray-600 font-medium mb-1">Monthly</div>
                          <span className="font-bold text-lg text-gray-900">{emp.monthlyPoints}</span>
                          <span className="text-gray-500 text-xs"> / 200</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleViewEmployeePoints(emp.employeeId)}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white py-2 rounded-lg font-medium text-sm transition-all shadow-sm"
                      >
                        View Details
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Selected Employee Details */}
          {selectedEmployeePoints && (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50 flex justify-between items-start sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-xl font-bold text-gray-900 truncate">{selectedEmployeePoints.employeeName}'s Points History</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">{selectedEmployeePoints.email}</p>
                </div>
                <button
                  onClick={() => setSelectedEmployeePoints(null)}
                  className="text-gray-500 hover:text-gray-700 flex-shrink-0"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-3 sm:p-4 rounded-lg border border-blue-100">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Points</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{selectedEmployeePoints.totalPoints}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 sm:p-4 rounded-lg border border-green-100">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Monthly Points</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{selectedEmployeePoints.monthlyPoints}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 sm:p-4 rounded-lg border border-purple-100">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1">Cap Remaining</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{selectedEmployeePoints.monthlyCapRemaining}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Recent Transactions</h4>
                  {selectedEmployeePoints.transactions && selectedEmployeePoints.transactions.length > 0 ? (
                    selectedEmployeePoints.transactions.map((transaction: any, index: number) => (
                      <div key={index} className="flex justify-between items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{transaction.reason || transaction.type}</p>
                          <p className="text-xs text-gray-500">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`font-bold text-base sm:text-lg flex-shrink-0 ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No transactions yet</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

        {activeTab === 'hackathon' && (
          <div className="space-y-4 sm:space-y-6 animate-fadeIn">
            {/* Header with Buttons */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Hackathon Management</h2>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => setShowHackathonForm(!showHackathonForm)}
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl font-semibold text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  Create Hackathon
                </button>
              </div>
            </div>

            {/* Create Hackathon Form */}
            {showHackathonForm && (
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 bg-gradient-to-r from-yellow-50 to-orange-50">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Create New Hackathon</h3>
                </div>
                <form onSubmit={handleCreateHackathon} className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <input
                      type="text"
                      placeholder="Hackathon Name *"
                      value={hackathonForm.name}
                      onChange={(e) => setHackathonForm({ ...hackathonForm, name: e.target.value })}
                      required
                      className="col-span-2 bg-gray-50 border-2 border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:bg-white transition-all"
                    />
                    <textarea
                      placeholder="Description *"
                      value={hackathonForm.description}
                      onChange={(e) => setHackathonForm({ ...hackathonForm, description: e.target.value })}
                      required
                      rows={4}
                      className="col-span-2 bg-gray-50 border-2 border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:bg-white transition-all resize-none"
                    />
                    <input
                      type="text"
                      placeholder="Theme *"
                      value={hackathonForm.theme}
                      onChange={(e) => setHackathonForm({ ...hackathonForm, theme: e.target.value })}
                      required
                      className="bg-gray-50 border-2 border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:bg-white transition-all"
                    />
                    <input
                      type="number"
                      placeholder="Max Players *"
                      value={hackathonForm.maxPlayers}
                      onChange={(e) => setHackathonForm({ ...hackathonForm, maxPlayers: e.target.value })}
                      required
                      min="1"
                      className="bg-gray-50 border-2 border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:bg-white transition-all"
                    />
                    <input
                      type="date"
                      value={hackathonForm.startDate}
                      onChange={(e) => setHackathonForm({ ...hackathonForm, startDate: e.target.value })}
                      required
                      className="bg-gray-50 border-2 border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-900 focus:outline-none focus:border-yellow-500 focus:bg-white transition-all"
                      title="Start Date"
                    />
                    <input
                      type="date"
                      value={hackathonForm.endDate}
                      onChange={(e) => setHackathonForm({ ...hackathonForm, endDate: e.target.value })}
                      required
                      className="bg-gray-50 border-2 border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-900 focus:outline-none focus:border-yellow-500 focus:bg-white transition-all"
                      title="End Date"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => setShowHackathonForm(false)}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl transition shadow-md hover:shadow-lg font-medium text-sm sm:text-base"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-xl transition shadow-md hover:shadow-lg font-medium disabled:opacity-50 text-sm sm:text-base"
                    >
                      {loading ? 'Creating...' : 'Create Hackathon'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Hackathons List */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 bg-gradient-to-r from-yellow-50 to-orange-50">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Hackathons ({hackathons.length})</h3>
              </div>
              
              {hackathons.length === 0 ? (
                <div className="p-6 sm:p-8 text-center text-gray-500">
                  <Trophy className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-300" />
                  <p className="text-base sm:text-lg">No hackathons created yet</p>
                  <p className="text-xs sm:text-sm mt-2">Click "Create Hackathon" to start</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {hackathons.map((hackathon: any) => (
                    <div
                      key={hackathon._id}
                      onClick={() => setSelectedHackathon(hackathon)}
                      className={`p-4 sm:p-6 cursor-pointer transition-all ${
                        selectedHackathon?._id === hackathon._id
                          ? 'bg-yellow-50 border-l-4 border-yellow-500'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">{hackathon.name}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{hackathon.description}</p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm">
                            <div>
                              <span className="text-gray-600 font-medium">Theme:</span>
                              <p className="text-gray-900">{hackathon.theme}</p>
                            </div>
                            <div>
                              <span className="text-gray-600 font-medium">Players:</span>
                              <p className="text-gray-900">{hackathon.currentPlayers || 0}/{hackathon.maxPlayers}</p>
                            </div>
                            <div>
                              <span className="text-gray-600 font-medium">Status:</span>
                              <p className="text-gray-900 capitalize">{hackathon.status}</p>
                            </div>
                            <div>
                              <span className="text-gray-600 font-medium">Duration:</span>
                              <p className="text-gray-900">
                                {new Date(hackathon.startDate).toLocaleDateString()} - {new Date(hackathon.endDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Hackathon Details and Task Management */}
            {selectedHackathon && (
              <>
                {/* Task Assignment Form */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-yellow-50">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Assign Tasks - {selectedHackathon.name}</h3>
                  </div>
                  
                  {showHackathonTaskForm && (
                    <form onSubmit={handleCreateHackathonTask} className="p-4 sm:p-6 border-b border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <input
                          type="text"
                          placeholder="Task Title *"
                          value={hackathonTaskForm.title}
                          onChange={(e) => setHackathonTaskForm({ ...hackathonTaskForm, title: e.target.value })}
                          required
                          className="col-span-2 bg-gray-50 border-2 border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                        />
                        <textarea
                          placeholder="Description *"
                          value={hackathonTaskForm.description}
                          onChange={(e) => setHackathonTaskForm({ ...hackathonTaskForm, description: e.target.value })}
                          required
                          rows={3}
                          className="col-span-2 bg-gray-50 border-2 border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all resize-none"
                        />
                        <select
                          value={hackathonTaskForm.priority}
                          onChange={(e) => setHackathonTaskForm({ ...hackathonTaskForm, priority: e.target.value })}
                          className="bg-gray-50 border-2 border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-900 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                        >
                          <option value="low">Low Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="high">High Priority</option>
                        </select>
                        <input
                          type="date"
                          value={hackathonTaskForm.dueDate}
                          onChange={(e) => setHackathonTaskForm({ ...hackathonTaskForm, dueDate: e.target.value })}
                          required
                          className="bg-gray-50 border-2 border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base text-gray-900 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                        <button
                          type="button"
                          onClick={() => setShowHackathonTaskForm(false)}
                          className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl transition shadow-md hover:shadow-lg font-medium text-sm sm:text-base"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white rounded-xl transition shadow-md hover:shadow-lg font-medium disabled:opacity-50 text-sm sm:text-base"
                        >
                          {loading ? 'Assigning...' : 'Assign Task'}
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="p-4 sm:p-6">
                    <button
                      onClick={() => setShowHackathonTaskForm(!showHackathonTaskForm)}
                      className="mb-4 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all flex items-center gap-2 shadow-lg hover:shadow-xl font-semibold text-sm sm:text-base"
                    >
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                      Add Task
                    </button>
                  </div>
                </div>

                {/* Tasks List */}
                {hackathonTasks.length > 0 && (
                  <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-yellow-50">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">Tasks ({hackathonTasks.length})</h3>
                    </div>
                    
                    <div className="divide-y divide-gray-100">
                      {hackathonTasks.map((task: any) => (
                        <div key={task._id} className="p-4 sm:p-6">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">{task.title}</h4>
                              <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                              task.priority === 'high' ? 'bg-red-100 text-red-700' :
                              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {task.priority}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm mb-3">
                            <div>
                              <span className="text-gray-600 font-medium">Due Date:</span>
                              <p className="text-gray-900">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</p>
                            </div>
                            <div>
                              <span className="text-gray-600 font-medium">Assigned To:</span>
                              <p className="text-gray-900">{task.assignedTo?.length || 0} players</p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleDeleteHackathonTask(task._id)}
                            className="text-red-600 hover:text-red-800 font-medium text-sm"
                          >
                            Delete Task
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="animate-fadeIn">
            <AggregateReport />
          </div>
        )}
        </main>
      </div>
    </div>
  );
}
