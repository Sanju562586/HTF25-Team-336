import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { analyticsAPI } from '@/services/api';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminPatientVerification } from '@/components/AdminPatientVerification';
import { AdminDoctorVerification } from '@/components/AdminDoctorVerification';
import { EnhancedUserVerification } from '@/components/EnhancedUserVerification';
import { AdminPatientsTab } from '@/components/AdminPatientsTab';
import { AdminDoctorsTab } from '@/components/AdminDoctorsTab';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Users, UserCheck, Calendar, Heart, Settings, 
  Activity, Shield, BarChart3, 
  Stethoscope, User, LogOut, Plus
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  pendingVerifications: number;
}

interface ActivityItem {
  id: string;
  type: 'user' | 'appointment' | 'system';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [appointmentData, setAppointmentData] = useState([]);
  const [patientsPerDoctor, setPatientsPerDoctor] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/login');
      return;
    }

    loadDashboardData();
  }, [user, navigate]);

  const loadDashboardData = async () => {
    try {
      const [statsData, appointmentsData, doctorData, deptData] = await Promise.all([
        analyticsAPI.getUserStats(),
        analyticsAPI.getAppointmentData(),
        analyticsAPI.getPatientsPerDoctor(),
        analyticsAPI.getDepartmentDistribution()
      ]);

      setStats(statsData);
      setAppointmentData(appointmentsData);
      setPatientsPerDoctor(doctorData);
      setDepartmentData(deptData);

      loadActivities();
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActivities = async () => {
    // Mock activities data
    setActivities([
      {
        id: '1',
        type: 'user',
        title: 'New Doctor Registered',
        description: 'Dr. Michael Chen joined the Cardiology department',
        timestamp: '2024-03-15T10:30:00',
        read: false
      },
      {
        id: '2',
        type: 'appointment',
        title: 'Appointment Completed',
        description: 'Annual checkup for Robert Brown was completed',
        timestamp: '2024-03-15T09:15:00',
        read: true
      },
      {
        id: '3',
        type: 'system',
        title: 'System Update',
        description: 'New features added to patient portal',
        timestamp: '2024-03-14T16:45:00',
        read: true
      }
    ]);
  };

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: 'Active Doctors',
      value: stats?.totalDoctors || 0,
      icon: UserCheck,
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      title: 'Registered Patients',
      value: stats?.totalPatients || 0,
      icon: Heart,
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    },
    {
      title: 'Total Appointments',
      value: stats?.totalAppointments || 0,
      icon: Calendar,
      bgColor: 'bg-orange-100 dark:bg-orange-900/20'
    },
    {
      title: 'Pending Verifications',
      value: stats?.pendingVerifications || 0,
      icon: Shield,
      bgColor: 'bg-red-100 dark:bg-red-900/20'
    }
  ];

  // Custom colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // Sidebar Navigation Items
  const sidebarItems = [
    { 
      id: 'overview', 
      label: 'Overview', 
      icon: BarChart3,
      description: 'Dashboard analytics and statistics'
    },
    { 
      id: 'patients', 
      label: 'Patients', 
      icon: User,
      description: 'Manage patient accounts'
    },
    { 
      id: 'doctors', 
      label: 'Doctors', 
      icon: Stethoscope,
      description: 'Manage doctor accounts'
    },
    { 
      id: 'verification', 
      label: 'Verification', 
      icon: Shield,
      description: 'Approve pending accounts'
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {statCards.map((stat, index) => (
                <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <CardContent className="p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                        <p className="text-2xl font-bold mt-1">{stat.value.toLocaleString()}</p>
                      </div>
                      <div className={`p-3 rounded-full ${stat.bgColor}`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts and Activity Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Monthly Appointments Chart */}
              <div className="lg:col-span-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center text-lg">
                      <BarChart3 className="w-5 h-5 mr-2 text-primary" />
                      Monthly Appointments
                    </CardTitle>
                    <CardDescription>Appointment trends over the past 6 months</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={appointmentData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis 
                          dataKey="month" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="appointments" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={3}
                          dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              {/* <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-lg">
                    <div className="flex items-center">
                      <Activity className="w-5 h-5 mr-2 text-primary" />
                      Recent Activity
                    </div>
                    <Badge variant="outline">
                      {activities.filter(a => !a.read).length} New
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {activities.map((activity) => (
                      <div key={activity.id} className="p-4 hover:bg-muted/50 transition-colors duration-150">
                        <div className="flex items-start">
                          <div className="rounded-full p-2 mr-3 bg-muted">
                            {activity.type === 'user' ? <UserCheck className="w-4 h-4" /> :
                              activity.type === 'appointment' ? <Calendar className="w-4 h-4" /> :
                              <Settings className="w-4 h-4" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {activity.title}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {activity.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                          {!activity.read && (
                            <div className="w-2 h-2 bg-primary rounded-full ml-2"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t">
                    <EnhancedButton variant="outline" className="w-full">
                      View All Activity
                    </EnhancedButton>
                  </div>
                </CardContent>
              </Card> */}
            </div>

            {/* Department Distribution and Patients per Doctor */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Department Distribution */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <Users className="w-5 h-5 mr-2 text-primary" />
                    Department Distribution
                  </CardTitle>
                  <CardDescription>Patient distribution across departments</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={departmentData}
                        cx="53%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        innerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {departmentData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend 
                        layout="vertical" 
                        verticalAlign="middle" 
                        align="right"
                        wrapperStyle={{ fontSize: '12px', paddingLeft: '20px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Patients per Doctor */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center text-lg">
                    <UserCheck className="w-5 h-5 mr-2 text-primary" />
                    Patients per Doctor
                  </CardTitle>
                  <CardDescription>Top doctors by patient count</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={patientsPerDoctor}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip />
                      <Bar dataKey="patients" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'patients':
        return <AdminPatientsTab />;

      case 'doctors':
        return <AdminDoctorsTab />;

      case 'verification':
        return (
          <div className="space-y-6">
            <Tabs defaultValue="doctors" className="w-full">
              <TabsList>
                <TabsTrigger value="doctors">Doctor Verification</TabsTrigger>
                <TabsTrigger value="patients">Patient Verification</TabsTrigger>
              </TabsList>
              <TabsContent value="doctors">
                <EnhancedUserVerification userType="doctors" />
              </TabsContent>
              <TabsContent value="patients">
                <EnhancedUserVerification userType="patients" />
              </TabsContent>
            </Tabs>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Fixed Sidebar */}
        <aside className="w-64 bg-card border-r border-border fixed left-0 top-0 h-full z-40 overflow-y-auto">
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold">Admin Panel</h1>
                  <p className="text-xs text-muted-foreground">Hospital Management</p>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 p-4 space-y-2">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`
                    w-full flex items-start space-x-3 p-3 rounded-lg text-left transition-all duration-200
                    ${activeTab === item.id 
                      ? 'bg-primary/10 text-primary border border-primary/20' 
                      : 'text-muted-foreground hover:bg-muted/50'
                    }
                  `}
                >
                  <item.icon className={`w-5 h-5 mt-0.5 ${
                    activeTab === item.id ? 'text-primary' : 'text-muted-foreground'
                  }`} />
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {item.description}
                    </div>
                  </div>
                </button>
              ))}
            </nav>

            {/* User Profile Section */}
            <div className="p-4 border-t border-border">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">{user?.username}</p>
                  <p className="text-xs text-muted-foreground">Administrator</p>
                </div>
              </div>
              <EnhancedButton
                variant="outline"
                onClick={logout}
                className="w-full flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white border-red-500"
                size="sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </EnhancedButton>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 ml-64 bg-background overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">
                  {activeTab === 'overview' && 'Dashboard Overview'}
                  {activeTab === 'patients' && 'Patient Management'}
                  {activeTab === 'doctors' && 'Doctor Management'}
                  {activeTab === 'verification' && 'Account Verification'}
                </h1>
                <p className="text-muted-foreground mt-1">
                  {activeTab === 'overview' && 'Monitor your hospital\'s key metrics and performance'}
                  {activeTab === 'patients' && 'Manage patient accounts in your system'}
                  {activeTab === 'doctors' && 'Manage doctor accounts in your system'}
                  {activeTab === 'verification' && 'Review and approve pending account verifications'}
                </p>
              </div>
              
              {/* Add User Button - Added from old dashboard */}
              <EnhancedButton 
                variant="healthcare" 
                onClick={() => navigate('/register')}
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add User</span>
              </EnhancedButton>
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Loading dashboard data...</p>
                </div>
              </div>
            ) : (
              renderContent()
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;