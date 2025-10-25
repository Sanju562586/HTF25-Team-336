import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmergencyRequestModal } from '@/components/EmergencyRequestModal';
import { emergencyAPI } from '@/services/emergencyApi';
import { EmergencyRequest } from '@/types/emergency';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { format } from 'date-fns';
import {
  AlertTriangle,
  MapPin,
  Clock,
  User,
  Activity,
  Timer,
  Loader2,
  Plus,
  Stethoscope,
  Phone,
  CheckCircle
} from 'lucide-react';

export const PatientEmergencyRequests = () => {
  const { patientProfile } = useProfile();
  const { toast } = useToast();
  const [emergencyRequests, setEmergencyRequests] = useState<EmergencyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [completingRequest, setCompletingRequest] = useState<string | null>(null);

  useEffect(() => {
    if (patientProfile) {
      fetchEmergencyRequests();
    }
  }, [patientProfile]);

  const fetchEmergencyRequests = async () => {
    if (!patientProfile) return;
    
    setLoading(true);
    try {
      const requests = await emergencyAPI.getPatientEmergencyRequests(patientProfile.id.toString());
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

  const handleCompleteRequest = async (requestId: string) => {
    setCompletingRequest(requestId);
    try {
      await emergencyAPI.completeEmergencyRequest(requestId, "Request marked as completed by patient.");
      
      toast({
        title: "Success",
        description: "Emergency request has been marked as completed.",
        variant: "default",
      });
      
      // Refresh the list
      await fetchEmergencyRequests();
    } catch (error) {
      console.error('Error completing emergency request:', error);
      toast({
        title: "Error",
        description: "Failed to complete emergency request.",
        variant: "destructive",
      });
    } finally {
      setCompletingRequest(null);
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
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading emergency requests...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <span>Emergency Requests</span>
          </h2>
          <p className="text-muted-foreground mt-1">
            Create and manage your emergency medical requests
          </p>
        </div>
        
        <Button
          onClick={() => setShowModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Emergency Request
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">Active Requests</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {filterRequests('active').length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Emergency Requests</h3>
                <p className="text-muted-foreground">
                  No active emergency requests at the moment.
                </p>
                <Button
                  onClick={() => setShowModal(true)}
                  className="bg-red-600 hover:bg-red-700 text-white mt-4"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Emergency Request
                </Button>
              </CardContent>
            </Card>
          ) : (
            filterRequests('active').map((request) => (
              <Card key={request.id} className="border-l-4 border-l-red-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <CardTitle className="text-lg">Emergency Request</CardTitle>
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
                      </div>
                    </div>
                    
                    {/* Complete Button - Only show for PENDING or ACCEPTED requests */}
                    {(request.status === 'PENDING' || request.status === 'ACCEPTED') && (
                      <Button
                        onClick={() => handleCompleteRequest(request.id)}
                        disabled={completingRequest === request.id}
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
                      >
                        {completingRequest === request.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        Mark as Completed
                      </Button>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <Activity className="w-4 h-4 mt-1 text-red-500" />
                        <div>
                          <p className="font-medium text-sm">Description</p>
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

                  {/* Doctor Details (when accepted) */}
                  {request.status === 'ACCEPTED' && request.doctorName && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Stethoscope className="w-5 h-5 text-blue-600" />
                        <h4 className="font-semibold text-blue-800">Doctor Assigned</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-blue-700">Dr. {request.doctorName}</span>
                        </div>
                        {request.patientPhone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-blue-700">Contact: {request.patientPhone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {filterRequests('completed').length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Completed Requests</h3>
                <p className="text-muted-foreground">
                  No completed emergency requests found.
                </p>
              </CardContent>
            </Card>
          ) : (
            filterRequests('completed').map((request) => (
              <Card key={request.id} className="border-l-4 border-l-green-500">
                <CardHeader>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <CardTitle className="text-lg">Emergency Request</CardTitle>
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
                      {request.updatedAt !== request.createdAt && (
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="w-4 h-4" />
                          <span>Completed: {format(new Date(request.updatedAt), 'MMM dd, yyyy HH:mm')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <Activity className="w-4 h-4 mt-1 text-red-500" />
                        <div>
                          <p className="font-medium text-sm">Description</p>
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
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-sm font-medium text-green-800 mb-1">Completion Notes:</p>
                      <p className="text-sm text-green-700">{request.notes}</p>
                    </div>
                  )}

                  {/* Doctor Details */}
                  {request.doctorName && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Stethoscope className="w-5 h-5 text-blue-600" />
                        <h4 className="font-semibold text-blue-800">Doctor Assigned</h4>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-blue-700">Dr. {request.doctorName}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Emergency Request Modal */}
      <EmergencyRequestModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchEmergencyRequests}
      />
    </div>
  );
};