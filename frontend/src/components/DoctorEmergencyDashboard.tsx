import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { emergencyAPI } from '@/services/emergencyApi';
import { EmergencyRequest } from '@/types/emergency';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { RejectionReasonModal } from '@/components/RejectionReasonModal';
import { format } from 'date-fns';
import {
  AlertTriangle,
  Clock,
  MapPin,
  Activity,
  CheckCircle,
  XCircle,
  Users,
  Timer,
  Loader2,
  Phone
} from 'lucide-react';
import { boolean } from 'zod';

export const DoctorEmergencyDashboard = () => {
  const { doctorProfile } = useProfile();
  const { toast } = useToast();
  const [pendingRequests, setPendingRequests] = useState<EmergencyRequest[]>([]);
  const [isAvailable, setIsAvailable] = useState(false); // Default to false until we fetch
  const [loading, setLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);

  useEffect(() => {
    if (doctorProfile) {
      fetchDoctorAvailability();
      fetchPendingRequests();
    }
  }, [doctorProfile]);

  const fetchDoctorAvailability = async () => {
    if (!doctorProfile) return;
    
    setAvailabilityLoading(true);
    try {
      const availability = await emergencyAPI.getDoctorAvailability(doctorProfile.id.toString());
      console.log("Doctor availability from API:", availability, typeof availability);
      setIsAvailable(Boolean(availability));
    } catch (error) {
      console.error('Error fetching doctor availability:', error);
      toast({
        title: "Error",
        description: "Failed to fetch availability status.",
        variant: "destructive",
      });
    } finally {
      setAvailabilityLoading(false);
      setLoading(false);
    }
  };
  
  const fetchPendingRequests = async () => {
    if (!doctorProfile) return;
    
    try {
      const requests = await emergencyAPI.getPendingEmergencyRequests(doctorProfile.id.toString());
      setPendingRequests(requests);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch emergency requests.",
        variant: "destructive",
      });
    }
  };
  
  const handleAvailabilityToggle = async (newAvailability: boolean) => {
    if (!doctorProfile) return;
  
    try {
      // Store current state in case we need to revert
      const currentAvailability = isAvailable;
      
      // Optimistically update the UI to the NEW state
      setIsAvailable(newAvailability);
      
      // Send the NEW availability state to the backend
      await emergencyAPI.updateDoctorAvailability(doctorProfile.id.toString(), newAvailability);
      
      toast({
        title: newAvailability ? "Available for Emergencies" : "Emergency Availability Disabled",
        description: newAvailability 
          ? "You will receive emergency request notifications." 
          : "You won't receive new emergency requests.",
        variant: "default",
      });
    } catch (error) {
      // Revert on error - go back to the OLD state
      setIsAvailable(!newAvailability);
      console.error('Error updating availability:', error);
      toast({
        title: "Error",
        description: "Failed to update availability status.",
        variant: "destructive",
      });
    }
  };

  

  const handleAcceptRequest = async (doctorId: string, requestId: string) => {
    setProcessingRequest(requestId);
    try {
      await emergencyAPI.acceptEmergencyRequest(doctorId, requestId);
      setPendingRequests(prev => prev.filter(req => req.id !== requestId));
      
      toast({
        title: "Request Accepted",
        description: "Emergency request accepted successfully. Patient has been notified.",
        variant: "default",
      });
      
      // Refresh the list to get updated data
      fetchPendingRequests();
    } catch (error) {
      console.error('Error accepting request:', error);
      toast({
        title: "Error",
        description: "Failed to accept emergency request.",
        variant: "destructive",
      });
    } finally {
      setProcessingRequest(null);
    }
  };

  

  const handleRejectRequest = async (requestId: string) => {
    setSelectedRequestId(requestId);
    setShowRejectionModal(true);
  };

  const handleConfirmRejection = async (reason: string) => {
    if (!selectedRequestId || !doctorProfile) return;
    
    setProcessingRequest(selectedRequestId);
    try {
      await emergencyAPI.rejectEmergencyRequest(doctorProfile.id.toString(), selectedRequestId, reason || undefined);
      setPendingRequests(prev => prev.filter(req => req.id !== selectedRequestId));
      
      toast({
        title: "Request Rejected",
        description: "Emergency request has been rejected.",
        variant: "default",
      });
      
      // Refresh the list to get updated data
      fetchPendingRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Error",
        description: "Failed to reject emergency request.",
        variant: "destructive",
      });
    } finally {
      setProcessingRequest(null);
      setShowRejectionModal(false);
      setSelectedRequestId(null);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading emergency dashboard...</span>
        </div>
      </div>
    );
    }
    

  return (
    <div className="space-y-6">
      {/* Availability Toggle */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-blue-500" />
              <span>Emergency Availability</span>
            </div>
            <Badge className={isAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
              {isAvailable ? 'Available' : 'Unavailable'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Toggle your availability to receive emergency requests from patients.
              </p>
            </div>
            {availabilityLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Switch
                checked={isAvailable}
                onCheckedChange={handleAvailabilityToggle}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending Emergency Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-red-500" />
            <span>Pending Emergency Requests</span>
            <Badge variant="outline">{pendingRequests.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Pending Requests</h3>
              <p className="text-muted-foreground">
                {isAvailable 
                  ? 'No emergency requests at the moment. You\'ll be notified when new requests come in.'
                  : 'Enable emergency availability to receive requests.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div 
                  key={request.id} 
                  className={`border rounded-lg p-4 ${
                    request.urgencyLevel === 'HIGH' 
                      ? 'border-red-300 bg-red-50' 
                      : 'border-border bg-card'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-semibold">{request.patientName}</h4>
                        <Badge className={getUrgencyColor(request.urgencyLevel)}>
                          {request.urgencyLevel} PRIORITY
                        </Badge>
                      </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{format(new Date(request.createdAt), 'HH:mm')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Timer className="w-4 h-4" />
                            <span>{format(new Date(request.createdAt), 'MMM dd')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Phone className="w-4 h-4" />
                            <span>{request.patientPhone}</span>
                          </div>
                        </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
                    <div className="bg-muted/50 rounded-lg p-3 mb-4">
                      <p className="text-sm"><strong>Additional Notes:</strong> {request.notes}</p>
                    </div>
                  )}

                  <div className="flex space-x-3">
                    <Button
                      onClick={() => handleAcceptRequest(doctorProfile.id.toString(), request.id)}
                      disabled={processingRequest === request.id}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {processingRequest === request.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      )}
                      Accept Request
                    </Button>
                    <Button
                      onClick={() => handleRejectRequest(request.id)}
                      disabled={processingRequest === request.id}
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rejection Reason Modal */}
      <RejectionReasonModal
        isOpen={showRejectionModal}
        onClose={() => {
          setShowRejectionModal(false);
          setSelectedRequestId(null);
        }}
        onConfirm={handleConfirmRejection}
        loading={processingRequest === selectedRequestId}
      />
    </div>
  );
};