import React, { useState, useEffect } from 'react';
import { DoctorProfile, PatientProfile } from '@/types/user';
import { profileAPI } from '@/services/profileApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  User, Phone, MapPin, Calendar, FileText, 
  Shield, CheckCircle, XCircle, Eye, AlertCircle, Download, Stethoscope,
  IndianRupee, Search, ChevronLeft, ChevronRight, Users
} from 'lucide-react';

type UserProfile = DoctorProfile | PatientProfile;

interface EnhancedUserVerificationProps {
  userType: 'doctors' | 'patients';
}

export const EnhancedUserVerification: React.FC<EnhancedUserVerificationProps> = ({ userType }) => {
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [loadingDocuments, setLoadingDocuments] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();

  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    loadPendingProfiles();
  }, [userType]);

  useEffect(() => {
    // Filter profiles based on search term
    const filtered = allProfiles.filter(profile => {
      const fullName = `${profile.firstName} ${profile.lastName}`.toLowerCase();
      const email = profile.user?.username?.toLowerCase() || '';
      const searchLower = searchTerm.toLowerCase();
      
      return fullName.includes(searchLower) || 
             email.includes(searchLower) ||
             (userType === 'doctors' && (profile as DoctorProfile).specialization?.toString().toLowerCase().includes(searchLower)) ||
             (userType === 'doctors' && (profile as DoctorProfile).department?.toLowerCase().includes(searchLower));
    });
    
    setFilteredProfiles(filtered);
    setCurrentPage(1); // Reset to first page when searching
  }, [searchTerm, allProfiles, userType]);

  const loadPendingProfiles = async () => {
    try {
      setLoading(true);
      let profiles;
      if (userType === 'doctors') {
        profiles = await profileAPI.getPendingDoctorProfiles();
      } else {
        profiles = await profileAPI.getPendingPatientProfiles();
      }
      setAllProfiles(profiles);
      setFilteredProfiles(profiles);
    } catch (error) {
      toast({
        title: "No Pending Profiles",
        description: `No pending ${userType} profiles found.`,
        variant: "success",
      });
      setAllProfiles([]);
      setFilteredProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (profileId: string, isVerified: boolean) => {
    try {
      setProcessingId(profileId);
      
      if (userType === 'doctors') {
        await profileAPI.verifyDoctorProfile(profileId, isVerified);
      } else {
        await profileAPI.verifyPatientProfile(profileId, isVerified);
      }
      
      // Remove from lists
      setAllProfiles(prev => prev.filter(p => p.id !== profileId));
      setFilteredProfiles(prev => prev.filter(p => p.id !== profileId));
      
      // Close modal
      setShowModal(false);
      setSelectedProfile(null);
      
      toast({
        title: isVerified ? "Profile Approved" : "Profile Rejected",
        description: `${userType.slice(0, -1)} profile has been ${isVerified ? 'approved' : 'rejected'}.`,
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
      
      const documentBlob = await profileAPI.getPatientDocument(filename);
      const blobUrl = URL.createObjectURL(documentBlob);
      
      // Open document in a popup window with specific dimensions
      const popupFeatures = 'width=900,height=700,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no';
      const popup = window.open(blobUrl, `document_${profileName}`, popupFeatures);
      
      // Focus the popup window
      if (popup) {
        popup.focus();
      }
      
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
      setLoadingDocuments(prev => ({ ...prev, [profileName]: false }));
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredProfiles.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProfiles = filteredProfiles.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading pending {userType} profiles...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground">
            {userType === 'doctors' ? 'Doctor' : 'Patient'} Verification
          </h2>
          <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
            {filteredProfiles.length} pending
          </Badge>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${userType}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* User List */}
      {currentProfiles.length === 0 ? (
        <Card className="shadow-card border-border/50 bg-card/80 backdrop-blur-sm">
          <CardContent className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {searchTerm ? 'No Results Found' : 'All Caught Up!'}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm 
                ? `No ${userType} found matching "${searchTerm}"`
                : `No ${userType} profiles pending verification.`
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {currentProfiles.map((profile) => (
            <Card key={profile.id} className="shadow-card border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      {userType === 'doctors' ? (
                        <Stethoscope className="w-6 h-6 text-primary" />
                      ) : (
                        <User className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">
                        {userType === 'doctors' ? 'Dr. ' : ''}{profile.firstName} {profile.lastName}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center space-x-1">
                          <Phone className="w-3 h-3" />
                          <span>{profile.contactNumber}</span>
                        </span>
                        {userType === 'doctors' && (
                          <span className="flex items-center space-x-1">
                            <Stethoscope className="w-3 h-3" />
                            <span>{(profile as DoctorProfile).specialization}</span>
                          </span>
                        )}
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(profile.dateOfBirth).toLocaleDateString()}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                    
                    <EnhancedButton
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedProfile(profile);
                        setShowModal(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </EnhancedButton>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredProfiles.length)} of {filteredProfiles.length} results
          </p>
          
          <div className="flex items-center space-x-2">
            <EnhancedButton
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </EnhancedButton>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <EnhancedButton
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => goToPage(page)}
                className="w-8 h-8 p-0"
              >
                {page}
              </EnhancedButton>
            ))}
            
            <EnhancedButton
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </EnhancedButton>
          </div>
        </div>
      )}

      {/* Verification Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {userType === 'doctors' ? (
                <Stethoscope className="w-5 h-5 text-primary" />
              ) : (
                <User className="w-5 h-5 text-primary" />
              )}
              <span>
                {userType === 'doctors' ? 'Dr. ' : ''}{selectedProfile?.firstName} {selectedProfile?.lastName} - Profile Verification
              </span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedProfile && (
            <div className="space-y-6">
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
                        {userType === 'doctors' ? 'Dr. ' : ''}{selectedProfile.firstName} {selectedProfile.lastName}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm text-muted-foreground">Gender</label>
                      <p className="text-foreground">{selectedProfile.gender}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm text-muted-foreground">Date of Birth</label>
                      <p className="text-foreground flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(selectedProfile.dateOfBirth).toLocaleDateString()}</span>
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm text-muted-foreground">Government ID</label>
                      <p className="text-foreground">{selectedProfile.governmentIdNumber}</p>
                    </div>
                    
                    {userType === 'doctors' && (selectedProfile as DoctorProfile).licenseNumber && (
                      <div>
                        <label className="text-sm text-muted-foreground">License Number</label>
                        <p className="text-foreground">{(selectedProfile as DoctorProfile).licenseNumber}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Professional/Contact Information */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground flex items-center space-x-2">
                    {userType === 'doctors' ? (
                      <Stethoscope className="w-4 h-4" />
                    ) : (
                      <Phone className="w-4 h-4" />
                    )}
                    <span>{userType === 'doctors' ? 'Professional' : 'Contact'} Information</span>
                  </h4>
                  
                  <div className="space-y-3">
                    {userType === 'doctors' ? (
                      <>
                        <div>
                          <label className="text-sm text-muted-foreground">Specialization</label>
                          <p className="text-foreground">
                            {Array.isArray((selectedProfile as DoctorProfile).specialization) 
                              ? (selectedProfile as DoctorProfile).specialization.join(', ')
                              : (selectedProfile as DoctorProfile).specialization}
                          </p>
                        </div>
                        
                        <div>
                          <label className="text-sm text-muted-foreground">Department</label>
                          <p className="text-foreground">{(selectedProfile as DoctorProfile).department}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm text-muted-foreground">Years of Experience</label>
                          <p className="text-foreground">{(selectedProfile as DoctorProfile).yearsOfExperience} years</p>
                        </div>
                        
                        {(selectedProfile as DoctorProfile).consultationFees && (
                          <div>
                            <label className="text-sm text-muted-foreground">Consultation Fees</label>
                            <p className="text-foreground">
                              <IndianRupee className="w-4 h-4 inline-block mr-1" />
                              {(selectedProfile as DoctorProfile).consultationFees}
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="text-sm text-muted-foreground">Phone Number</label>
                          <p className="text-foreground flex items-center space-x-2">
                            <Phone className="w-4 h-4" />
                            <span>{selectedProfile.contactNumber}</span>
                          </p>
                        </div>
                        
                        {(selectedProfile as PatientProfile).emergencyContact && (
                          <div>
                            <label className="text-sm text-muted-foreground">Emergency Contact</label>
                            <p className="text-foreground">{(selectedProfile as PatientProfile).emergencyContact}</p>
                          </div>
                        )}
                      </>
                    )}
                    
                    <div>
                      <label className="text-sm text-muted-foreground">Address</label>
                      <p className="text-foreground flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{selectedProfile.address}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div className="pt-6 border-t border-border/50">
                <h4 className="font-semibold text-foreground flex items-center space-x-2 mb-4">
                  <FileText className="w-4 h-4" />
                  <span>Submitted Documents</span>
                </h4>
                
                <div className="space-y-4">
                  {/* Government ID Document */}
                  {selectedProfile.governmentIdUrl && (
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
                            selectedProfile.governmentIdUrl!, 
                            `${selectedProfile.firstName}-${selectedProfile.lastName}-id`
                          )}
                          disabled={loadingDocuments[`${selectedProfile.firstName}-${selectedProfile.lastName}-id`]}
                        >
                          {loadingDocuments[`${selectedProfile.firstName}-${selectedProfile.lastName}-id`] ? (
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
                            selectedProfile.governmentIdUrl!, 
                            `${selectedProfile.firstName}-${selectedProfile.lastName}-id`
                          )}
                          disabled={loadingDocuments[`${selectedProfile.firstName}-${selectedProfile.lastName}-id`]}
                        >
                          <Download className="w-4 h-4" />
                        </EnhancedButton>
                      </div>
                    </div>
                  )}

                  {/* Doctor-specific documents */}
                  {userType === 'doctors' && (
                    <>
                      {(selectedProfile as DoctorProfile).medicalDegreeUrl && (
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
                                (selectedProfile as DoctorProfile).medicalDegreeUrl!, 
                                `${selectedProfile.firstName}-${selectedProfile.lastName}-degree`
                              )}
                              disabled={loadingDocuments[`${selectedProfile.firstName}-${selectedProfile.lastName}-degree`]}
                            >
                              {loadingDocuments[`${selectedProfile.firstName}-${selectedProfile.lastName}-degree`] ? (
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
                                (selectedProfile as DoctorProfile).medicalDegreeUrl!, 
                                `${selectedProfile.firstName}-${selectedProfile.lastName}-degree`
                              )}
                              disabled={loadingDocuments[`${selectedProfile.firstName}-${selectedProfile.lastName}-degree`]}
                            >
                              <Download className="w-4 h-4" />
                            </EnhancedButton>
                          </div>
                        </div>
                      )}

                      {(selectedProfile as DoctorProfile).affiliationProofUrl && (
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
                                (selectedProfile as DoctorProfile).affiliationProofUrl!, 
                                `${selectedProfile.firstName}-${selectedProfile.lastName}-affiliation`
                              )}
                              disabled={loadingDocuments[`${selectedProfile.firstName}-${selectedProfile.lastName}-affiliation`]}
                            >
                              {loadingDocuments[`${selectedProfile.firstName}-${selectedProfile.lastName}-affiliation`] ? (
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
                                (selectedProfile as DoctorProfile).affiliationProofUrl!, 
                                `${selectedProfile.firstName}-${selectedProfile.lastName}-affiliation`
                              )}
                              disabled={loadingDocuments[`${selectedProfile.firstName}-${selectedProfile.lastName}-affiliation`]}
                            >
                              <Download className="w-4 h-4" />
                            </EnhancedButton>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-border/50">
                <EnhancedButton
                  variant="outline"
                  onClick={() => handleVerification(selectedProfile.id, false)}
                  disabled={processingId === selectedProfile.id}
                  className="border-destructive/20 text-destructive hover:bg-destructive/10"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Profile
                </EnhancedButton>
                
                <EnhancedButton
                  variant="default"
                  onClick={() => handleVerification(selectedProfile.id, true)}
                  disabled={processingId === selectedProfile.id}
                  className="bg-success hover:bg-success/90 text-success-foreground"
                >
                  {processingId === selectedProfile.id ? (
                    <div className="animate-spin w-4 h-4 border-2 border-success-foreground border-t-transparent rounded-full mr-2" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Approve Profile
                </EnhancedButton>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
