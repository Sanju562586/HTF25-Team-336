import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { appointmentsAPI } from "@/services/profileApi";
import { Appointment } from "@/types/user";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CancelAppointmentModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onCancelSuccess: () => void;
}

export function CancelAppointmentModal({ 
  appointment, 
  isOpen, 
  onClose, 
  onCancelSuccess 
}: CancelAppointmentModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleCancelAppointment = async () => {
    if (!appointment) return;

    setIsLoading(true);
    try {
      await appointmentsAPI.deleteAppointment(appointment.id);
      onCancelSuccess();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast({
        title: "Error",
        description: "Failed to cancel appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!appointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            Cancel Appointment
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this pending appointment? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>
              This appointment will be permanently deleted from the system.
            </AlertDescription>
          </Alert>
          
          <div className="bg-muted p-4 rounded-lg">
            <p className="font-medium">
              {appointment.doctorName} - {appointment.specialization}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(appointment.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
            <p className="text-sm text-muted-foreground">
              Time: {appointment.timeFrom} - {appointment.timeTo}
            </p>
            <p className="text-sm text-muted-foreground">
              Status: <span className="font-medium">Pending</span>
            </p>
          </div>
        </div>
        
        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isLoading}
            className="flex-1"
          >
            Keep Appointment
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleCancelAppointment} 
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? "Deleting..." : "Cancel Appointment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}