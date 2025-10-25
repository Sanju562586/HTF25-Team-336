import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { profileAPI } from '@/services/profileApi';
import { DoctorProfile, PatientProfile } from '@/types/user';
import { useToast } from '@/hooks/use-toast';

// Define a proper error type
interface ApiError {
  response?: {
    status: number;
    data?: unknown;
  };
  message?: string;
}

export const useProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      console.log('useProfile - No user found');
      return;
    }

    console.log('useProfile - Fetching profile for user:', user);
    setLoading(true);
    setError(null);

    try {
      if (user.role === 'DOCTOR') {
        console.log('useProfile - Fetching doctor profile');
        const profile = await profileAPI.getDoctorProfile(user.username);
        console.log('useProfile - Doctor profile fetched:', profile);
        setDoctorProfile(profile);
      } else if (user.role === 'PATIENT') {
        console.log('useProfile - Fetching patient profile');
        const profile = await profileAPI.getPatientProfile(user.username);
        console.log('useProfile - Patient profile fetched:', profile);
        setPatientProfile(profile);
      }
    } catch (err) {
      const error = err as ApiError;
      console.error('useProfile - Error fetching profile:', error);
      setError('Failed to fetch profile');
      
      // Don't show toast for 404 errors (profile not created yet)
      if (error.response?.status !== 404) {
        toast({
          title: "Error",
          description: "Failed to load profile information",
          variant: "destructive",
        });
      }
    } finally {
      console.log('useProfile - Setting loading to false');
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user, fetchProfile]);

  const isProfileComplete = () => {
    if (user?.role === 'DOCTOR') {
      return doctorProfile?.isProfileComplete || false;
    } else if (user?.role === 'PATIENT') {
      // Check both the profile completeness flag AND if we have basic profile data
      return (patientProfile?.isProfileComplete || false) && 
             !!patientProfile?.firstName && 
             !!patientProfile?.lastName;
    }
    return false;
  };

  const isApproved = () => {
    if (user?.role === 'DOCTOR') {
      return doctorProfile?.status === 'APPROVED';
    } else if (user?.role === 'PATIENT') {
      // Patients also need approval based on your entity structure
      return patientProfile?.status === 'APPROVED';
    }
    return false;
  };

  const isPending = () => {
    if (user?.role === 'DOCTOR') {
      return doctorProfile?.status === 'PENDING';
    } else if (user?.role === 'PATIENT') {
      return patientProfile?.status === 'PENDING';
    }
    return false;
  };

  const isRejected = () => {
    if (user?.role === 'DOCTOR') {
      return doctorProfile?.status === 'REJECTED';
    } else if (user?.role === 'PATIENT') {
      return patientProfile?.status === 'REJECTED';
    }
    return false;
  };

  const showProfileWarning = () => {
    if (!isProfileComplete()) {
      toast({
        title: "Profile Incomplete",
        description: "Please complete your profile before proceeding.",
        variant: "destructive",
      });
      return true;
    }

    if (isPending()) {
      toast({
        title: "Profile Pending Approval",
        description: "Your profile is pending approval from admin.",
        variant: "default",
      });
      return true;
    }

    if (isRejected()) {
      toast({
        title: "Profile Rejected",
        description: "Your profile was rejected. Please update your information.",
        variant: "destructive",
      });
      return true;
    }

    return false;
  };

  // Helper to check if user can book appointments
  const canBookAppointments = () => {
    return isProfileComplete() && isApproved();
  };

  return {
    doctorProfile,
    patientProfile,
    loading,
    error,
    isProfileComplete: isProfileComplete(),
    isApproved: isApproved(),
    isPending: isPending(),
    isRejected: isRejected(),
    canBookAppointments: canBookAppointments(),
    showProfileWarning,
    refetchProfile: fetchProfile,
  };
};