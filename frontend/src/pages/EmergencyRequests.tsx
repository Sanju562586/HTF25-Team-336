import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmergencyRequestModal } from '@/components/EmergencyRequestModal';
import { emergencyAPI } from '@/services/emergencyApi';
import { EmergencyRequest } from '@/types/emergency';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  AlertTriangle,
  MapPin,
  Clock,
  User,
  Phone,
  Activity,
  CheckCircle,
  XCircle,
  Timer,
  Loader2,
  Plus
} from 'lucide-react';

const EmergencyRequestsPage = () => {
  const { user } = useAuth();
  const { patientProfile, doctorProfile } = useProfile();
  const { toast } = useToast();
  const [emergencyRequests, setEmergencyRequests] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    if (user) {
      fetchEmergencyRequests();
    }
  }, [user]);

  const fetchEmergencyRequests = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let requests: EmergencyRequest[] = [];
      
      if (user.role === 'PATIENT' && patientProfile) {
        requests = await emergencyAPI.getPatientEmergencyRequests(patientProfile.id.toString());
      } else if (user.role === 'DOCTOR' && doctorProfile) {
        requests = await emergencyAPI.getDoctorEmergencyRequests(doctorProfile.id.toString());
      }
      
      setEmergencyRequests(requests);
    } catch (error) {
      console.error('Error fetching emergency requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch emergency requests.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      const estimatedTime = prompt('Enter estimated arrival time (e.g., "15 minutes"):');
      if (!estimatedTime) return;

      await emergencyAPI.acceptEmergencyRequest(requestId, estimatedTime);
      toast({
        title: "Request Accepted",
        description: "Emergency request accepted successfully.",
        variant: "default",
      });
      fetchEmergencyRequests();
    } catch (error) {
      console.error('Error accepting request:', error);
      toast({
        title: "Error",
        description: "Failed to accept emergency request.",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const reason = prompt('Enter reason for rejection (optional):');
      await emergencyAPI.rejectEmergencyRequest(requestId, reason || undefined);
      toast({
        title: "Request Rejected",
        description: "Emergency request has been rejected.",
        variant: "default",
      });
      fetchEmergencyRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Error",
        description: "Failed to reject emergency request.",
        variant: "destructive",
      });
    }
  };

  const handleCompleteRequest = async (requestId: string) => {
    try {
      const notes = prompt('Enter completion notes (optional):');
      await emergencyAPI.completeEmergencyRequest(requestId, notes || undefined);
      toast({
        title: "Request Completed",
        description: "Emergency request marked as completed.",
        variant: "default",
      });
      fetchEmergencyRequests();
    } catch (error) {
      console.error('Error completing request:', error);
      toast({
        title: "Error",
        description: "Failed to complete emergency request.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ACCEPTED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filterRequests = (status: string) => {
    switch (status) {
      case 'active':
        return emergencyRequests.filter(req => req.status === 'PENDING' || req.status === 'ACCEPTED');
      case 'completed':
        return emergencyRequests.filter(req => req.status === 'COMPLETED');
      case 'cancelled':
        return emergencyRequests.filter(req => req.status === 'REJECTED');
      default:
        return emergencyRequests;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/5 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading emergency requests...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-primary/5 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center space-x-3">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <span>Emergency Requests</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              {user?.role === 'PATIENT' 
                ? 'Manage your emergency medical requests'
                : 'Handle incoming emergency requests from patients'
              }
            </p>
          </div>
          
          {user?.role === 'PATIENT' && (
            <Button
              onClick={() => setShowModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Emergency Request
            </Button>
          )}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active Requests</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled/Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filterRequests(activeTab).length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Emergency Requests</h3>
                  <p className="text-muted-foreground">
                    {activeTab === 'active' 
                      ? 'No active emergency requests at the moment.'
                      : `No ${activeTab} emergency requests found.`
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filterRequests(activeTab).map((request) => (
                <Card key={request.id} className="border-l-4 border-l-red-500">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <CardTitle className="text-lg">
                            {user?.role === 'PATIENT' ? 'Emergency Request' : request.patientName}
                          </CardTitle>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status}
                          </Badge>
                          <Badge className={getUrgencyColor(request.urgencyLevel)}>
                            {request.urgencyLevel}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{format(new Date(request.createdAt), 'MMM dd, yyyy HH:mm')}</span>
                          </div>
                          {request.doctorName && (
                            <div className="flex items-center space-x-1">
                              <User className="w-4 h-4" />
                              <span>Dr. {request.doctorName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-start space-x-2">
                          <Activity className="w-4 h-4 mt-1 text-red-500" />
                          <div>
                            <p className="font-medium text-sm">Symptoms</p>
                            <p className="text-sm text-muted-foreground">{request.symptoms}</p>
                          </div>
                        </div>
                      </div>
                      
                      
                      <div className="space-y-2">
                        <div className="flex items-start space-x-2">
                          <MapPin className="w-4 h-4 mt-1 text-blue-500" />
                          <div>
                            <p className="font-medium text-sm">Location</p>
                            <p className="text-sm text-muted-foreground">{request.location}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {request.notes && (
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-sm"><strong>Notes:</strong> {request.notes}</p>
                      </div>
                    )}

                    {/* Action buttons for doctors */}
                    {user?.role === 'DOCTOR' && request.status === 'PENDING' && (
                      <div className="flex space-x-3 pt-4">
                        <Button
                          onClick={() => handleAcceptRequest(request.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accept Request
                        </Button>
                        <Button
                          onClick={() => handleRejectRequest(request.id)}
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}

                    {/* Complete button for accepted requests */}
                    {user?.role === 'DOCTOR' && request.status === 'ACCEPTED' && (
                      <div className="pt-4">
                        <Button
                          onClick={() => handleCompleteRequest(request.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark as Completed
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Emergency Request Modal */}
      <EmergencyRequestModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchEmergencyRequests}
      />
    </div>
  );
};

export default EmergencyRequestsPage;