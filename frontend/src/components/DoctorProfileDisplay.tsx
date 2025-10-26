import React, { useState, useRef, useEffect } from 'react';
import { DoctorProfile } from '@/types/user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { profileAPI } from '@/services/profileApi'; 
import { EnhancedButton } from '@/components/ui/enhanced-button';
import DoctorProfileForm from '@/pages/DoctorProfileForm';
import { useToast } from '@/hooks/use-toast';
import { 
  User, Phone, MapPin, Calendar, FileText, 
  Shield, AlertCircle, CheckCircle, Edit,
  Download, Eye, Stethoscope, DollarSign,
  IndianRupee
} from 'lucide-react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface DoctorProfileDisplayProps {
  profile: DoctorProfile | null;
  loading: boolean;
  onProfileUpdate: (profile: DoctorProfile) => void;
  isEditing?: boolean;
  onEditToggle?: (editing: boolean) => void;
}

export const DoctorProfileDisplay: React.FC<DoctorProfileDisplayProps> = ({
  profile,
  loading,
  onProfileUpdate,
  isEditing = false,
  onEditToggle
}) => {
  const [loadingDocument, setLoadingDocument] = useState(false);
  const { toast } = useToast();

  const [editPosition, setEditPosition] = useState<{ lat: number; lng: number } | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  // Map initialization for EDIT mode
useEffect(() => {
  if (!isEditing) {
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    markerRef.current = null;
    return;
  }

  const initial = (profile?.latitude != null && profile?.longitude != null)
    ? { lat: Number(profile.latitude), lng: Number(profile.longitude) } // <-- ensure number
    : null;
  setEditPosition(initial);

  if (!mapContainerRef.current || mapRef.current) return;

  const map = new maplibregl.Map({
    container: mapContainerRef.current,
    style: 'https://demotiles.maplibre.org/style.json',
    center: [initial?.lng ?? 78, initial?.lat ?? 20],
    zoom: initial ? 12 : 5
  });
  mapRef.current = map;

  if (initial) {
    markerRef.current = new maplibregl.Marker({ draggable: true })
      .setLngLat([initial.lng, initial.lat])
      .addTo(map)
      .on('dragend', () => {
        const p = markerRef.current!.getLngLat();
        setEditPosition({ lat: p.lat, lng: p.lng });
      });
  }

  // Map click to update marker
  map.on('click', (e) => {
    if (!markerRef.current) {
      markerRef.current = new maplibregl.Marker({ draggable: true })
        .setLngLat(e.lngLat)
        .addTo(map)
        .on('dragend', () => {
          const p = markerRef.current!.getLngLat();
          setEditPosition({ lat: p.lat, lng: p.lng });
        });
    } else {
      markerRef.current.setLngLat(e.lngLat);
    }
    setEditPosition({ lat: e.lngLat.lat, lng: e.lngLat.lng });
  });

  return () => {
    if (mapRef.current) mapRef.current.remove();
    markerRef.current = null;
  };
}, [isEditing, profile?.latitude, profile?.longitude]);

  // Profile completeness check
  const isProfileComplete = profile &&
    profile.firstName &&
    profile.lastName &&
    profile.gender &&
    profile.dateOfBirth &&
    profile.contactNumber &&
    profile.address &&
    profile.specialization &&
    profile.specialization.length > 0 &&
    profile.department &&
    profile.yearsOfExperience !== undefined &&
    profile.licenseNumber &&
    profile.governmentIdNumber &&
    profile.medicalDegreeUrl;

  // Document handling
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
      const cleanFilename = filename.replace('/uploads/', '');
      link.download = cleanFilename;
      document.body.appendChild(link);
      link.click();
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

  if (isEditing || !profile || !isProfileComplete) {
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
                Please complete your profile to start managing appointments and accessing all features.
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

        {/* Map Picker */}
        <Card className="shadow-card border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-primary" />
              <span>Pick Location</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div ref={mapContainerRef} className="w-full h-64 rounded-lg border border-border/30" />
              <p className="text-sm text-muted-foreground">
                {editPosition
                  ? `Selected: ${editPosition.lat.toFixed(6)} / ${editPosition.lng.toFixed(6)}`
                  : 'Click on the map to set your location, then drag the marker to fine-tune.'}
              </p>
            </div>
          </CardContent>
        </Card>

        <DoctorProfileForm
          hideLocationFields
          locationFromMap={editPosition} 
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
      {/* Profile Card */}
      <Card className="shadow-card border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Stethoscope className="w-5 h-5 text-primary" />
              <span>Doctor Profile</span>
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
          {/* Personal & Professional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal */}
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
                  <label className="text-sm text-muted-foreground">Medical License</label>
                  <p className="text-foreground">{profile.licenseNumber}</p>
                </div>
              </div>
            </div>

            {/* Professional */}
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground flex items-center space-x-2">
                <Stethoscope className="w-4 h-4" />
                <span>Professional Information</span>
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-muted-foreground">Specialization</label>
                  <p className="text-foreground">{Array.isArray(profile.specialization) ? profile.specialization.join(', ') : profile.specialization}</p>
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
                  <p className="text-foreground">{Array.isArray(profile.languagesSpoken) ? profile.languagesSpoken.join(', ') : profile.languagesSpoken}</p>
                </div>
                {profile.consultationFees && (
                  <div>
                    <label className="text-sm text-muted-foreground">Consultation Fees</label>
                    <p className="text-foreground flex items-center space-x-2">
                      <IndianRupee className="w-4 h-4" />
                      <span>{profile.consultationFees}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="mt-6 pt-6 border-t border-border/50">
            <h4 className="font-semibold text-foreground flex items-center space-x-2 mb-4">
              <Phone className="w-4 h-4" />
              <span>Contact Information</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>
          </div>

          {/* Documents */}
          <div className="mt-6 pt-6 border-t border-border/50">
            <h4 className="font-semibold text-foreground flex items-center space-x-2 mb-4">
              <FileText className="w-4 h-4" />
              <span>Documents</span>
            </h4>
            <div className="space-y-4">
              {['medicalDegreeUrl', 'governmentIdUrl', 'affiliationProofUrl'].map((docKey) => {
                const docNameMap: Record<string, string> = {
                  medicalDegreeUrl: 'Medical Degree',
                  governmentIdUrl: 'Government ID',
                  affiliationProofUrl: 'Affiliation Proof',
                };
                const docDescMap: Record<string, string> = {
                  medicalDegreeUrl: 'Medical qualification document',
                  governmentIdUrl: 'Identity verification document',
                  affiliationProofUrl: 'Hospital/clinic affiliation document',
                };
                const url = (profile as any)[docKey];
                if (!url) return null;
                return (
                  <div key={docKey} className="flex items-center space-x-4 p-4 rounded-lg bg-accent/30 border border-border/30">
                    <div className="p-2 rounded-full bg-primary/20">
                      <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{docNameMap[docKey]}</p>
                      <p className="text-sm text-muted-foreground">{docDescMap[docKey]}</p>
                    </div>
                    <div className="flex space-x-2">
                      <EnhancedButton 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDocument(url)}
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
                        onClick={() => handleDownloadDocument(url)}
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
                );
              })}
            </div>
          </div>

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
                        Your profile is currently under review by our admin team. Once verified, you'll be able to manage appointments and slots.
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
