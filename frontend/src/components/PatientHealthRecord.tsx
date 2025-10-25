import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { healthRecordAPI } from '@/services/healthRecordApi';
import { PatientHealthRecord as HealthRecordType, HealthRecordSection } from '@/types/healthRecord';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, User, Activity, Heart, Shield, Upload } from 'lucide-react';

// Import section components
import { BasicDemographicsSection } from './health-sections/BasicDemographicsSection';
import { IdentificationSection } from './health-sections/IdentificationSection';
import { MedicalHistorySection } from './health-sections/MedicalHistorySection';
import { LifestyleSection } from './health-sections/LifestyleSection';
import { CurrentHealthSection } from './health-sections/CurrentHealthSection';
import { DocumentsSection } from './health-sections/DocumentsSection';
import { ConsentPreferencesSection } from './health-sections/ConsentPreferencesSection';

export const PatientHealthRecord: React.FC = () => {
  const { user } = useAuth();
  const { patientProfile } = useProfile();
  const { toast } = useToast();

  const [healthRecord, setHealthRecord] = useState<HealthRecordType | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingSections, setEditingSections] = useState<Set<HealthRecordSection>>(new Set());
  const [savingSection, setSavingSection] = useState<HealthRecordSection | null>(null);

  useEffect(() => {
    const fetchHealthRecord = async () => {
      if (!patientProfile?.id) return;

      try {
        setLoading(true);
        const record = await healthRecordAPI.getHealthRecord(patientProfile.id);
        setHealthRecord(record);
      } catch (error) {
        // If record doesn't exist, create a default one
        if (error.response?.status === 404) {
          try {
            const defaultRecord = createDefaultHealthRecord();
            const newRecord = await healthRecordAPI.createHealthRecord(defaultRecord);
            setHealthRecord(newRecord);
          } catch (createError) {
            console.error('Error creating health record:', createError);
            toast({
              title: "Error",
              description: "Failed to create health record",
              variant: "destructive",
            });
          }
        } else {
          console.error('Error fetching health record:', error);
          toast({
            title: "Error",
            description: "Failed to load health record",
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHealthRecord();
  }, [patientProfile?.id, toast]);

  const createDefaultHealthRecord = (): Omit<HealthRecordType, 'id' | 'createdAt' | 'updatedAt'> => {
    return {
      patientId: patientProfile?.id || '',
      basicDemographics: {
        fullName: `${patientProfile?.firstName || ''} ${patientProfile?.lastName || ''}`.trim(),
        gender: patientProfile?.gender || 'OTHER',
        dateOfBirth: patientProfile?.dateOfBirth || '',
        bloodGroup: 'O_POSITIVE',
        contactNumber: patientProfile?.contactNumber || '',
        email: user?.username || '',
        address: {
          street: '',
          city: '',
          state: '',
          pincode: ''
        },
        emergencyContact: patientProfile?.emergencyContact || '',
        maritalStatus: 'SINGLE',
        occupation: ''
      },
      identification: {
        patientId: patientProfile?.id || '',
        nationalId: patientProfile?.governmentIdNumber || '',
        insurancePolicyNumber: ''
      },
      medicalHistory: [],
      lifestyle: {
        smokingHabit: 'NEVER',
        alcoholHabit: 'NEVER',
        dietaryPreferences: 'VEGETARIAN',
        physicalActivityLevel: 'SEDENTARY',
        sleepHours: 8,
        stressLevel: 'LOW'
      },
      currentHealth: {
        weight: 0,
        height: 0,
        vitals: {
          bloodPressureSystolic: 120,
          bloodPressureDiastolic: 80,
          pulse: 72,
          temperature: 98.6,
          respiratoryRate: 16,
          oxygenSaturation: 98
        },
        medications: []
      },
      documents: [],
      consentPreferences: {
        dataSharingConsent: false,
        smsNotifications: true,
        emailNotifications: true,
        preferredLanguage: 'English',
        emergencyContactConsent: false,
        researchParticipation: false
      }
    };
  };

  const handleEditSection = (section: HealthRecordSection) => {
    setEditingSections(prev => new Set(prev).add(section));
  };

  const handleCancelEdit = (section: HealthRecordSection) => {
    setEditingSections(prev => {
      const newSet = new Set(prev);
      newSet.delete(section);
      return newSet;
    });
  };

  const handleSaveSection = async (section: HealthRecordSection, data) => {
    if (!healthRecord || !patientProfile?.id) return;

    try {
      setSavingSection(section);
      const updatedRecord = await healthRecordAPI.updateHealthRecordSection(
        patientProfile.id,
        section,
        data
      );
      setHealthRecord(updatedRecord);
      setEditingSections(prev => {
        const newSet = new Set(prev);
        newSet.delete(section);
        return newSet;
      });
      
      toast({
        title: "Success",
        description: "Health record updated successfully",
      });
    } catch (error) {
      console.error('Error updating health record:', error);
      toast({
        title: "Error",
        description: "Failed to update health record",
        variant: "destructive",
      });
    } finally {
      setSavingSection(null);
    }
  };

  const getSectionIcon = (section: HealthRecordSection) => {
    const iconMap = {
      basicDemographics: User,
      identification: FileText,
      medicalHistory: Activity,
      lifestyle: Heart,
      currentHealth: Activity,
      documents: Upload,
      consentPreferences: Shield
    };
    return iconMap[section];
  };

  const getSectionTitle = (section: HealthRecordSection) => {
    const titleMap = {
      basicDemographics: 'Basic Demographics',
      identification: 'Identification Details',
      medicalHistory: 'Medical History',
      lifestyle: 'Lifestyle Information',
      currentHealth: 'Current Health Data',
      documents: 'Documents',
      consentPreferences: 'Consent & Preferences'
    };
    return titleMap[section];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!healthRecord) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Health Record Not Found</h3>
            <p className="text-muted-foreground">Unable to load your health record.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 rounded-2xl p-6 border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Health Record</h1>
            <p className="text-muted-foreground">
              Comprehensive view of your medical information
            </p>
            {healthRecord.updatedAt && (
              <p className="text-sm text-muted-foreground mt-2">
                Last updated: {new Date(healthRecord.updatedAt).toLocaleDateString()}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              Active
            </Badge>
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        <BasicDemographicsSection
          data={healthRecord.basicDemographics}
          isEditing={editingSections.has('basicDemographics')}
          isSaving={savingSection === 'basicDemographics'}
          onEdit={() => handleEditSection('basicDemographics')}
          onCancel={() => handleCancelEdit('basicDemographics')}
          onSave={(data) => handleSaveSection('basicDemographics', data)}
        />

        <IdentificationSection
          data={healthRecord.identification}
          isEditing={editingSections.has('identification')}
          isSaving={savingSection === 'identification'}
          onEdit={() => handleEditSection('identification')}
          onCancel={() => handleCancelEdit('identification')}
          onSave={(data) => handleSaveSection('identification', data)}
        />

        <MedicalHistorySection
          data={healthRecord.medicalHistory}
          isEditing={editingSections.has('medicalHistory')}
          isSaving={savingSection === 'medicalHistory'}
          onEdit={() => handleEditSection('medicalHistory')}
          onCancel={() => handleCancelEdit('medicalHistory')}
          onSave={(data) => handleSaveSection('medicalHistory', data)}
          patientId={patientProfile?.id || ''}
        />

        <LifestyleSection
          data={healthRecord.lifestyle}
          isEditing={editingSections.has('lifestyle')}
          isSaving={savingSection === 'lifestyle'}
          onEdit={() => handleEditSection('lifestyle')}
          onCancel={() => handleCancelEdit('lifestyle')}
          onSave={(data) => handleSaveSection('lifestyle', data)}
        />

        <CurrentHealthSection
          data={healthRecord.currentHealth}
          isEditing={editingSections.has('currentHealth')}
          isSaving={savingSection === 'currentHealth'}
          onEdit={() => handleEditSection('currentHealth')}
          onCancel={() => handleCancelEdit('currentHealth')}
          onSave={(data) => handleSaveSection('currentHealth', data)}
          patientId={patientProfile?.id || ''}
        />

        <DocumentsSection
          data={healthRecord.documents}
          isSaving={savingSection === 'documents'}
          onSave={(data) => handleSaveSection('documents', data)}
          patientId={patientProfile?.id || ''}
        />

        <ConsentPreferencesSection
          data={healthRecord.consentPreferences}
          isEditing={editingSections.has('consentPreferences')}
          isSaving={savingSection === 'consentPreferences'}
          onEdit={() => handleEditSection('consentPreferences')}
          onCancel={() => handleCancelEdit('consentPreferences')}
          onSave={(data) => handleSaveSection('consentPreferences', data)}
        />
      </div>
    </div>
  );
};