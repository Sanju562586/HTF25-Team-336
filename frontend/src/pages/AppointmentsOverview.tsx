import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X, Clock, Calendar, User, Stethoscope, CalendarClock, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { format, differenceInHours } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { appointmentsAPI } from "@/services/profileApi";
import { useProfile } from "@/hooks/useProfile";
import { Appointment } from "@/types/user";
import { ProfileCompletionBanner } from "@/components/ProfileCompletionBanner";
import { RescheduleAppointmentModal } from "@/components/RescheduleAppointmentModal";
import { CancelAppointmentModal } from "@/components/CancelAppointmentModal";

export default function AppointmentsOverview() {
  const { user } = useAuth();
  const { patientProfile, doctorProfile } = useProfile();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchAppointments();
  }, [patientProfile, doctorProfile]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      let userAppointments: Appointment[] = [];
      
      if (user?.role === 'PATIENT' && patientProfile) {
        userAppointments = await appointmentsAPI.getPatientAppointments(patientProfile.id);
      } else if (user?.role === 'DOCTOR' && doctorProfile) {
        userAppointments = await appointmentsAPI.getDoctorAppointments(doctorProfile.id);
        // Filter only approved appointments for doctor's schedule
        userAppointments = userAppointments.filter(apt => apt.status === 'APPROVED');
      }
      
      setAppointments(userAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch appointments.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: "secondary" as const, icon: Clock, text: "Pending" },
      APPROVED: { variant: "default" as const, icon: Check, text: "Approved" },
      REJECTED: { variant: "destructive" as const, icon: X, text: "Rejected" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <div className="w-24 inline-flex items-center justify-center">
        <Badge variant={config.variant} className="w-full justify-center gap-1">
          <Icon className="w-3 h-3" />
          <span>{config.text}</span>
        </Badge>
      </div>
    );
  };

  const isUpcoming = (appointment: Appointment) => {
    const appointmentDate = new Date(`${appointment.date}T${appointment.timeFrom}`);
    return appointmentDate >= new Date();
  };

  // Check if appointment can be rescheduled (only once and 2 hours before)
  const canReschedule = (appointment: Appointment) => {
    if (user?.role !== 'PATIENT') return false;
    if (appointment.status !== 'APPROVED') return false;
    if (appointment.rescheduleCount && appointment.rescheduleCount >= 1) return false;
    
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.timeFrom}`);
    const now = new Date();
    const hoursUntilAppointment = differenceInHours(appointmentDateTime, now);
    
    return hoursUntilAppointment >= 2;
  };

  // Check if appointment can be cancelled (only pending appointments)
  const canCancel = (appointment: Appointment) => {
    if (user?.role !== 'PATIENT') return false;
    // Only allow cancellation of pending appointments
    return appointment.status === 'PENDING' && isUpcoming(appointment);
  };

  const handleReschedule = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setRescheduleModalOpen(true);
  };

  const handleCancel = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setCancelModalOpen(true);
  };

  const handleRescheduleSuccess = () => {
    fetchAppointments(); // Refresh the appointments list
    setRescheduleModalOpen(false);
    setSelectedAppointment(null);
    toast({
      title: "Success",
      description: "Appointment rescheduled successfully.",
    });
  };

  const handleCancelSuccess = () => {
    fetchAppointments(); // Refresh the appointments list
    setCancelModalOpen(false);
    setSelectedAppointment(null);
    toast({
      title: "Success",
      description: "Appointment cancelled successfully.",
    });
  };

  const filteredAppointments = appointments.filter(apt => 
    activeTab === 'upcoming' ? isUpcoming(apt) : !isUpcoming(apt)
  );

  // Get current appointments for pagination
  const indexOfLastAppointment = currentPage * itemsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - itemsPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirstAppointment, indexOfLastAppointment);
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);

  // Reset to first page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Reset to first page when appointments change
  useEffect(() => {
    setCurrentPage(1);
  }, [appointments]);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getPageTitle = () => {
    if (user?.role === 'DOCTOR') {
      return "My Schedule";
    }
    return "My Appointments";
  };

  const getPageDescription = () => {
    if (user?.role === 'DOCTOR') {
      return "View your confirmed appointment schedule.";
    }
    return "Track all your appointments and their status.";
  };

  if (!patientProfile && !doctorProfile) {
    return (
      <div className="container mx-auto py-8 max-w-6xl">
        <ProfileCompletionBanner />
        <Card>
          <CardHeader>
            <CardTitle>{getPageTitle()}</CardTitle>
            <CardDescription>
              Please complete your profile first to view appointments.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <ProfileCompletionBanner />
      
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">{getPageTitle()}</h1>
          <p className="text-muted-foreground">{getPageDescription()}</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
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

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {user?.role === 'DOCTOR' ? (
                <Stethoscope className="w-5 h-5" />
              ) : (
                <Calendar className="w-5 h-5" />
              )}
              <span>
                {activeTab === 'upcoming' ? 'Upcoming' : 'Past'} {user?.role === 'DOCTOR' ? 'Schedule' : 'Appointments'}
              </span>
            </CardTitle>
            <CardDescription>
              {activeTab === 'upcoming' 
                ? `Your upcoming ${user?.role === 'DOCTOR' ? 'appointments' : 'scheduled appointments'}`
                : `Your past ${user?.role === 'DOCTOR' ? 'appointments' : 'appointment history'}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading appointments...</div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No {activeTab} appointments found.</p>
                <p className="text-sm">
                  {user?.role === 'PATIENT' 
                    ? "Book your first appointment to get started."
                    : "Your confirmed appointments will appear here."
                  }
                </p>
              </div>
            ) : (
              <>
                {/* Card View for Mobile */}
                <div className="block md:hidden space-y-4">
                  {currentAppointments.map((appointment) => (
                    <Card key={appointment.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <Avatar>
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {user?.role === 'DOCTOR' 
                                ? getInitials(appointment.patientName)
                                : <img 
                                    src="/DefaultDoctor.png" 
                                    alt="Doctor" 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.onerror = null;
                                      target.style.display = 'none';
                                      const fallback = target.nextElementSibling as HTMLElement;
                                      if (fallback) fallback.style.display = 'flex';
                                    }}
                                  />
                              }
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">
                              {user?.role === 'DOCTOR' 
                                ? appointment.patientName
                                : `${appointment.doctorName}`
                              }
                            </h4>
                            {user?.role === 'PATIENT' && (
                              <p className="text-sm text-muted-foreground">{appointment.specialization}</p>
                            )}
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
                            {user?.role === 'PATIENT' && (
                              <div className="mt-3 space-y-2">
                                {getStatusBadge(appointment.status)}
                                <div className="flex gap-2 flex-wrap">
                                  {activeTab === 'upcoming' && canReschedule(appointment) && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleReschedule(appointment)}
                                      className="flex items-center gap-2 flex-1 min-w-[120px]"
                                    >
                                      <CalendarClock className="w-4 h-4" />
                                      Reschedule
                                    </Button>
                                  )}
                                  {activeTab === 'upcoming' && canCancel(appointment) && (
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleCancel(appointment)}
                                      className="flex items-center gap-2 flex-1 min-w-[120px]"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      Cancel
                                    </Button>
                                  )}
                                </div>
                                {activeTab === 'upcoming' && 
                                 !canReschedule(appointment) && 
                                 !canCancel(appointment) && (
                                  <div className="text-xs text-muted-foreground pt-1">
                                    {appointment.status === 'APPROVED' 
                                      ? "Approved appointments cannot be cancelled"
                                      : appointment.status === 'REJECTED'
                                      ? "Appointment rejected"
                                      : "No actions available"
                                    }
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Table View for Desktop */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-24">
                          {user?.role === 'DOCTOR' ? 'Patient' : 'Doctor'}
                        </TableHead>
                        {user?.role === 'PATIENT' && <TableHead>Specialization</TableHead>}
                        <TableHead className="pl-9">Date</TableHead>
                        <TableHead className="pl-14">Time</TableHead>
                        {user?.role === 'PATIENT' && <TableHead className="pl-10">Status</TableHead>}
                        {user?.role === 'PATIENT' && activeTab === 'upcoming' && <TableHead className="pl-14">Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentAppointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                  {user?.role === 'DOCTOR' 
                                    ? getInitials(appointment.patientName)
                                    : <img 
                                        src="/DefaultDoctor.png" 
                                        alt="Doctor" 
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          const target = e.target as HTMLImageElement;
                                          target.onerror = null;
                                          target.style.display = 'none';
                                          const fallback = target.nextElementSibling as HTMLElement;
                                          if (fallback) fallback.style.display = 'flex';
                                        }}
                                      />
                                  }
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">
                                {user?.role === 'DOCTOR' 
                                  ? appointment.patientName
                                  : `${appointment.doctorName}`
                                }
                              </span>
                            </div>
                          </TableCell>
                          {user?.role === 'PATIENT' && (
                            <TableCell>{appointment.specialization}</TableCell>
                          )}
                          <TableCell>
                            {format(new Date(appointment.date), "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell>
                            {appointment.timeFrom} - {appointment.timeTo}
                          </TableCell>
                          {user?.role === 'PATIENT' && (
                            <TableCell>
                              {getStatusBadge(appointment.status)}
                            </TableCell>
                          )}
                          {user?.role === 'PATIENT' && activeTab === 'upcoming' && (
                            <TableCell>
                              <div className="flex gap-2">
                                {canReschedule(appointment) && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleReschedule(appointment)}
                                    className="w-32 flex items-center justify-center gap-2"
                                  >
                                    <CalendarClock className="w-4 h-4 flex-shrink-0" />
                                    <span>Reschedule</span>
                                  </Button>
                                )}
                                {canCancel(appointment) && (
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => handleCancel(appointment)}
                                    className="w-32 flex items-center justify-center gap-2"
                                  >
                                    <Trash2 className="w-4 h-4 flex-shrink-0" />
                                    <span>Cancel</span>
                                  </Button>
                                )}
                                {!canReschedule(appointment) && !canCancel(appointment) && (
                                  <span className="text-xs text-muted-foreground flex items-center h-full">
                                    {appointment.status === 'APPROVED' 
                                      ? "Cannot be cancelled"
                                      : appointment.status === 'REJECTED'
                                      ? "Rejected"
                                      : "No actions"
                                    }
                                  </span>
                                )}
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="gap-1 pl-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        // Show first page, last page, current page, and pages around current
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        if (pageNum < 1 || pageNum > totalPages) return null;
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            className="w-10 h-10 p-0"
                            onClick={() => paginate(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="gap-1 pr-2"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Reschedule Modal */}
      <RescheduleAppointmentModal
        appointment={selectedAppointment}
        isOpen={rescheduleModalOpen}
        onClose={() => {
          setRescheduleModalOpen(false);
          setSelectedAppointment(null);
        }}
        onRescheduleSuccess={handleRescheduleSuccess}
      />

      {/* Cancel Modal */}
      <CancelAppointmentModal
        appointment={selectedAppointment}
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setSelectedAppointment(null);
        }}
        onCancelSuccess={handleCancelSuccess}
      />
    </div>
  );
}