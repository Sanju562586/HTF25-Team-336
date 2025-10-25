import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  Calendar,
  MessageSquare,
  Eye,
  Timer,
  Shield,
  Hourglass,
  CheckSquare,
  Ban
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { documentPermissionAPI } from '@/services/documentPermissionApi';
import { DocumentPermissionRequest } from '@/types/documentPermission';
import { useAuth } from '@/context/AuthContext';

export const DocumentPermissionRequests: React.FC = () => {
  const [permissionRequests, setPermissionRequests] = useState<DocumentPermissionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingToRequest, setRespondingToRequest] = useState<string | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<DocumentPermissionRequest | null>(null);
  const [activeTab, setActiveTab] = useState('pending');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user?.role === 'PATIENT') {
      loadPermissionRequests();
    }
  }, [user]);

  const loadPermissionRequests = async () => {
    try {
      setLoading(true);
      const requests = await documentPermissionAPI.getPatientPermissionRequests(user.username);
      setPermissionRequests(requests);
    } catch (error) {
      console.error('Error loading permission requests:', error);
      toast({
        title: "Error",
        description: "Failed to load permission requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const respondToRequest = async (requestId: string, response: 'APPROVED' | 'REJECTED') => {
    try {
      setRespondingToRequest(requestId);
      
      await documentPermissionAPI.respondToPermissionRequest(requestId, {
        permissionRequestId: requestId,
        response,
        responseMessage: responseMessage.trim() || undefined
      });

      toast({
        title: response === 'APPROVED' ? "Access Granted" : "Access Denied",
        description: `Document permission has been ${response.toLowerCase()}`,
      });

      setResponseMessage('');
      setSelectedRequest(null);
      await loadPermissionRequests(); // Refresh the list
    } catch (error) {
      console.error('Error responding to request:', error);
      toast({
        title: "Error",
        description: "Failed to respond to permission request",
        variant: "destructive",
      });
    } finally {
      setRespondingToRequest(null);
    }
  };

  const revokePermission = async (requestId: string) => {
    try {
      await documentPermissionAPI.revokeDocumentPermission(requestId);
      
      toast({
        title: "Permission Revoked",
        description: "Document access has been revoked",
      });

      await loadPermissionRequests(); // Refresh the list
    } catch (error) {
      console.error('Error revoking permission:', error);
      toast({
        title: "Error",
        description: "Failed to revoke permission",
        variant: "destructive",
      });
    }
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffInMinutes = Math.max(0, Math.floor((expires.getTime() - now.getTime()) / (1000 * 60)));
    
    if (diffInMinutes > 60) {
      const hours = Math.floor(diffInMinutes / 60);
      const minutes = diffInMinutes % 60;
      return `${hours}h ${minutes}m`;
    }
    return `${diffInMinutes}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-300';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'APPROVED': return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Filter requests based on status
  const pendingRequests = permissionRequests.filter(request => request.status === 'PENDING');
  const approvedRequests = permissionRequests.filter(request => 
    request.status === 'APPROVED' && !request.isExpired
  );
  const expiredOrRejectedRequests = permissionRequests.filter(request => 
    request.status === 'REJECTED' || request.isExpired
  );

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-card via-card/95 to-primary/5 border-border/30 shadow-lg">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderRequestCard = (request: DocumentPermissionRequest) => (
    <div key={request.id} className="p-4 bg-muted/20 rounded-lg border mb-4">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-primary" />
            <div>
              <h4 className="font-semibold">{request.documentName}</h4>
              <p className="text-sm text-muted-foreground">
                {request.documentType} • Requested by Dr. {request.doctorName}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(request.requestedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span>Appointment ID: AI0{request.appointmentId}</span>
            </div>
          </div>

          {request.requestMessage && (
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-sm font-medium mb-1">Doctor's message:</p>
              <p className="text-sm text-muted-foreground">{request.requestMessage}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end space-y-3">
          <Badge 
            variant="outline" 
            className={`${getStatusColor(request.status)} flex items-center space-x-1`}
          >
            {getStatusIcon(request.status)}
            <span>{request.status}{request.isExpired ? ' (Expired)' : ''}</span>
          </Badge>

          {request.status === 'PENDING' && (
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedRequest(request)}
                disabled={respondingToRequest === request.id}
              >
                <Eye className="w-4 h-4 mr-1" />
                Review
              </Button>
            </div>
          )}

          {request.status === 'APPROVED' && request.expiresAt && !request.isExpired && (
            <div className="text-right space-y-1">
              {/* <div className="flex items-center space-x-1 text-sm text-green-600">
                <Timer className="w-4 h-4" />
                <span>{formatTimeRemaining(request.expiresAt)} left</span>
              </div> */}
              <Button
                size="sm"
                variant="destructive"
                onClick={() => revokePermission(request.id)}
              >
                Revoke Access
              </Button>
            </div>
          )}

          {request.status === 'APPROVED' && request.isExpired && (
            <div className="text-right">
              <Badge variant="outline" className="text-gray-500">
                <Clock className="w-3 h-3 mr-1" />
                Expired
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderEmptyState = (icon: React.ReactNode, title: string, description: string) => (
    <div className="text-center py-12 bg-muted/20 rounded-lg border-2 border-dashed">
      {icon}
      <p className="text-muted-foreground mt-3">{title}</p>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
  );

  return (
    <>
      <Card className="bg-gradient-to-br from-card via-card/95 to-primary/5 border-border/30 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span>Document Permission Requests</span>
              <p className="text-sm font-normal text-muted-foreground">
                Manage doctor access to your medical documents
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="pending" className="flex items-center space-x-2">
                <Hourglass className="w-4 h-4" />
                <span>Pending ({pendingRequests.length})</span>
              </TabsTrigger>
              <TabsTrigger value="approved" className="flex items-center space-x-2">
                <CheckSquare className="w-4 h-4" />
                <span>Approved ({approvedRequests.length})</span>
              </TabsTrigger>
              <TabsTrigger value="rejected" className="flex items-center space-x-2">
                <Ban className="w-4 h-4" />
                <span>Rejected/Expired ({expiredOrRejectedRequests.length})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              {pendingRequests.length === 0 ? (
                renderEmptyState(
                  <Hourglass className="w-12 h-12 text-muted-foreground/40 mx-auto" />,
                  "No pending requests",
                  "Doctors will need your permission to view specific medical documents"
                )
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map(renderRequestCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="approved">
              {approvedRequests.length === 0 ? (
                renderEmptyState(
                  <CheckSquare className="w-12 h-12 text-muted-foreground/40 mx-auto" />,
                  "No approved requests",
                  "Approved document access requests will appear here"
                )
              ) : (
                <div className="space-y-4">
                  {approvedRequests.map(renderRequestCard)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="rejected">
              {expiredOrRejectedRequests.length === 0 ? (
                renderEmptyState(
                  <Ban className="w-12 h-12 text-muted-foreground/40 mx-auto" />,
                  "No rejected or expired requests",
                  "Rejected or expired document access requests will appear here"
                )
              ) : (
                <div className="space-y-4">
                  {expiredOrRejectedRequests.map(renderRequestCard)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Response Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Review Permission Request</DialogTitle>
            <DialogDescription>
              Doctor is requesting access to "{selectedRequest?.documentName}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedRequest?.requestMessage && (
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-sm font-medium mb-1">Doctor's reason:</p>
                <p className="text-sm">{selectedRequest.requestMessage}</p>
              </div>
            )}

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> If approved, the doctor will have access to this document for 12 hours. 
                You can revoke access at any time.
              </p>
            </div>

            <div>
              <Label>Response message (optional)</Label>
              <Textarea
                placeholder="Add a message for the doctor..."
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
              />
            </div>

            <div className="flex space-x-3">
              <Button
                variant="destructive"
                onClick={() => respondToRequest(selectedRequest!.id, 'REJECTED')}
                disabled={respondingToRequest === selectedRequest?.id}
                className="flex-1"
              >
                {respondingToRequest === selectedRequest?.id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 mr-2" />
                    Deny
                  </>
                )}
              </Button>
              <Button
                onClick={() => respondToRequest(selectedRequest!.id, 'APPROVED')}
                disabled={respondingToRequest === selectedRequest?.id}
                className="flex-1"
              >
                {respondingToRequest === selectedRequest?.id ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};