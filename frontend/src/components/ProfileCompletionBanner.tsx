import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";

export const ProfileCompletionBanner = () => {
  const { user } = useAuth();
  const { isProfileComplete, doctorProfile, patientProfile, isPending, isRejected } = useProfile();
  const navigate = useNavigate();

  // Don't show banner if no user OR if profile is complete AND approved
  if (!user || isProfileComplete) return null;

  const handleCompleteProfile = () => {
    if (user.role === 'DOCTOR') {
      navigate('/doctor/profile');
    } else if (user.role === 'PATIENT') {
      navigate('/patient/profile');
    }
  };

  const getAlertMessage = () => {
    if (user.role === 'DOCTOR' && isPending) {
      return "Your doctor profile is pending admin approval. You cannot create time slots until approved.";
    }
    if (user.role === 'DOCTOR' && isRejected) {
      return "Your doctor profile was rejected. Please update your information and resubmit.";
    }
    if (user.role === 'PATIENT' && isPending) {
      return "Your patient profile is pending admin approval. You cannot book appointments until approved.";
    }
    if (user.role === 'PATIENT' && isRejected) {
      return "Your patient profile was rejected. Please update your information and resubmit.";
    }
    if (!isProfileComplete) {
      return "Please complete your profile to access all features.";
    }
    
  };

  return (
    <Alert className="mb-6 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-orange-800 dark:text-orange-200">
          {getAlertMessage()}
        </span>
        {!isProfileComplete && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleCompleteProfile}
            className="ml-4 border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-300"
          >
            Complete Profile
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};