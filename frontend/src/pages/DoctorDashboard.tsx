import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useDoctorDashboard } from '@/hooks/useDoctorDashboard';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DoctorProfileDisplay } from '@/components/DoctorProfileDisplay';
import { DoctorReviewsTab } from '@/components/DoctorReviewsTab';
import { DoctorEmergencyDashboard } from '@/components/DoctorEmergencyDashboard';
import { 
  Calendar, Clock, Users, FileText, Heart, 
  CalendarDays, UserCheck, Activity, Stethoscope,
  CheckCircle, AlertCircle, Plus, Search, User,
  Home, BookOpen, ClipboardList, Menu, LogOut,
  CalendarPlus, Pill, Check, X, Star, AlertTriangle,
  MessageSquare
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { appointmentsAPI } from '@/services/profileApi';
import { Appointment } from '@/types/user';
import { format } from 'date-fns';
import { PatientMedicalRecordView } from '@/components/PatientMedicalRecordView';
import { DoctorSlotCreation } from '@/components/DoctorSlotCreation';
import { DoctorBookingApproval } from '@/components/DoctorBookingApproval';
import MedVaultChatbot from '@/components/MedVaultChatbot';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { doctorProfile, loading: profileLoading, refetchProfile } = useProfile();
  const { 
    nextAppointments, 
    stats, 
    practiceStatus, 
    loading: dashboardLoading,
    appointments,
    refetch: refetchDashboard 
  } = useDoctorDashboard();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [viewingMedicalRecord, setViewingMedicalRecord] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'DOCTOR') {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (activeSection === 'appointments' && doctorProfile) {
      fetchAppointments();
    }
  }, [activeSection, doctorProfile]);

  const fetchAppointments = async () => {
    // This is now handled by the useDoctorDashboard hook
    // Keep this function for the appointments section if needed
    if (appointments.length === 0) {
      refetchDashboard();
    }
  };

  const sidebarItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      description: 'Overview & practice summary'
    },
    {
      id: 'profile',
      label: 'My Profile',
      icon: User,
      description: 'Professional information & settings'
    },
    {
      id: 'create-slots',
      label: 'Create Slots',
      icon: CalendarPlus,
      description: 'Schedule availability'
    },
    {
      id: 'appointments',
      label: 'My Appointments',
      icon: Calendar,
      description: 'View scheduled visits'
    },
    {
      id: 'booking-approval',
      label: 'Booking Requests',
      icon: UserCheck,
      description: 'Manage appointment requests'
    },
    // {
    //   id: 'patients',
    //   label: 'Patients',
    //   icon: Users,
    //   description: 'Patient list & records'
    // },
    // {
    //   id: 'medical-records',
    //   label: 'Medical Records',
    //   icon: FileText,
    //   description: 'Patient health records'
    // },
    {
      id: 'reviews',
      label: 'Reviews & Ratings',
      icon: Star,
      description: 'Patient feedback & ratings'
    },
    {
      id: 'emergency',
      label: 'Emergency Requests',
      icon: AlertTriangle,
      description: 'Handle urgent patient requests'
    }
  ];

  const handleNavigation = (sectionId: string) => {
    // Handle external navigation
    if (sectionId === 'appointments-overview') {
      navigate('/appointments-overview');
      return;
    }
    
    // Handle internal sections
    setActiveSection(sectionId);
  };

  const getCurrentDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };
    return now.toLocaleDateString('en-US', options);
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const isUpcoming = (appointment: Appointment) => {
    const appointmentDate = new Date(`${appointment.date}T${appointment.timeFrom}`);
    return appointmentDate >= new Date();
  };

  const filteredAppointments = appointments.filter(apt => 
    activeTab === 'upcoming' ? isUpcoming(apt) : !isUpcoming(apt)
  );

  // Dashboard stats configuration
  const dashboardStats = [
    {
      title: 'Today\'s Appointments',
      value: dashboardLoading ? '...' : stats.todaysAppointmentsCount,
      icon: Calendar,
      color: 'text-primary',
      change: 'scheduled for today'
    },
    {
      title: 'Active Patients',
      value: dashboardLoading ? '...' : stats.activePatients,
      icon: Users,
      color: 'text-secondary',
      change: 'unique patients'
    },
    {
      title: 'Total Reviews',
      value: dashboardLoading ? '...' : stats.totalReviews,
      icon: Star,
      color: 'text-success',
      change: `${stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'} avg rating`
    },
    {
      title: 'Completed Visits',
      value: dashboardLoading ? '...' : stats.completedVisits,
      icon: CheckCircle,
      color: 'text-primary',
      change: 'total appointments'
    }
  ];

  if (!user || user.role !== 'DOCTOR') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/5">
      {/* Fixed Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-medical rounded-2xl flex items-center justify-center shadow-lg">
                <Stethoscope className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">HealthCare Portal</h1>
                <p className="text-sm text-muted-foreground">Welcome back, Dr. {doctorProfile ? doctorProfile.firstName : user.username}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-foreground">{getCurrentTime()}</p>
                  {dashboardLoading && (
                    <div className="w-3 h-3 bg-primary/20 rounded-full animate-pulse" title="Refreshing data..." />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{getCurrentDate()}</p>
              </div>
              <EnhancedButton 
                variant="ghost" 
                size="sm"
                onClick={logout}
                className="bg-destructive/10 hover:bg-destructive/20 text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </EnhancedButton>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Top Padding */}
      <div className="pt-24 max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 p-2 bg-card/50 backdrop-blur-sm rounded-2xl border border-border/30">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-200 ${
                  activeSection === item.id
                    ? 'bg-gradient-medical text-primary-foreground shadow-lg scale-105'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground hover:scale-102'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-medium text-sm">{item.label}</p>
                  <p className="text-xs opacity-70">{item.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {activeSection === 'dashboard' && (
          <div className="space-y-8 animate-fade-in">
            {/* Welcome Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20 rounded-3xl p-8 border border-primary/20">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -translate-y-20 translate-x-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/10 rounded-full translate-y-16 -translate-x-16"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-3">
                      Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, Doctor!
                    </h2>
                    <p className="text-lg text-muted-foreground mb-4">
                      Here's your practice overview for today
                    </p>
                    {doctorProfile?.isProfileComplete && (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-success" />
                        <span className="text-success font-medium">Profile Complete</span>
                      </div>
                    )}
                  </div>
                  <div className="hidden md:block">
                    <div className="w-24 h-24 bg-gradient-medical rounded-full flex items-center justify-center shadow-xl">
                      <User className="w-12 h-12 text-primary-foreground" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {dashboardStats.map((stat, index) => (
                <div key={index} className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-800/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <stat.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-700">
                      Live
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{stat.title}</h3>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.change}</p>
                </div>
              ))}
            </div>

            {/* Main Content Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upcoming Appointments Card */}
              <Card className="bg-gradient-to-br from-card via-card/95 to-accent/5 border-border/30 shadow-xl backdrop-blur-sm h-[400px] flex flex-col">
                <CardHeader className="flex-shrink-0">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <span>Upcoming Appointments</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 flex-1 overflow-hidden flex flex-col">
                  <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
                    {dashboardLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Clock className="w-10 h-10 text-primary/40 animate-spin" />
                          </div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">Loading...</h3>
                          <p className="text-muted-foreground">Fetching your appointments</p>
                        </div>
                      </div>
                    ) : nextAppointments.length > 0 ? (
                      <div className="space-y-4 p-2">
                        {nextAppointments.map((appointment) => (
                          <div key={appointment.id} className="flex items-center space-x-4 p-3 rounded-lg bg-accent/30 border border-border/30">
                            <Avatar className="h-12 w-12 bg-gradient-to-br from-primary to-primary-dark shadow-lg border-2 border-primary/20">
                              <AvatarFallback className="text-primary-foreground font-bold text-sm bg-gradient-to-br from-primary to-primary-dark">
                                {getInitials(appointment.patientName)}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-foreground truncate">{appointment.patientName}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(appointment.date), "MMM dd, yyyy")}
                              </p>
                            </div>
                            
                            <div className="text-right">
                              <p className="text-sm font-medium text-foreground">{appointment.timeFrom}</p>
                              <p className="text-xs text-muted-foreground">{appointment.timeTo}</p>
                            </div>
                            
                            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Confirmed
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Calendar className="w-10 h-10 text-primary/40" />
                          </div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">No upcoming appointments</h3>
                          <p className="text-muted-foreground mb-6">Your confirmed appointments will appear here</p>
                          <EnhancedButton
                            variant="ghost"
                            className="h-16 flex-col space-y-2 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border border-blue-200/50 dark:border-blue-800/50"
                            onClick={() => navigate('/slot-creation')}
                          >
                            <CalendarPlus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium">Create Time Slots</span>
                          </EnhancedButton>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Fixed Bottom Button */}
                  {!dashboardLoading && nextAppointments.length > 0 && (
                    <div className="flex-shrink-0 pt-4 border-t border-border/20 mt-4">
                      <EnhancedButton 
                        variant="outline" 
                        size="sm"
                        className="w-full"
                        onClick={() => setActiveSection('appointments')}
                      >
                        View All Appointments
                      </EnhancedButton>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Practice Status Card */}
              <Card className="bg-gradient-to-br from-card via-card/95 to-success/5 border-border/30 shadow-xl backdrop-blur-sm h-[400px] flex flex-col">
                <CardHeader className="flex-shrink-0">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">
                      <Activity className="w-5 h-5 text-success" />
                    </div>
                    <span>Practice Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 flex-1 overflow-hidden">
                  <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
                    {dashboardLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Clock className="w-10 h-10 text-success/40 animate-spin" />
                          </div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">Loading...</h3>
                          <p className="text-muted-foreground">Fetching practice data</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 p-2">
                        <div className="text-center py-4">
                          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Stethoscope className="w-8 h-8 text-success" />
                          </div>
                          <Badge 
                            className={`mb-3 px-3 py-1 text-sm ${
                              practiceStatus.color === 'success' ? 'bg-success/10 text-success border-success/20' :
                              practiceStatus.color === 'primary' ? 'bg-primary/10 text-primary border-primary/20' :
                              practiceStatus.color === 'warning' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                              practiceStatus.color === 'secondary' ? 'bg-secondary/10 text-secondary border-secondary/20' :
                              'bg-muted text-muted-foreground border-muted'
                            }`}
                          >
                            {practiceStatus.status}
                          </Badge>
                          <p className="text-sm text-muted-foreground mb-4">
                            {practiceStatus.description}
                          </p>
                        </div>
                        
                        {/* Practice Metrics */}
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/20">
                          <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                            <div className="flex items-center justify-center mb-2">
                              <Star className="w-4 h-4 text-yellow-500 mr-2" />
                              <span className="text-sm font-medium">Rating</span>
                            </div>
                            <p className="text-lg font-bold text-yellow-600">{stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'}</p>
                            <p className="text-xs text-muted-foreground">average</p>
                          </div>
                          
                          <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                            <div className="flex items-center justify-center mb-2">
                              <MessageSquare className="w-4 h-4 text-green-600 mr-2" />
                              <span className="text-sm font-medium">Reviews</span>
                            </div>
                            <p className="text-lg font-bold text-green-600">{stats.totalReviews}</p>
                            <p className="text-xs text-muted-foreground">total</p>
                          </div>
                          
                          <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                            <div className="flex items-center justify-center mb-2">
                              <Users className="w-4 h-4 text-purple-600 mr-2" />
                              <span className="text-sm font-medium">Patients</span>
                            </div>
                            <p className="text-lg font-bold text-purple-600">{stats.activePatients}</p>
                            <p className="text-xs text-muted-foreground">active</p>
                          </div>
                          
                          <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                            <div className="flex items-center justify-center mb-2">
                              <CheckCircle className="w-4 h-4 text-orange-600 mr-2" />
                              <span className="text-sm font-medium">Visits</span>
                            </div>
                            <p className="text-lg font-bold text-orange-600">{stats.completedVisits}</p>
                            <p className="text-xs text-muted-foreground">completed</p>
                          </div>
                        </div>
                        
                        <div className="pt-4">
                          <EnhancedButton
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveSection('reviews')}
                            className="w-full"
                          >
                            View Reviews & Ratings
                          </EnhancedButton>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions Grid */}
            <Card className="bg-gradient-to-r from-card/80 via-card to-card/80 border-border/30 shadow-xl backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl">Quick Actions</CardTitle>
                <p className="text-muted-foreground">Access your most used features</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <EnhancedButton
                    variant="ghost"
                    className="h-24 flex-col space-y-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border border-blue-200/50 dark:border-blue-800/50 hover:scale-105 transition-transform"
                    onClick={() => setActiveSection('create-slots')}
                  >
                    <CalendarPlus className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium">Create Slots</span>
                  </EnhancedButton>
                  
                  <EnhancedButton
                    variant="ghost"
                    className="h-24 flex-col space-y-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border border-green-200/50 dark:border-green-800/50 hover:scale-105 transition-transform"
                    onClick={() => setActiveSection('appointments')}
                  >
                    <Calendar className="w-8 h-8 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium">My Appointments</span>
                  </EnhancedButton>
                  
                  <EnhancedButton
                    variant="ghost"
                    className="h-24 flex-col space-y-3 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border border-purple-200/50 dark:border-purple-800/50 hover:scale-105 transition-transform"
                    onClick={() => setActiveSection('booking-approval')}
                  >
                    <UserCheck className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-medium">Booking Requests</span>
                  </EnhancedButton>
                  
                  <EnhancedButton
                    variant="ghost"
                    className="h-24 flex-col space-y-3 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border border-orange-200/50 dark:border-orange-800/50 hover:scale-105 transition-transform"
                    onClick={() => {
                      setActiveSection('profile');
                      setIsEditingProfile(false);
                    }}
                  >
                    <User className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                    <span className="text-sm font-medium">Update Profile</span>
                  </EnhancedButton>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === 'profile' && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-2">My Profile</h1>
              <p className="text-muted-foreground">Manage your professional information and settings</p>
            </div>
            <DoctorProfileDisplay 
              profile={doctorProfile}
              loading={profileLoading}
              onProfileUpdate={refetchProfile}
              isEditing={isEditingProfile}
              onEditToggle={setIsEditingProfile}
            />
          </div>
        )}

        {activeSection === 'appointments' && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-2">My Schedule</h1>
              <p className="text-muted-foreground">View your confirmed appointment schedule</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit mb-6">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'upcoming'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'past'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Past
              </button>
            </div>

            <Card className="shadow-card border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Stethoscope className="w-5 h-5" />
                  <span>
                    {activeTab === 'upcoming' ? 'Upcoming' : 'Past'} Schedule
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAppointments ? (
                  <div className="text-center py-4">Loading appointments...</div>
                ) : filteredAppointments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No {activeTab} appointments found.</p>
                    <p className="text-sm">
                      Your confirmed appointments will appear here.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Card View for Mobile */}
                    <div className="block md:hidden space-y-4">
                      {filteredAppointments.map((appointment) => (
                         <Card key={appointment.id}>
                           <CardContent className="p-4">
                             <div className="flex items-start space-x-4">
                               <Avatar>
                                 <AvatarFallback className="bg-primary text-primary-foreground">
                                   {getInitials(appointment.patientName)}
                                 </AvatarFallback>
                               </Avatar>
                               <div className="flex-1 min-w-0">
                                 <h4 className="font-semibold truncate">
                                   {appointment.patientName}
                                 </h4>
                                 <div className="space-y-1 mt-2">
                                   <div className="flex items-center text-sm text-muted-foreground">
                                     <Calendar className="w-4 h-4 mr-2" />
                                     {format(new Date(appointment.date), "MMM dd, yyyy")}
                                   </div>
                                   <div className="flex items-center text-sm text-muted-foreground">
                                     <Clock className="w-4 h-4 mr-2" />
                                     {appointment.timeFrom} - {appointment.timeTo}
                                   </div>
                                 </div>
                                 <div className="mt-3">
                                   <EnhancedButton
                                     variant="outline"
                                     size="sm"
                                     onClick={() => setViewingMedicalRecord(appointment.id)}
                                     className="w-full"
                                   >
                                     <FileText className="w-4 h-4 mr-1" />
                                     View Medical Record
                                   </EnhancedButton>
                                 </div>
                               </div>
                             </div>
                           </CardContent>
                         </Card>
                      ))}
                    </div>

                    {/* Table View for Desktop */}
                    <div className="hidden md:block">
                      <table className="w-full">
                         <thead>
                           <tr className="border-b">
                             <th className="text-left py-3 font-medium pl-16">Patient</th>
                             <th className="text-left py-3 font-medium pl-6">Date</th>
                             <th className="text-left py-3 font-medium pl-12">Time</th>
                             <th className="text-left py-3 font-medium pl-10">Actions</th>
                           </tr>
                         </thead>
                        <tbody>
                          {filteredAppointments.map((appointment) => (
                           <tr key={appointment.id} className="border-b">
                             <td className="py-4">
                               <div className="flex items-center space-x-3">
                                 <Avatar className="w-8 h-8">
                                   <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                     {getInitials(appointment.patientName)}
                                   </AvatarFallback>
                                 </Avatar>
                                 <span className="font-medium">
                                   {appointment.patientName}
                                 </span>
                               </div>
                             </td>
                             <td className="py-4">
                               {format(new Date(appointment.date), "MMM dd, yyyy")}
                             </td>
                             <td className="py-4">
                               {appointment.timeFrom} - {appointment.timeTo}
                             </td>
                             <td className="py-4">
                               <EnhancedButton
                                 variant="outline"
                                 size="sm"
                                 onClick={() => setViewingMedicalRecord(appointment.id)}
                                 className="mr-2"
                               >
                                 <FileText className="w-4 h-4 mr-1" />
                                 Medical Record
                               </EnhancedButton>
                             </td>
                           </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === 'patients' && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-2">Patients</h1>
              <p className="text-muted-foreground">View and manage your patient list</p>
            </div>
            <Card className="shadow-card border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Patient Management</h3>
                <p className="text-muted-foreground">
                  Access to patient records and management features
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === 'medical-records' && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-2">Medical Records</h1>
              <p className="text-muted-foreground">Access patient health records and reports</p>
            </div>
            <Card className="shadow-card border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Medical Records</h3>
                <p className="text-muted-foreground">
                  Access to patient medical records and documentation
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === 'reviews' && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-2">Reviews & Ratings</h1>
              <p className="text-muted-foreground">View patient feedback and ratings for your practice</p>
            </div>
            <DoctorReviewsTab />
          </div>
        )}

        {activeSection === 'emergency' && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-2">Emergency Requests</h1>
              <p className="text-muted-foreground">Handle urgent patient requests and manage your emergency availability</p>
            </div>
            <DoctorEmergencyDashboard />
          </div>
        )}

        {activeSection === 'create-slots' && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-2">Create Time Slots</h1>
              <p className="text-muted-foreground">Set your availability and manage your appointment schedule</p>
            </div>
            <DoctorSlotCreation />
          </div>
        )}

        {activeSection === 'booking-approval' && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-2">Booking Requests</h1>
              <p className="text-muted-foreground">Review and manage appointment requests from patients</p>
            </div>
            <DoctorBookingApproval />
          </div>
        )}
      </div>
      
      {/* Medical Record Modal */}
      {viewingMedicalRecord && (
        <PatientMedicalRecordView
          appointmentId={viewingMedicalRecord}
          onClose={() => setViewingMedicalRecord(null)}
        />
      )}
      {/* MedVault Chatbot */}
      <MedVaultChatbot />
    </div>
  );
};

export default DoctorDashboard;