import React, { useState } from 'react';
import { PatientProfile } from '@/types/user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { profileAPI } from '@/services/profileApi'; 
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PatientProfileForm from '@/pages/PatientProfileForm';
import { useToast } from '@/hooks/use-toast';
import { 
  User, Phone, MapPin, Calendar, FileText, 
  Shield, AlertCircle, CheckCircle, Edit,
  Download,
  Eye
} from 'lucide-react'

interface PatientProfileDisplayProps {
  profile: PatientProfile | null;
  loading: boolean;
  onProfileUpdate: (profile: PatientProfile) => void;
  isEditing?: boolean;
  onEditToggle?: (editing: boolean) => void;
}

export const PatientProfileDisplay: React.FC<PatientProfileDisplayProps> = ({
  profile,
  loading,
  onProfileUpdate,
  isEditing = false,
  onEditToggle
}) => {

  const [loadingDocument, setLoadingDocument] = useState(false);
  const { toast } = useToast();

  // Add document handling functions
  const handleViewDocument = async (filename: string) => {
    try {
      setLoadingDocument(true);
      const documentBlob = await profileAPI.getPatientDocument(filename);
      const blobUrl = URL.createObjectURL(documentBlob);
      window.open(blobUrl, '_blank');
    } catch (error) {
      console.error('Failed to fetch document:', error);
      toast({
        title: "Error Opening Document",
        description: "Could not retrieve the document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoadingDocument(false);
    }
  };

  const handleDownloadDocument = async (filename: string) => {
    try {
      setLoadingDocument(true);
      const documentBlob = await profileAPI.getPatientDocument(filename);
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
      setLoadingDocument(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  // Show form if editing OR if no profile exists OR if profile exists but is incomplete
  if (isEditing || !profile || !profile.isProfileComplete) {
    return (
      <div className="space-y-6">
        {!isEditing && (
          <Card className="shadow-card border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-warning" />
                <span>Complete Your Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Please complete your profile to book appointments and access all features.
              </p>
            </CardContent>
          </Card>
        )}
        
        {isEditing && (
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Edit Profile</h3>
            <EnhancedButton 
              variant="ghost" 
              onClick={() => onEditToggle && onEditToggle(false)}
            >
              Cancel
            </EnhancedButton>
          </div>
        )}
        
        <PatientProfileForm 
          initialData={profile}
          onSuccess={(updatedProfile) => {
            onProfileUpdate(updatedProfile);
            if (onEditToggle) {
              onEditToggle(false);
            }
          }}
        />
      </div>
    );
  }

  const getVerificationBadge = () => {
    if (profile.status === 'APPROVED') {
      return (
        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
          <CheckCircle className="w-3 h-3 mr-1" />
          Verified
        </Badge>
      );
    } else if (profile.status === 'PENDING') {
      return (
        <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
          <AlertCircle className="w-3 h-3 mr-1" />
          Pending Verification
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
          <AlertCircle className="w-3 h-3 mr-1" />
          Please Update Your Profile Information
        </Badge>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="shadow-card border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5 text-primary" />
              <span>Patient Profile</span>
            </CardTitle>
            <div className="flex items-center space-x-3">
              {getVerificationBadge()}
              <EnhancedButton 
                variant="outline" 
                size="sm"
                onClick={() => onEditToggle && onEditToggle(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </EnhancedButton>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
                    {profile.firstName} {profile.lastName}
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
              </div>
            </div>
            
            {/* Contact Information */}
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
                {typeof profile.latitude === 'number' && typeof profile.longitude === 'number' && (
                  <div>
                    <label className="text-sm text-muted-foreground">Location (Lat / Long)</label>
                    <p className="text-foreground">{profile.latitude.toFixed(6)} / {profile.longitude.toFixed(6)}</p>
                  </div>
                )}
                
                {profile.emergencyContact && (
                  <div>
                    <label className="text-sm text-muted-foreground">Emergency Contact</label>
                    <p className="text-foreground">{profile.emergencyContact}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Documents */}
          {profile.governmentIdUrl && (
            <div className="mt-6 pt-6 border-t border-border/50">
              <h4 className="font-semibold text-foreground flex items-center space-x-2 mb-4">
                <FileText className="w-4 h-4" />
                <span>Documents</span>
              </h4>
              
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
                    onClick={() => handleViewDocument(profile.governmentIdUrl)}
                    disabled={loadingDocument}
                  >
                    {loadingDocument ? (
                      <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                    ) : (
                      <Eye className="w-4 h-4 mr-2" />
                    )}
                    View Document
                  </EnhancedButton>
                  <EnhancedButton 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDownloadDocument(profile.governmentIdUrl)}
                    disabled={loadingDocument}
                  >
                    {loadingDocument ? (
                      <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </EnhancedButton>
                </div>
              </div>
            </div>
          )}
          
          {/* Verification Status */}
          {profile && (profile.status === 'PENDING' || profile.status === 'REJECTED') && (
            <div className="mt-6 pt-6 border-t border-border/50">
              <div className="flex items-start space-x-4 p-4 rounded-lg bg-warning/10 border border-warning/20">
                <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                <div>
                  {profile.status === 'PENDING' && (
                    <>
                      <h4 className="font-medium text-foreground">Profile Verification Pending</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your profile is currently under review by our admin team. Once verified, you'll be able to book appointments.
                      </p>
                    </>
                  )}
                  
                  {profile.status === 'REJECTED' && (
                    <>
                      <h4 className="font-medium text-foreground">Profile Verification Rejected</h4>
                      <p className="text-sm text-destructive mt-1">
                        Your profile was rejected. Please update your information and documents.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};