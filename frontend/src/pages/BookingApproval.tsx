import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X, Clock, User, Calendar, ArrowLeft } from "lucide-react"; // Added ArrowLeft import
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { appointmentsAPI } from "@/services/profileApi";
import { useProfile } from "@/hooks/useProfile";
import { Appointment } from "@/types/user";
import { ProfileCompletionBanner } from "@/components/ProfileCompletionBanner";
import { useNavigate } from "react-router-dom"; // Added useNavigate import

export default function BookingApproval() {
  const { user } = useAuth();
  const { doctorProfile, showProfileWarning } = useProfile();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const navigate = useNavigate(); // Added navigate hook

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
    if (showProfileWarning()) {
      return;
    }

    setUpdatingStatus(appointmentId);
    try {
      await appointmentsAPI.updateAppointmentStatus(appointmentId, status);
      
      toast({
        title: `Appointment ${status.toLowerCase()}`,
        description: `The appointment has been ${status.toLowerCase()} successfully.`,
      });

      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast({
        title: "Error",
        description: "Failed to update appointment status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getPatientInitials = (patientName: string) => {
    return patientName.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: "secondary" as const, icon: Clock },
      APPROVED: { variant: "default" as const, icon: Check },
      REJECTED: { variant: "destructive" as const, icon: X },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </Badge>
    );
  };

  if (!doctorProfile) {
    return (
      <div className="container mx-auto py-8 max-w-6xl">
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
    <div className="container mx-auto py-8 max-w-6xl">
      <ProfileCompletionBanner />
      
      <div className="space-y-8">
        <div className="flex items-center"> {/* Added flex container for back button and title */}
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold mb-2">Booking Approval</h1>
            <p className="text-muted-foreground">Review and manage appointment requests from patients.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Appointment Requests</CardTitle>
            <CardDescription>
              Approve or reject patient appointment requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Loading appointments...</div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No appointment requests found.</p>
                <p className="text-sm">Patient appointment requests will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Pending Appointments */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Pending Requests</h3>
                  <div className="space-y-3">
                    {appointments
                      .filter(apt => apt.status === 'PENDING')
                      .map((appointment) => (
                        <Card key={appointment.id} className="border-orange-200">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-start space-x-4">
                                <Avatar>
                                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                                    {getPatientInitials(appointment.patientName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <h4 className="font-semibold">{appointment.patientName}</h4>
                                  <div className="space-y-1 mt-1">
                                    <div className="flex items-center text-sm text-muted-foreground">
                                      <Calendar className="w-4 h-4 mr-2" />
                                      {format(new Date(appointment.date), "PPP")}
                                    </div>
                                    <div className="flex items-center text-sm text-muted-foreground">
                                      <Clock className="w-4 h-4 mr-2" />
                                      {appointment.timeFrom} - {appointment.timeTo}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getStatusBadge(appointment.status)}
                                <div className="flex space-x-2 ml-4">
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => handleStatusUpdate(appointment.id, 'APPROVED')}
                                    disabled={updatingStatus === appointment.id}
                                    className="bg-success hover:bg-success/90"
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
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    }
                  </div>
                  {appointments.filter(apt => apt.status === 'PENDING').length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No pending appointment requests.</p>
                    </div>
                  )}
                </div>

                {/* All Appointments Table */}
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-3">All Appointments</h3>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Patient</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Time</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {appointments.map((appointment) => (
                          <TableRow key={appointment.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                                    {getPatientInitials(appointment.patientName)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{appointment.patientName}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {format(new Date(appointment.date), "MMM dd, yyyy")}
                            </TableCell>
                            <TableCell>
                              {appointment.timeFrom} - {appointment.timeTo}
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}