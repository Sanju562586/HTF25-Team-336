import React, { useState, useEffect } from 'react';
import { DoctorProfile } from '@/types/user';
import { profileAPI } from '@/services/profileApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { useToast } from '@/hooks/use-toast';
import { 
  User, Phone, MapPin, Calendar, FileText, 
  Shield, CheckCircle, XCircle, Eye, AlertCircle, Download, Stethoscope,
  IndianRupee
} from 'lucide-react';
export const AdminDoctorVerification = () => {
  const [pendingProfiles, setPendingProfiles] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [loadingDocuments, setLoadingDocuments] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();
  useEffect(() => {
    loadPendingProfiles();
  }, []);

  const loadPendingProfiles = async () => {
    try {
      setLoading(true);
      const profiles = await profileAPI.getPendingDoctorProfiles();
      setPendingProfiles(profiles);
    } catch (error) {
      toast({
        title: "No Pending Profiles",
        description: "No pending doctor profiles found.",
        variant: "success",
      });
    } finally {
      setLoading(false);
    }
  };
  const handleVerification = async (profileId: string, isVerified: boolean) => {
    try {
      setProcessingId(profileId);
      await profileAPI.verifyDoctorProfile(profileId, isVerified);
      
      setPendingProfiles(prev => prev.filter(p => p.id !== profileId));
      
      toast({
        title: isVerified ? "Profile Approved" : "Profile Rejected",
        description: `Doctor profile has been ${isVerified ? 'approved' : 'rejected'}.`,
        variant: isVerified ? "default" : "destructive",
      });
    } catch (error) {
      console.error('Failed to update verification status:', error);
      toast({
        title: "Error",
        description: "Failed to update verification status.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };
  const handleViewDocument = async (filename: string, profileName: string) => {
    try {
      setLoadingDocuments(prev => ({ ...prev, [profileName]: true }));
      
      // Fetch the document through the API
      const documentBlob = await profileAPI.getPatientDocument(filename);
      
      // Create a blob URL for the document
      const blobUrl = URL.createObjectURL(documentBlob);
      
      // Open in new tab
      window.open(blobUrl, '_blank');
      
    } catch (error) {
      console.error('Failed to fetch document:', error);
      toast({
        title: "Error Opening Document",
        description: "Could not retrieve the document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingDocuments(prev => ({ ...prev, [profileName]: false }));
    }
  };

  const handleDownloadDocument = async (filename: string, profileName: string) => {
    try {
      setLoadingDocuments(prev => ({ ...prev, [profileName]: true }));
      
      // Fetch the document through the API
      const documentBlob = await profileAPI.getPatientDocument(filename);
      
      // Create download link
      const url = window.URL.createObjectURL(documentBlob);
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from the path
      const cleanFilename = filename.replace('/uploads/', '');
      link.download = cleanFilename;
      
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Failed to download document:', error);
      toast({
        title: "Error Downloading Document",
        description: "Could not download the document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingDocuments(prev => ({ ...prev, [profileName]: false }));
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading pending doctor profiles...</p>
      </div>
    );
  }
   if (pendingProfiles.length === 0) {
    return (
      <Card className="shadow-card border-border/50 bg-card/80 backdrop-blur-sm">
        <CardContent className="text-center py-12">
          <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">All Caught Up!</h3>
          <p className="text-muted-foreground">No doctor profiles pending verification.</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Shield className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Doctor Profile Verification</h2>
        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
          {pendingProfiles.length} pending
        </Badge>
      </div>

      <div className="grid gap-6">
        {pendingProfiles.map((profile) => (
          <Card key={profile.id} className="shadow-card border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Stethoscope className="w-5 h-5 text-primary" />
                  <span>Dr. {profile.firstName} {profile.lastName}</span>
                </CardTitle>
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Pending Review
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Personal Information</span>
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-muted-foreground">Full Name</label>
                      <p className="text-foreground font-medium">
                        Dr. {profile.firstName} {profile.lastName}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm text-muted-foreground">Gender</label>
                      <p className="text-foreground">{profile.gender}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm text-muted-foreground">Date of Birth</label>
                      <p className="text-foreground flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(profile.dateOfBirth).toLocaleDateString()}</span>
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm text-muted-foreground">Government ID</label>
                      <p className="text-foreground">{profile.governmentIdNumber}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm text-muted-foreground">License Number</label>
                      <p className="text-foreground">{profile.licenseNumber}</p>
                    </div>
                  </div>
                </div>
                
                {/* Professional Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground flex items-center space-x-2">
                    <Stethoscope className="w-4 h-4" />
                    <span>Professional Information</span>
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-muted-foreground">Specialization</label>
                      <p className="text-foreground">
                        {Array.isArray(profile.specialization) 
                          ? profile.specialization.join(', ')
                          : profile.specialization}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm text-muted-foreground">Department</label>
                      <p className="text-foreground">{profile.department}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm text-muted-foreground">Years of Experience</label>
                      <p className="text-foreground">{profile.yearsOfExperience} years</p>
                    </div>
                    
                    <div>
                      <label className="text-sm text-muted-foreground">Languages Spoken</label>
                      <p className="text-foreground">
                        {Array.isArray(profile.languagesSpoken) 
                          ? profile.languagesSpoken.join(', ')
                          : profile.languagesSpoken}
                      </p>
                    </div>
                    
                    {profile.consultationFees && (
                      <div>
                        <label className="text-sm text-muted-foreground">Consultation Fees</label>
                        <p className="text-foreground">
                          <IndianRupee className="w-4 h-4 inline-block mr-1" />
                          {profile.consultationFees}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>Contact Information</span>
                  </h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-muted-foreground">Phone Number</label>
                      <p className="text-foreground flex items-center space-x-2">
                        <Phone className="w-4 h-4" />
                        <span>{profile.contactNumber}</span>
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm text-muted-foreground">Address</label>
                      <p className="text-foreground flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{profile.address}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Documents */}
              <div className="pt-6 border-t border-border/50">
                <h4 className="font-semibold text-foreground flex items-center space-x-2 mb-4">
                  <FileText className="w-4 h-4" />
                  <span>Submitted Documents</span>
                </h4>
                
                <div className="space-y-4">
                  {profile.medicalDegreeUrl && (
                    <div className="flex items-center space-x-4 p-4 rounded-lg bg-accent/30 border border-border/30">
                      <div className="p-2 rounded-full bg-primary/20">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">Medical Degree</p>
                        <p className="text-sm text-muted-foreground">Medical qualification document</p>
                      </div>
                      <div className="flex space-x-2">
                        <EnhancedButton 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDocument(
                            profile.medicalDegreeUrl!, 
                            `${profile.firstName}-${profile.lastName}-degree`
                          )}
                          disabled={loadingDocuments[`${profile.firstName}-${profile.lastName}-degree`]}
                        >
                          {loadingDocuments[`${profile.firstName}-${profile.lastName}-degree`] ? (
                            <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                          ) : (
                            <Eye className="w-4 h-4 mr-2" />
                          )}
                          View
                        </EnhancedButton>
                        <EnhancedButton 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDownloadDocument(
                            profile.medicalDegreeUrl!, 
                            `${profile.firstName}-${profile.lastName}-degree`
                          )}
                          disabled={loadingDocuments[`${profile.firstName}-${profile.lastName}-degree`]}
                        >
                          <Download className="w-4 h-4" />
                        </EnhancedButton>
                      </div>
                    </div>
                  )}

                  {profile.governmentIdUrl && (
                    <div className="flex items-center space-x-4 p-4 rounded-lg bg-accent/30 border border-border/30">
                      <div className="p-2 rounded-full bg-primary/20">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">Government ID</p>
                        <p className="text-sm text-muted-foreground">Identity verification document</p>
                      </div>
                      <div className="flex space-x-2">
                        <EnhancedButton 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDocument(
                            profile.governmentIdUrl!, 
                            `${profile.firstName}-${profile.lastName}-id`
                          )}
                          disabled={loadingDocuments[`${profile.firstName}-${profile.lastName}-id`]}
                        >
                          {loadingDocuments[`${profile.firstName}-${profile.lastName}-id`] ? (
                            <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                          ) : (
                            <Eye className="w-4 h-4 mr-2" />
                          )}
                          View
                        </EnhancedButton>
                        <EnhancedButton 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDownloadDocument(
                            profile.governmentIdUrl!, 
                            `${profile.firstName}-${profile.lastName}-id`
                          )}
                          disabled={loadingDocuments[`${profile.firstName}-${profile.lastName}-id`]}
                        >
                          <Download className="w-4 h-4" />
                        </EnhancedButton>
                      </div>
                    </div>
                  )}

                  {profile.affiliationProofUrl && (
                    <div className="flex items-center space-x-4 p-4 rounded-lg bg-accent/30 border border-border/30">
                      <div className="p-2 rounded-full bg-primary/20">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">Affiliation Proof</p>
                        <p className="text-sm text-muted-foreground">Hospital/clinic affiliation document</p>
                      </div>
                      <div className="flex space-x-2">
                        <EnhancedButton 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDocument(
                            profile.affiliationProofUrl!, 
                            `${profile.firstName}-${profile.lastName}-affiliation`
                          )}
                          disabled={loadingDocuments[`${profile.firstName}-${profile.lastName}-affiliation`]}
                        >
                          {loadingDocuments[`${profile.firstName}-${profile.lastName}-affiliation`] ? (
                            <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                          ) : (
                            <Eye className="w-4 h-4 mr-2" />
                          )}
                          View
                        </EnhancedButton>
                        <EnhancedButton 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDownloadDocument(
                            profile.affiliationProofUrl!, 
                            `${profile.firstName}-${profile.lastName}-affiliation`
                          )}
                          disabled={loadingDocuments[`${profile.firstName}-${profile.lastName}-affiliation`]}
                        >
                          <Download className="w-4 h-4" />
                        </EnhancedButton>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-border/50">
                <EnhancedButton
                  variant="outline"
                  onClick={() => handleVerification(profile.id, false)}
                  disabled={processingId === profile.id}
                  className="border-destructive/20 text-destructive hover:bg-destructive/10"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Profile
                </EnhancedButton>
                
                <EnhancedButton
                  variant="default"
                  onClick={() => handleVerification(profile.id, true)}
                  disabled={processingId === profile.id}
                  className="bg-success hover:bg-success/90 text-success-foreground"
                >
                  {processingId === profile.id ? (
                    <div className="animate-spin w-4 h-4 border-2 border-success-foreground border-t-transparent rounded-full mr-2" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Approve Profile
                </EnhancedButton>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};