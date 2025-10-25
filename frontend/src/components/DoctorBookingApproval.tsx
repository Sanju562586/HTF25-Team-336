import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X, Clock, User, Calendar } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { appointmentsAPI } from "@/services/profileApi";
import { useProfile } from "@/hooks/useProfile";
import { Appointment } from "@/types/user";
import { ProfileCompletionBanner } from "@/components/ProfileCompletionBanner";

export const DoctorBookingApproval = () => {
  const { user } = useAuth();
  const { doctorProfile, showProfileWarning } = useProfile();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'requests' | 'all'>('requests');

  useEffect(() => {
    if (doctorProfile) {
      fetchAppointments();
    }
  }, [doctorProfile]);

  const fetchAppointments = async () => {
    if (!doctorProfile) return;

    setLoading(true);
    try {
      const doctorAppointments = await appointmentsAPI.getDoctorAppointments(doctorProfile.id);
      setAppointments(doctorAppointments);
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

  
  const handleStatusUpdate = async (appointmentId: string, status: 'APPROVED' | 'REJECTED') => {
    if (showProfileWarning && showProfileWarning()) {
      return;
    }

    setUpdatingStatus(appointmentId);
    try {
      await appointmentsAPI.updateAppointmentStatus(appointmentId, status);
      
      toast({
        title: `Appointment ${status.toLowerCase()}`,
        description: `The appointment has been ${status.toLowerCase()} successfully.`,
      });

      // Refresh appointments
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast({
        title: "Error",
        description: "Failed to update appointment status.",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'APPROVED':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingAppointments = appointments.filter(apt => apt.status === 'PENDING');
  
  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    if (dateA.getTime() !== dateB.getTime()) {
      return dateB.getTime() - dateA.getTime();
    }
    const timeA = a.timeFrom;
    const timeB = b.timeFrom;
    return timeB.localeCompare(timeA);
  });

  if (!doctorProfile) {
    return (
      <div className="animate-fade-in">
        <ProfileCompletionBanner />
        <Card>
          <CardHeader>
            <CardTitle>Booking Approval</CardTitle>
            <CardDescription>
              Please complete your profile first to manage appointments.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <ProfileCompletionBanner />
      
      <div className="space-y-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-card/50 backdrop-blur-sm rounded-xl p-1 border border-border/30">
          <button
            onClick={() => setActiveTab('requests')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'requests'
                ? 'bg-gradient-medical text-primary-foreground shadow-lg'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
            }`}
          >
            Appointment Requests
            {pendingAppointments.length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-yellow-100 text-yellow-800">
                {pendingAppointments.length}
              </Badge>
            )}
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'all'
                ? 'bg-gradient-medical text-primary-foreground shadow-lg'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
            }`}
          >
            All Appointments
            {appointments.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {appointments.length}
              </Badge>
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'requests' && (
          <Card className="shadow-card border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Pending Appointment Requests</CardTitle>
              <CardDescription>
                Approve or reject patient appointment requests
              </CardDescription>
            </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading appointments...</div>
            ) : pendingAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No pending appointment requests.</p>
                <p className="text-sm">New appointment requests will appear here for your approval.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Mobile Card View */}
                <div className="block md:hidden space-y-4">
                  {pendingAppointments.map((appointment) => (
                    <Card key={appointment.id} className="border-l-4 border-l-yellow-400">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <Avatar>
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {getInitials(appointment.patientName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">{appointment.patientName}</h4>
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
                            {appointment.notes && (
                              <p className="text-sm text-muted-foreground mt-2 p-2 bg-muted rounded">
                                {appointment.notes}
                              </p>
                            )}
                            <div className="flex space-x-2 mt-4">
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(appointment.id, 'APPROVED')}
                                disabled={updatingStatus === appointment.id}
                                className="flex-1"
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleStatusUpdate(appointment.id, 'REJECTED')}
                                disabled={updatingStatus === appointment.id}
                                className="flex-1"
                              >
                                <X className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/3 pl-20">Patient</TableHead>
                        <TableHead className="w-1/4">Date & Time</TableHead>
                        <TableHead className="w-1/6 pl-7">Status</TableHead>
                        <TableHead className="w-1/4 pl-20">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingAppointments.map((appointment) => (
                        <TableRow key={appointment.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                  {getInitials(appointment.patientName)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{appointment.patientName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {format(new Date(appointment.date), "MMM dd, yyyy")}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {appointment.timeFrom} - {appointment.timeTo}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(appointment.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(appointment.id, 'APPROVED')}
                                disabled={updatingStatus === appointment.id}
                              >
                                <Check className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleStatusUpdate(appointment.id, 'REJECTED')}
                                disabled={updatingStatus === appointment.id}
                              >
                                <X className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        )}

        {/* All Appointments Tab */}
        {activeTab === 'all' && (
          <Card className="shadow-card border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>All Appointments</CardTitle>
              <CardDescription>
                Complete history of all appointment requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading appointments...</div>
              ) : sortedAppointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No appointments found.</p>
                  <p className="text-sm">Your appointment history will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Mobile Card View */}
                  <div className="block md:hidden space-y-4 max-h-96 overflow-y-auto">
                    {sortedAppointments.map((appointment) => (
                      <Card key={appointment.id} className={`border-l-4 ${
                        appointment.status === 'APPROVED' ? 'border-l-green-400' :
                        appointment.status === 'REJECTED' ? 'border-l-red-400' :
                        'border-l-yellow-400'
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-4">
                            <Avatar>
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {getInitials(appointment.patientName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold truncate">{appointment.patientName}</h4>
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
                              <div className="mt-2">
                                {getStatusBadge(appointment.status)}
                              </div>
                              {appointment.notes && (
                                <p className="text-sm text-muted-foreground mt-2 p-2 bg-muted rounded">
                                  {appointment.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block max-h-96 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-1/3 pl-20">Patient</TableHead>
                          <TableHead className="w-1/3">Date & Time</TableHead>
                          <TableHead className="w-1/3 pl-7">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedAppointments.map((appointment) => (
                          <TableRow key={appointment.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                    {getInitials(appointment.patientName)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{appointment.patientName}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">
                                  {format(new Date(appointment.date), "MMM dd, yyyy")}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {appointment.timeFrom} - {appointment.timeTo}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(appointment.status)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};