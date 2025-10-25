import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, MapPin, Clock, Phone, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useProfile } from '@/hooks/useProfile';
import { emergencyAPI } from '@/services/emergencyApi';
import { CreateEmergencyRequest } from '@/types/emergency';

interface EmergencyRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EmergencyRequestModal: React.FC<EmergencyRequestModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { toast } = useToast();
  const { patientProfile } = useProfile();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateEmergencyRequest>({
    patientId: '',
    symptoms: '',
    urgencyLevel: 'MEDIUM',
    location: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientProfile) {
      toast({
        title: "Profile Required",
        description: "Please complete your patient profile first.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.symptoms.trim() || !formData.location.trim()) {
      toast({
        title: "Required Fields",
        description: "Please fill in symptoms and location.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        ...formData,
        patientId: patientProfile.id.toString()
      };
      await emergencyAPI.createEmergencyRequest(requestData);
      
      toast({
        title: "Emergency Request Sent",
        description: "Your emergency request has been broadcast to available doctors.",
        variant: "default",
      });
      
      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        patientId: '',
        symptoms: '',
        urgencyLevel: 'MEDIUM',
        location: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error creating emergency request:', error);
      toast({
        title: "Error",
        description: "Failed to send emergency request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <span>Emergency Request</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Emergency Alert</p>
              <p className="text-xs text-red-600 mt-1">
                This request will be broadcast to all available doctors in your area.
                Use only for genuine medical emergencies.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="symptoms" className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Describe Your Condition</span>
            </Label>
            <Textarea
              id="symptoms"
              placeholder="Describe your symptoms and current condition..."
              value={formData.symptoms}
              onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
              className="min-h-[80px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="urgency" className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Urgency Level *</span>
            </Label>
            <Select
              value={formData.urgencyLevel}
              onValueChange={(value: 'HIGH' | 'MEDIUM' | 'LOW') => 
                setFormData(prev => ({ ...prev, urgencyLevel: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HIGH">
                  <div className="flex items-center space-x-2">
                    <Badge className={getUrgencyColor('HIGH')}>HIGH</Badge>
                    <span>Life-threatening emergency</span>
                  </div>
                </SelectItem>
                <SelectItem value="MEDIUM">
                  <div className="flex items-center space-x-2">
                    <Badge className={getUrgencyColor('MEDIUM')}>MEDIUM</Badge>
                    <span>Urgent medical attention needed</span>
                  </div>
                </SelectItem>
                <SelectItem value="LOW">
                  <div className="flex items-center space-x-2">
                    <Badge className={getUrgencyColor('LOW')}>LOW</Badge>
                    <span>Non-urgent consultation</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <span>Current Location *</span>
            </Label>
            <Input
              id="location"
              placeholder="Your current address or landmark..."
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information for the doctor..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="min-h-[60px]"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Sending...</span>
                </div>
              ) : (
                'Send Emergency Request'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};