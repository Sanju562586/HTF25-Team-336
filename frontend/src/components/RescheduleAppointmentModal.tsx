import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, CalendarIcon, AlertTriangle, User } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { slotsAPI, appointmentsAPI } from '@/services/profileApi';
import { Appointment, TimeSlot } from '@/types/user';

interface RescheduleAppointmentModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onRescheduleSuccess: () => void;
}

// Helper function to check if a time slot is after current time
const isSlotAfterCurrentTime = (slot: TimeSlot): boolean => {
  const now = new Date();
  const [hours, minutes] = slot.timeFrom.split(':').map(Number);
  const slotTime = new Date();
  slotTime.setHours(hours, minutes, 0, 0);
  
  return slotTime > now;
};

// Helper function to format date for API
const formatDateForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const RescheduleAppointmentModal: React.FC<RescheduleAppointmentModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onRescheduleSuccess
}) => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [filteredSlots, setFilteredSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);

  useEffect(() => {
    if (appointment && selectedDate) {
      fetchAvailableSlots();
    } else {
      setAvailableSlots([]);
      setFilteredSlots([]);
      setSelectedSlot(null);
    }
  }, [appointment, selectedDate]);

  // Filter slots based on current time when date is today
  useEffect(() => {
    if (availableSlots.length > 0 && selectedDate && isToday(selectedDate)) {
      const filtered = availableSlots.filter(isSlotAfterCurrentTime);
      setFilteredSlots(filtered);
    } else {
      setFilteredSlots(availableSlots);
    }
  }, [availableSlots, selectedDate]);

  const fetchAvailableSlots = async () => {
    if (!appointment || !selectedDate) return;

    setFetchingSlots(true);
    try {
      const dateString = formatDateForAPI(selectedDate);
      const slots = await slotsAPI.getAvailableSlots(appointment.doctorId, dateString);
      setAvailableSlots(slots);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      toast({
        title: "Error",
        description: "Failed to fetch available time slots.",
        variant: "destructive",
      });
    } finally {
      setFetchingSlots(false);
    }
  };

  const handleReschedule = async () => {
    if (!appointment || !selectedSlot) return;

    setRescheduling(true);
    try {
      await appointmentsAPI.rescheduleAppointment(appointment.id, {
        newTimeSlotId: selectedSlot.id,
        newDate: formatDateForAPI(selectedDate!),
        newTimeFrom: selectedSlot.timeFrom,
        newTimeTo: selectedSlot.timeTo
      });

      toast({
        title: "Appointment Rescheduled",
        description: "Your appointment has been successfully rescheduled.",
      });

      onRescheduleSuccess();
      onClose();
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      toast({
        title: "Error",
        description: "Failed to reschedule appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRescheduling(false);
    }
  };

  const resetModal = () => {
    setSelectedDate(new Date());
    setSelectedSlot(null);
    setAvailableSlots([]);
    setFilteredSlots([]);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!appointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Important Notice */}
          <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                    Important Notice
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    <strong>Note:</strong> Rescheduling can be done only once and must be done at least 2 hours before the current appointment time.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Appointment Details */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3">Current Appointment</h4>
              <div className="flex items-start space-x-4 p-4 bg-muted rounded-lg">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{appointment.doctorName}</h3>
                  <p className="text-sm text-muted-foreground">{appointment.specialization}</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center text-sm">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      <span>{appointment.date}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{appointment.timeFrom} - {appointment.timeTo}</span>
                    </div>
                    <Badge variant={appointment.status === 'APPROVED' ? 'default' : 'secondary'}>
                      {appointment.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date Selection */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3">Select New Date</h4>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="pointer-events-auto"
                />
              </div>
            </CardContent>
          </Card>

          {/* Time Slot Selection */}
          {selectedDate && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3">
                  Select New Time Slot
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Available slots on {format(selectedDate, "PPP")}
                  {isToday(selectedDate) && " (showing only future time slots)"}
                </p>
                
                {fetchingSlots ? (
                  <div className="text-center py-4">Loading available slots...</div>
                ) : filteredSlots.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-semibold">
                      {isToday(selectedDate) ? "No available slots for today" : "All slots booked"}
                    </p>
                    <p className="text-sm">Please try selecting a different date.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {filteredSlots.map((slot) => (
                      <Button
                        key={slot.id}
                        variant={selectedSlot?.id === slot.id ? "default" : "outline"}
                        className="justify-center"
                        onClick={() => setSelectedSlot(slot)}
                      >
                        {slot.timeFrom} - {slot.timeTo}
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleReschedule}
              disabled={!selectedSlot || rescheduling}
            >
              {rescheduling ? "Rescheduling..." : "Confirm Reschedule"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};