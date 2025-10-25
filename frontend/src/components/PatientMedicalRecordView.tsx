import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { CurrentHealthData, MedicalHistoryItem, LifestyleInformation } from '@/types/healthRecord';

import { 
  User, 
  Heart, 
  Activity, 
  FileText, 
  Lock, 
  Unlock, 
  Clock, 
  MessageSquare,
  Eye,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Calendar,
  Loader2,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { documentPermissionAPI } from '@/services/documentPermissionApi';
import { PatientMedicalRecordAccess, DocumentPermissionRequest, DoctorDocumentAccess } from '@/types/documentPermission';
import { HealthDocument } from '@/types/healthRecord';
import { cn } from '@/lib/utils';

interface PatientMedicalRecordViewProps {
  appointmentId: string;
  onClose: () => void;
}

export const PatientMedicalRecordView: React.FC<PatientMedicalRecordViewProps> = ({
  appointmentId,
  onClose
}) => {
  const [medicalRecordAccess, setMedicalRecordAccess] = useState<PatientMedicalRecordAccess | null>(null);
  const [documentAccess, setDocumentAccess] = useState<DoctorDocumentAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestingPermission, setRequestingPermission] = useState<string | null>(null);
  const [permissionRequestMessage, setPermissionRequestMessage] = useState('');
  const [editingHealth, setEditingHealth] = useState(false);
  const [healthData, setHealthData] = useState<CurrentHealthData | null>(null);
  const [requestingDocumentId, setRequestingDocumentId] = useState<string | null>(null);
  // Document viewing state
  const [viewingDocument, setViewingDocument] = useState<HealthDocument | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [savingHealth, setSavingHealth] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadMedicalRecord();
    loadDocumentAccess();
  }, [appointmentId]);

  const handleViewDocument = async (document: HealthDocument) => {
    try {
      const file = await documentPermissionAPI.getDocumentFile(document.id);
      const url = URL.createObjectURL(new Blob([file]));
      setDocumentUrl(url);
      setViewingDocument(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      toast({
        title: "Error",
        description: "Failed to load document",
        variant: "destructive",
      });
    }
  };

  const loadMedicalRecord = async () => {
    try {
      const data = await documentPermissionAPI.getPatientMedicalRecord(appointmentId);
      setMedicalRecordAccess(data);
      if (data.medicalRecord?.currentHealth) {
        setHealthData(data.medicalRecord.currentHealth);
      }
    } catch (error) {
      console.error('Error loading medical record:', error);
      toast({
        title: "Error",
        description: "Failed to load patient medical record",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadDocumentAccess = async () => {
    try {
      const access = await documentPermissionAPI.getDoctorDocumentAccess(appointmentId);
      setDocumentAccess(access);
    } catch (error) {
      console.error('Error loading document access:', error);
    }
  };

  const requestDocumentPermission = async (documentId: string) => {
    if (!permissionRequestMessage.trim()) {
      toast({
        title: "Message Required",
        description: "Please provide a reason for requesting access to this document",
        variant: "destructive",
      });
      return;
    }

    try {
      setRequestingPermission(documentId);
      await documentPermissionAPI.requestDocumentPermission(
        appointmentId,
        documentId,
        permissionRequestMessage
      );
      
      toast({
        title: "Permission Requested",
        description: "Your request has been sent to the patient",
      });
      
      // Reset states
      setPermissionRequestMessage('');
      setRequestingDocumentId(null);
      setRequestingPermission(null);
      
      await loadMedicalRecord(); // Refresh to show new request
    } catch (error) {
      console.error('Error requesting permission:', error);
      toast({
        title: "Error",
        description: "Failed to request document permission",
        variant: "destructive",
      });
    } finally {
      setRequestingPermission(null);
    }
  };

  const saveHealthData = async () => {
    try {
      setSavingHealth(true);
      await documentPermissionAPI.updatePatientCurrentHealth(
        medicalRecordAccess!.patientId,
        appointmentId,
        healthData
      );
      
      toast({
        title: "Success",
        description: "Health data updated successfully",
      });
      
      setEditingHealth(false);
      await loadMedicalRecord(); // Refresh data
    } catch (error) {
      console.error('Error updating health data:', error);
      toast({
        title: "Error",
        description: "Failed to update health data",
        variant: "destructive",
      });
    } finally {
      setSavingHealth(false);
    }
  };

  const getDocumentAccess = (documentId: string) => {
    return documentAccess.find(access => access.documentId === documentId);
  };

  const getPermissionStatus = (document: HealthDocument) => {
    // Match with string
    const directAccess = documentAccess.find(access => access.documentId === String(document.id));
    if (directAccess?.canView) {
      return { status: 'APPROVED' };
    }

    return medicalRecordAccess?.documentPermissions.find(
      p => p.documentId === String(document.id)
    );
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

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!medicalRecordAccess) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Medical Record Not Found</DialogTitle>
            <DialogDescription>
              Unable to load patient medical record for this appointment.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true}>
      <DialogContent 
        className="max-w-6xl max-h-[90vh] overflow-y-auto p-0" 
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="absolute right-1 top-1 text-muted-foreground hover:text-foreground z-10"
          >
            <X className="h-5 w-5" />
          </Button>
          
          <div className="bg-gradient-to-r from-blue-600 to-teal-500 text-white p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-full">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white">{medicalRecordAccess.patientName}'s Medical Record</h2>
                <p className="text-blue-100 flex items-center mt-1">
                  <Calendar className="w-4 h-4 mr-1" />
                  Appointment: {new Date(medicalRecordAccess.appointmentDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full px-6">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 rounded-lg">
            <TabsTrigger 
              value="overview" 
              className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Activity className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Heart className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger 
              value="lifestyle" 
              className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <User className="w-4 h-4 mr-2" />
              Lifestyle
            </TabsTrigger>
            <TabsTrigger 
              value="documents" 
              className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <FileText className="w-4 h-4 mr-2" />
              Documents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Demographics */}
              <Card className="border-0 shadow-md h-[380px] flex flex-col">
                <CardHeader className="bg-muted/30 py-4">
                  <CardTitle className="flex items-center space-x-2 text-lg">
                    <User className="w-5 h-5 text-blue-600" />
                    <span>Basic Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4 flex-1 overflow-auto">
                  {medicalRecordAccess.medicalRecord?.basicDemographics && (
                    <>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <p className="text-muted-foreground text-xs">Age</p>
                          <p className="font-medium">{new Date().getFullYear() - new Date(medicalRecordAccess.medicalRecord.basicDemographics.dateOfBirth).getFullYear()}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-muted-foreground text-xs">Gender</p>
                          <p className="font-medium">{medicalRecordAccess.medicalRecord.basicDemographics.gender}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-muted-foreground text-xs">Blood Group</p>
                          <p className="font-medium">{medicalRecordAccess.medicalRecord.basicDemographics.bloodGroup}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-muted-foreground text-xs">Contact</p>
                          <p className="font-medium">{medicalRecordAccess.medicalRecord.basicDemographics.contactNumber}</p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Current Health Data */}
              <Card className="border-0 shadow-md h-[380px] flex flex-col">
                <CardHeader className="bg-muted/30 py-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      <Activity className="w-5 h-5 text-blue-600" />
                      <span>Current Health</span>
                    </CardTitle>
                    <Button
                      variant={editingHealth ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setEditingHealth(!editingHealth)}
                    >
                      {editingHealth ? (
                        <>
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 flex-1 overflow-auto">
                  {editingHealth ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Weight (kg)</Label>
                          <Input
                            type="number"
                            value={healthData?.weight || ''}
                            onChange={(e) => setHealthData({...healthData, weight: parseFloat(e.target.value)})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Height (cm)</Label>
                          <Input
                            type="number"
                            value={healthData?.height || ''}
                            onChange={(e) => setHealthData({...healthData, height: parseFloat(e.target.value)})}
                          />
                        </div>
                      </div>
                      
                      <Separator />
                      <h4 className="font-semibold text-sm">Vital Signs</h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Blood Pressure (Systolic)</Label>
                          <Input
                            type="number"
                            value={healthData?.vitals?.bloodPressureSystolic || ''}
                            onChange={(e) => setHealthData({
                              ...healthData,
                              vitals: {...healthData.vitals, bloodPressureSystolic: parseInt(e.target.value)}
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Blood Pressure (Diastolic)</Label>
                          <Input
                            type="number"
                            value={healthData?.vitals?.bloodPressureDiastolic || ''}
                            onChange={(e) => setHealthData({
                              ...healthData,
                              vitals: {...healthData.vitals, bloodPressureDiastolic: parseInt(e.target.value)}
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Pulse (bpm)</Label>
                          <Input
                            type="number"
                            value={healthData?.vitals?.pulse || ''}
                            onChange={(e) => setHealthData({
                              ...healthData,
                              vitals: {...healthData.vitals, pulse: parseInt(e.target.value)}
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Temperature (°C)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={healthData?.vitals?.temperature || ''}
                            onChange={(e) => setHealthData({
                              ...healthData,
                              vitals: {...healthData.vitals, temperature: parseFloat(e.target.value)}
                            })}
                          />
                        </div>
                      </div>
                      
                      <Button onClick={saveHealthData} disabled={savingHealth} className="w-full">
                        {savingHealth ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {healthData && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <p className="text-muted-foreground text-xs">Weight</p>
                              <p className="font-medium">{healthData.weight} kg</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-muted-foreground text-xs">Height</p>
                              <p className="font-medium">{healthData.height} cm</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-muted-foreground text-xs">BMI</p>
                              <p className="font-medium">{healthData.bmi?.toFixed(1) || 'N/A'}</p>
                            </div>
                          </div>
                          <Separator />
                          <h4 className="font-semibold text-sm">Vital Signs</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <p className="text-muted-foreground text-xs">Blood Pressure</p>
                              <p className="font-medium">{healthData.vitals?.bloodPressureSystolic}/{healthData.vitals?.bloodPressureDiastolic} mmHg</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-muted-foreground text-xs">Pulse</p>
                              <p className="font-medium">{healthData.vitals?.pulse} bpm</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-muted-foreground text-xs">Temperature</p>
                              <p className="font-medium">{healthData.vitals?.temperature}°C</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-muted-foreground text-xs">O2 Saturation</p>
                              <p className="font-medium">{healthData.vitals?.oxygenSaturation}%</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-6">
            <Card className="border-0 shadow-md h-[500px] flex flex-col">
              <CardHeader className="bg-muted/30 py-4">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Heart className="w-5 h-5 text-blue-600" />
                  <span>Medical History</span>
                  <Badge variant="secondary" className="ml-2">Free Access</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 flex-1 overflow-auto">
                {medicalRecordAccess.medicalRecord?.medicalHistory?.length > 0 ? (
                  <div className="space-y-4">
                    {medicalRecordAccess.medicalRecord?.medicalHistory.map((item: MedicalHistoryItem) => (
                      <div key={item.id} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{item.title}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge variant={item.severity === 'HIGH' ? 'destructive' : item.severity === 'MODERATE' ? 'default' : 'secondary'}>
                              {item.severity}
                            </Badge>
                            <Badge variant={item.isActive ? 'default' : 'outline'}>
                              {item.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                        {item.description && <p className="text-sm text-muted-foreground mb-2">{item.description}</p>}
                        {item.onsetDate && (
                          <p className="text-xs text-muted-foreground">
                            Onset: {new Date(item.onsetDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground h-full flex flex-col items-center justify-center">
                    <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No medical history recorded</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lifestyle" className="space-y-4 mt-6">
            <Card className="border-0 shadow-md h-[380px] flex flex-col">
              <CardHeader className="bg-muted/30 py-4">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <span>Lifestyle Information</span>
                  <Badge variant="secondary" className="ml-2">Free Access</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 flex-1 overflow-auto">
                {medicalRecordAccess.medicalRecord?.lifestyle ? (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs">Smoking</p>
                      <p className="font-medium">{medicalRecordAccess.medicalRecord.lifestyle.smokingHabit}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs">Alcohol</p>
                      <p className="font-medium">{medicalRecordAccess.medicalRecord.lifestyle.alcoholHabit}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs">Diet</p>
                      <p className="font-medium">{medicalRecordAccess.medicalRecord.lifestyle.dietaryPreferences}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs">Activity Level</p>
                      <p className="font-medium">{medicalRecordAccess.medicalRecord.lifestyle.physicalActivityLevel}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs">Sleep Hours</p>
                      <p className="font-medium">{medicalRecordAccess.medicalRecord.lifestyle.sleepHours}h</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs">Stress Level</p>
                      <p className="font-medium">{medicalRecordAccess.medicalRecord.lifestyle.stressLevel}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground h-full flex flex-col items-center justify-center">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No lifestyle information recorded</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4 mt-6">
            <Card className="border-0 shadow-md h-[500px] flex flex-col">
              <CardHeader className="bg-muted/30 py-4">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>Medical Documents</span>
                  <Badge variant="outline" className="ml-2">Permission Required</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 flex-1 overflow-auto">
                {medicalRecordAccess.medicalRecord?.documents?.length > 0 ? (
                  <div className="space-y-4">
                    {medicalRecordAccess.medicalRecord.documents.map((document: HealthDocument) => {
                      const permission = getPermissionStatus(document);
                      const access = getDocumentAccess(document.id);
                      
                      return (
                        <div key={document.id} className="p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 flex items-center space-x-4">
                              <div className="bg-blue-100 p-3 rounded-lg">
                                <FileText className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold">{document.name}</h4>
                                <p className="text-sm text-muted-foreground">
                                  {document.type} • {new Date(document.uploadDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              {permission?.status === 'APPROVED' || access?.canView ? (
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Approved
                                  </Badge>
                                  {access?.expiresAt && (
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {formatTimeRemaining(access.expiresAt)}
                                    </Badge>
                                  )}
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleViewDocument(document)}
                                    className="flex items-center"
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    View
                                  </Button>
                                </div>
                              ) : permission?.status === 'PENDING' ? (
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Pending
                                </Badge>
                              ) : permission?.status === 'REJECTED' ? (
                                <Badge variant="destructive">
                                  <X className="w-3 h-3 mr-1" />
                                  Rejected
                                </Badge>
                              ) : (
                                <>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => setRequestingDocumentId(String(document.id))}
                                    className="flex items-center"
                                  >
                                    <Lock className="w-4 h-4 mr-1" />
                                    Request Access
                                  </Button>
                                  
                                  <Dialog 
                                    open={requestingDocumentId === String(document.id)} 
                                    onOpenChange={(open) => {
                                      if (!open) {
                                        setRequestingDocumentId(null);
                                        setPermissionRequestMessage('');
                                      }
                                    }}
                                  >
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Request Document Access</DialogTitle>
                                        <DialogDescription>
                                          Request permission to view "{document.name}"
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div>
                                          <Label>Reason for accessing this document</Label>
                                          <Textarea
                                            placeholder="Please explain why you need to view this document..."
                                            value={permissionRequestMessage}
                                            onChange={(e) => setPermissionRequestMessage(e.target.value)}
                                            className="min-h-[100px]"
                                          />
                                        </div>
                                        <Button
                                          onClick={() => requestDocumentPermission(String(document.id))}
                                          disabled={requestingPermission === String(document.id)}
                                          className="w-full"
                                        >
                                          {requestingPermission === String(document.id) ? (
                                            <>
                                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                              Requesting...
                                            </>
                                          ) : (
                                            <>
                                              <MessageSquare className="w-4 h-4 mr-2" />
                                              Send Request
                                            </>
                                          )}
                                        </Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground h-full flex flex-col items-center justify-center">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No documents uploaded</p>
                  </div>
                )}
              </CardContent>
              <Dialog open={!!viewingDocument} onOpenChange={() => { setViewingDocument(null); setDocumentUrl(null); }}>
                <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                  <DialogHeader>
                    <DialogTitle className="flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      {viewingDocument?.name}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="flex-1 overflow-auto border rounded-lg bg-muted/20">
                    {documentUrl && (
                      viewingDocument?.type.includes("pdf") ? (
                        <iframe src={documentUrl} className="w-full h-full" />
                      ) : (
                        <img src={documentUrl} alt={viewingDocument?.name} className="max-h-full mx-auto" />
                      )
                    )}
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button variant="outline" onClick={() => { setViewingDocument(null); setDocumentUrl(null); }}>
                      Close
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};