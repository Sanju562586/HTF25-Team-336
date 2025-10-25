import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useAppointments } from '@/hooks/useAppointments';
import { useHealthRecord } from '@/hooks/useHealthRecord';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import BookAppointment from './BookAppointments';
import { PatientProfileDisplay } from '@/components/PatientProfileDisplay';
import AppointmentsOverview from './AppointmentsOverview'; // Import the appointments component
import { PatientReviewsTab } from '@/components/PatientReviewsTab';
import { PatientHealthRecord } from '@/components/PatientHealthRecord';
import { PatientEmergencyRequests } from '@/components/PatientEmergencyRequests';
import { DocumentPermissionRequests } from '@/components/DocumentPermissionRequests';
import MedVaultChatbot from '@/components/MedVaultChatbot';
import { 
  Calendar, FileText, Pill, Activity, 
  Heart, User, CalendarPlus, CheckCircle,
  Home, Stethoscope, LogOut, Clock, 
  XCircle, CheckCircle2, MapPin, Video, Star,
  AlertTriangle, Shield
} from 'lucide-react';
import { format } from 'date-fns';


const PatientDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { patientProfile, loading: profileLoading, refetchProfile } = useProfile();
  const { upcomingAppointments, nextAppointment, loading: appointmentsLoading } = useAppointments();
  const { 
    activeMedications, 
    totalDocuments, 
    healthScore, 
    healthStatus, 
    bmi, 
    bmiCategory, 
    loading: healthLoading 
  } = useHealthRecord();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  

  useEffect(() => {
    if (!user || user.role !== 'PATIENT') {
      navigate('/login');
    }
  }, [user, navigate]);

  
  const sidebarItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      description: 'Overview & health summary'
    },
    {
      id: 'profile',
      label: 'My Profile',
      icon: User,
      description: 'Personal information & settings'
    },
    {
      id: 'book-appointment',
      label: 'Book Appointment',
      icon: CalendarPlus,
      description: 'Schedule with doctors'
    },
    {
      id: 'appointments',
      label: 'My Appointments',
      icon: Calendar,
      description: 'View scheduled visits'
    },
    // {
    //   id: 'medical-records',
    //   label: 'Medical Records',
    //   icon: FileText,
    //   description: 'Health history & reports'
    // },
    // {
    //   id: 'prescriptions',
    //   label: 'Prescriptions',
    //   icon: Pill,
    //   description: 'Medications & dosages'
    // },
    {
      id: 'reviews',
      label: 'My Reviews',
      icon: Star,
      description: 'Rate & review doctors'
    },
    {
      id: 'health-record',
      label: 'Health Record',
      icon: FileText,
      description: 'Complete health information'
    },
    {
      id: 'emergency',
      label: 'Emergency Request',
      icon: AlertTriangle,
      description: 'Request immediate medical help'
    },
    {
      id: 'document-permissions',
      label: 'Document Permissions',
      icon: Shield,
      description: 'Manage doctor access to documents'
    }
  ];

  const handleNavigation = (sectionId: string) => {
    setActiveSection(sectionId);
    setIsEditingProfile(false);
  };

  const getCurrentDate = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };


  if (!user || user.role !== 'PATIENT') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/5">
      {/* Top Navigation Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-medical rounded-2xl flex items-center justify-center shadow-lg">
                <Stethoscope className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">HealthCare Portal</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {patientProfile ? patientProfile.firstName : 'Patient'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-foreground">{getCurrentTime()}</p>
                  {(appointmentsLoading || healthLoading) && (
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

      <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
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
                      Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}!
                    </h2>
                    <p className="text-lg text-muted-foreground mb-4">
                      Here's your health overview for today
                    </p>
                    {patientProfile?.isProfileComplete && (
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
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-800/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-700">
                    Next
                  </Badge>
                </div>
                <h3 className="font-semibold text-foreground mb-1">Upcoming</h3>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {appointmentsLoading ? '...' : upcomingAppointments.length}
                </p>
                <p className="text-sm text-muted-foreground">appointments</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 rounded-2xl p-6 border border-green-200/50 dark:border-green-800/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-700">
                    Good
                  </Badge>
                </div>
                <h3 className="font-semibold text-foreground mb-1">Health</h3>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {healthLoading ? '...' : `${healthScore}%`}
                </p>
                <p className="text-sm text-muted-foreground">profile completion</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-800/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Pill className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-700">
                    Active
                  </Badge>
                </div>
                <h3 className="font-semibold text-foreground mb-1">Prescriptions</h3>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {healthLoading ? '...' : activeMedications}
                </p>
                <p className="text-sm text-muted-foreground">active medications</p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 rounded-2xl p-6 border border-orange-200/50 dark:border-orange-800/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-700">
                    Records
                  </Badge>
                </div>
                <h3 className="font-semibold text-foreground mb-1">Medical</h3>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                  {healthLoading ? '...' : totalDocuments}
                </p>
                <p className="text-sm text-muted-foreground">documents</p>
              </div>
            </div>

            {/* Main Content Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Next Appointment Card */}
              <Card className="bg-gradient-to-br from-card via-card/95 to-accent/5 border-border/30 shadow-xl backdrop-blur-sm h-[400px] flex flex-col">
                <CardHeader className="flex-shrink-0">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <span>Next Appointment</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 flex-1 overflow-hidden flex flex-col">
                  <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
                    {appointmentsLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Clock className="w-10 h-10 text-primary/40 animate-spin" />
                          </div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">Loading...</h3>
                          <p className="text-muted-foreground">Fetching your appointments</p>
                        </div>
                      </div>
                    ) : nextAppointment ? (
                      <div className="space-y-4 p-2">
                        <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl border border-primary/10">
                          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <User className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground text-lg mb-1">
                              {nextAppointment.doctorName}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-3">
                              {nextAppointment.specialization}
                            </p>
                            <div className="space-y-2">
                              <div className="flex items-center text-sm">
                                <Calendar className="w-4 h-4 mr-2 text-primary" />
                                <span className="font-medium">
                                  {format(new Date(nextAppointment.date), "EEEE, MMM dd, yyyy")}
                                </span>
                              </div>
                              <div className="flex items-center text-sm">
                                <Clock className="w-4 h-4 mr-2 text-primary" />
                                <span className="font-medium">
                                  {nextAppointment.timeFrom} - {nextAppointment.timeTo}
                                </span>
                              </div>
                            </div>
                            <div className="mt-3">
                              {nextAppointment.status === 'APPROVED' && (
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Confirmed
                                </Badge>
                              )}
                              {nextAppointment.status === 'PENDING' && (
                                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Pending
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Calendar className="w-10 h-10 text-primary/40" />
                          </div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">No appointments scheduled</h3>
                          <p className="text-muted-foreground mb-6">Ready to book your next visit with a doctor?</p>
                          <EnhancedButton
                            variant="ghost"
                            className="h-24 flex-col space-y-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border border-blue-200/50 dark:border-blue-800/50 hover:scale-105 transition-transform"
                            onClick={() => setActiveSection('book-appointment')}
                          >
                            <CalendarPlus className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium">Book Appointment</span>
                          </EnhancedButton>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Fixed Bottom Buttons */}
                  {!appointmentsLoading && nextAppointment && (
                    <div className="flex-shrink-0 pt-4 border-t border-border/20 mt-4">
                      <div className="flex gap-2">
                        <EnhancedButton
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveSection('appointments')}
                          className="flex-1"
                        >
                          View All Appointments
                        </EnhancedButton>
                        <EnhancedButton
                          variant="default"
                          size="sm"
                          onClick={() => setActiveSection('book-appointment')}
                          className="flex-1"
                        >
                          Book Another
                        </EnhancedButton>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Health Status Card */}
              <Card className="bg-gradient-to-br from-card via-card/95 to-success/5 border-border/30 shadow-xl backdrop-blur-sm h-[400px] flex flex-col">
                <CardHeader className="flex-shrink-0">
                  <CardTitle className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">
                      <Activity className="w-5 h-5 text-success" />
                    </div>
                    <span>Health Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 flex-1 overflow-hidden">
                  <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
                    {healthLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Clock className="w-10 h-10 text-success/40 animate-spin" />
                          </div>
                          <h3 className="text-lg font-semibold text-foreground mb-2">Loading...</h3>
                          <p className="text-muted-foreground">Fetching your health data</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 p-2">
                        <div className="text-center py-4">
                          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Heart className="w-8 h-8 text-success" />
                          </div>
                          <Badge 
                            className={`mb-3 px-3 py-1 text-sm ${
                              healthStatus.color === 'success' ? 'bg-success/10 text-success border-success/20' :
                              healthStatus.color === 'warning' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                              healthStatus.color === 'destructive' ? 'bg-red-100 text-red-800 border-red-200' :
                              'bg-primary/10 text-primary border-primary/20'
                            }`}
                          >
                            {healthStatus.status}
                          </Badge>
                          <p className="text-sm text-muted-foreground mb-4">
                            Health profile {healthScore}% complete
                          </p>
                        </div>
                        
                        {/* Health Metrics */}
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/20">
                          <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                            <div className="flex items-center justify-center mb-2">
                              <Pill className="w-4 h-4 text-purple-600 mr-2" />
                              <span className="text-sm font-medium">Medications</span>
                            </div>
                            <p className="text-lg font-bold text-purple-600">{activeMedications}</p>
                            <p className="text-xs text-muted-foreground">active</p>
                          </div>
                          
                          <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                            <div className="flex items-center justify-center mb-2">
                              <FileText className="w-4 h-4 text-orange-600 mr-2" />
                              <span className="text-sm font-medium">Documents</span>
                            </div>
                            <p className="text-lg font-bold text-orange-600">{totalDocuments}</p>
                            <p className="text-xs text-muted-foreground">uploaded</p>
                          </div>
                          
                          {bmi && (
                            <>
                              <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                                <div className="flex items-center justify-center mb-2">
                                  <Activity className="w-4 h-4 text-blue-600 mr-2" />
                                  <span className="text-sm font-medium">BMI</span>
                                </div>
                                <p className="text-lg font-bold text-blue-600">{bmi}</p>
                                <p className="text-xs text-muted-foreground">{bmiCategory}</p>
                              </div>
                              
                              <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                                <div className="flex items-center justify-center mb-2">
                                  <Heart className="w-4 h-4 text-green-600 mr-2" />
                                  <span className="text-sm font-medium">Status</span>
                                </div>
                                <p className="text-lg font-bold text-green-600">{healthScore}%</p>
                                <p className="text-xs text-muted-foreground">complete</p>
                              </div>
                            </>
                          )}
                        </div>
                        
                        <div className="pt-4">
                          <EnhancedButton
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveSection('health-record')}
                            className="w-full"
                          >
                            View Full Health Record
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
                    onClick={() => setActiveSection('book-appointment')}
                  >
                    <CalendarPlus className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium">Book Appointment</span>
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
                    onClick={() => setActiveSection('health-record')}
                  >
                    <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-medium">Medical Records</span>
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
              <p className="text-muted-foreground">Manage your personal information and settings</p>
            </div>
            <PatientProfileDisplay 
              profile={patientProfile}
              loading={profileLoading}
              onProfileUpdate={refetchProfile}
              isEditing={isEditingProfile}
              onEditToggle={setIsEditingProfile}
            />
          </div>
        )}

        {activeSection === 'book-appointment' && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-2">Book Appointment</h1>
              <p className="text-muted-foreground">Schedule a new appointment with your doctor</p>
            </div>
            <Card className="shadow-card border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <BookAppointment/>
              </CardContent>
            </Card>
          </div>
        )}


        {activeSection === 'appointments' && (
          <div className="animate-fade-in">
            {/* Replace the entire appointments section with the AppointmentsOverview component */}
            <AppointmentsOverview />
          </div>
        )}

        {activeSection === 'medical-records' && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-2">Medical Records</h1>
              <p className="text-muted-foreground">Access your health history and reports</p>
            </div>
            <Card className="shadow-card border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Records Available</h3>
                <p className="text-muted-foreground">
                  Your medical records will appear here after your first appointment
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === 'prescriptions' && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-2">Prescriptions</h1>
              <p className="text-muted-foreground">View and manage your medications</p>
            </div>
            <Card className="shadow-card border-border/50 bg-card/80 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <Pill className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Active Prescriptions</h3>
                <p className="text-muted-foreground">
                  Prescribed medications will be displayed here
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {activeSection === 'reviews' && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-2">My Reviews</h1>
              <p className="text-muted-foreground">Rate and review your doctor appointments</p>
            </div>
            <PatientReviewsTab />
          </div>
        )}

        {activeSection === 'health-record' && (
          <div className="animate-fade-in">
            <PatientHealthRecord />
          </div>
        )}
        
        {activeSection === 'emergency' && (
          <div className="animate-fade-in">
            <PatientEmergencyRequests />
          </div>
        )}

        {activeSection === 'document-permissions' && (
          <div className="animate-fade-in">
            <DocumentPermissionRequests />
          </div>
        )}
      </div>

      {/* MedVault Chatbot */}
      <MedVaultChatbot />
    </div>
  );
};

export default PatientDashboard;