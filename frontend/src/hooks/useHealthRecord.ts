import { useState, useEffect } from 'react';
import { PatientHealthRecord } from '@/types/healthRecord';
import { healthRecordAPI } from '@/services/healthRecordApi';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';

export const useHealthRecord = () => {
  const { user } = useAuth();
  const { patientProfile } = useProfile();
  const [healthRecord, setHealthRecord] = useState<PatientHealthRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthRecord = async () => {
    if (!user || user.role !== 'PATIENT' || !patientProfile?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const record = await healthRecordAPI.getHealthRecord(patientProfile.id);
      setHealthRecord(record);
    } catch (err) {
      // If record doesn't exist, create a default one
      if (err.response?.status === 404) {
        try {
          const defaultRecord = createDefaultHealthRecord();
          const newRecord = await healthRecordAPI.createHealthRecord(defaultRecord);
          setHealthRecord(newRecord);
        } catch (createError) {
          console.error('Error creating health record:', createError);
          setError('Failed to create health record');
        }
      } else {
        console.error('Error fetching health record:', err);
        setError('Failed to load health record');
      }
    } finally {
      setLoading(false);
    }
  };

  const createDefaultHealthRecord = (): Omit<PatientHealthRecord, 'id' | 'createdAt' | 'updatedAt'> => {
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

  useEffect(() => {
    fetchHealthRecord();
  }, [user, patientProfile?.id]);

  // Auto-refresh every 1 minute when user is logged in
  useEffect(() => {
    if (!user || user.role !== 'PATIENT' || !patientProfile?.id) {
      return;
    }

    const interval = setInterval(() => {
      fetchHealthRecord();
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, [user, patientProfile?.id]);

  // Helper functions to extract dashboard metrics
  const getActiveMedications = () => {
    if (!healthRecord?.currentHealth?.medications) return 0;
    return healthRecord.currentHealth.medications.filter(med => med.isActive).length;
  };

  const getTotalDocuments = () => {
    if (!healthRecord?.documents) return 0;
    return healthRecord.documents.length;
  };

  const getHealthScore = () => {
    if (!healthRecord) return 0;
    
    let score = 0;
    let maxScore = 0;

    // Basic demographics completeness (20 points)
    maxScore += 20;
    if (healthRecord.basicDemographics?.fullName) score += 5;
    if (healthRecord.basicDemographics?.bloodGroup) score += 5;
    if (healthRecord.basicDemographics?.emergencyContact) score += 5;
    if (healthRecord.basicDemographics?.occupation) score += 5;

    // Medical history (20 points)
    maxScore += 20;
    if (healthRecord.medicalHistory?.length > 0) score += 20;

    // Current health data (30 points)
    maxScore += 30;
    if (healthRecord.currentHealth?.weight > 0) score += 10;
    if (healthRecord.currentHealth?.height > 0) score += 10;
    if (healthRecord.currentHealth?.vitals) score += 10;

    // Lifestyle information (20 points)
    maxScore += 20;
    if (healthRecord.lifestyle) score += 20;

    // Documents (10 points)
    maxScore += 10;
    if (healthRecord.documents?.length > 0) score += 10;

    return Math.round((score / maxScore) * 100);
  };

  const getHealthStatus = () => {
    const score = getHealthScore();
    if (score >= 80) return { status: 'Excellent', color: 'success' };
    if (score >= 60) return { status: 'Good', color: 'primary' };
    if (score >= 40) return { status: 'Fair', color: 'warning' };
    return { status: 'Needs Attention', color: 'destructive' };
  };

  const getBMI = () => {
    if (!healthRecord?.currentHealth?.weight || !healthRecord?.currentHealth?.height) return null;
    const weight = healthRecord.currentHealth.weight;
    const height = healthRecord.currentHealth.height / 100; // Convert cm to m
    return Math.round((weight / (height * height)) * 10) / 10;
  };

  const getBMICategory = (bmi: number | null) => {
    if (!bmi) return 'Unknown';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  return {
    healthRecord,
    loading,
    error,
    refetch: fetchHealthRecord,
    // Dashboard metrics
    activeMedications: getActiveMedications(),
    totalDocuments: getTotalDocuments(),
    healthScore: getHealthScore(),
    healthStatus: getHealthStatus(),
    bmi: getBMI(),
    bmiCategory: getBMICategory(getBMI())
  };
};
