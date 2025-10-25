import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock, User, MapPin, DollarSign, Languages, IndianRupee, Calendar as CalendarIcon, Star } from "lucide-react";
import { format, isToday } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { appointmentsAPI, slotsAPI, reviewsAPI } from "@/services/profileApi";
import { useProfile } from "@/hooks/useProfile";
import { DoctorProfile, TimeSlot, DoctorRating } from "@/types/user";
import { ProfileCompletionBanner } from "@/components/ProfileCompletionBanner";

// Move the utility function to a separate file or keep it in the same file but don't export it
const formatDateForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to check if a time slot is after current time
const isSlotAfterCurrentTime = (slot: TimeSlot): boolean => {
  const now = new Date();
  const [hours, minutes] = slot.timeFrom.split(':').map(Number);
  const slotTime = new Date();
  slotTime.setHours(hours, minutes, 0, 0);
  
  return slotTime > now;
};

export default function BookAppointment() {
  const { user } = useAuth();
  const { patientProfile, showProfileWarning } = useProfile();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [doctorRatings, setDoctorRatings] = useState<Record<string, DoctorRating>>({});
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date()); // Set today as default
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [filteredSlots, setFilteredSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [fetchingDoctors, setFetchingDoctors] = useState(true);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [bookingAppointment, setBookingAppointment] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle doctor selection and open modal
  const handleDoctorSelect = (doctor: DoctorProfile) => {
    setSelectedDoctor(doctor);
    setSelectedDate(new Date()); // Reset to today
    setSelectedSlot(null);
    setAvailableSlots([]);
    setFilteredSlots([]);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedDoctor(null);
    setSelectedDate(new Date());
    setSelectedSlot(null);
    setAvailableSlots([]);
    setFilteredSlots([]);
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchAvailableSlots();
    } else {
      setAvailableSlots([]);
      setFilteredSlots([]);
      setSelectedSlot(null);
    }
  }, [selectedDoctor, selectedDate]);

  // Filter slots based on current time when date is today
  useEffect(() => {
    if (availableSlots.length > 0 && selectedDate && isToday(selectedDate)) {
      const filtered = availableSlots.filter(isSlotAfterCurrentTime);
      setFilteredSlots(filtered);
    } else {
      setFilteredSlots(availableSlots);
    }
  }, [availableSlots, selectedDate]);

  const fetchDoctors = async () => {
    setFetchingDoctors(true);
    try {
      const approvedDoctors = await appointmentsAPI.getApprovedDoctors();
      setDoctors(approvedDoctors);
      
      // Fetch ratings for each doctor
      const ratings: Record<string, DoctorRating> = {};
      for (const doctor of approvedDoctors) {
        try {
          const rating = await reviewsAPI.getDoctorRating(doctor.id);
          ratings[doctor.id] = rating;
        } catch (error) {
          // If no rating exists yet, continue without error
          console.log(`No rating found for doctor ${doctor.id}`);
        }
      }
      setDoctorRatings(ratings);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast({
        title: "Error",
        description: "Failed to fetch doctors list.",
        variant: "destructive",
      });
    } finally {
      setFetchingDoctors(false);
    }
  };

  const fetchAvailableSlots = async () => {
    if (!selectedDoctor || !selectedDate) return;

    setFetchingSlots(true);
    try {
      const dateString = formatDateForAPI(selectedDate);
      const slots = await slotsAPI.getAvailableSlots(selectedDoctor.id, dateString);
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

  const handleBookAppointment = async () => {
    if (!selectedDoctor || !selectedSlot || !patientProfile) {
      return;
    }

    if (showProfileWarning()) {
      return;
    }

    setBookingAppointment(true);
    try {
      await appointmentsAPI.bookAppointment({
        patientId: patientProfile.id,
        doctorId: selectedDoctor.id,
        timeSlotId: selectedSlot.id,
      });

      toast({
        title: "Appointment booked successfully",
        description: "Your appointment request has been sent to the doctor for approval.",
      });

      // Reset selection and close modal
      handleModalClose();
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast({
        title: "Error",
        description: "Failed to book appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setBookingAppointment(false);
    }
  };

  const getDoctorInitials = (doctor: DoctorProfile) => {
    return `${doctor.firstName[0]}${doctor.lastName[0]}`.toUpperCase();
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  if (!patientProfile) {
    return (
      <div className="container mx-auto py-4 max-w-6xl">
        <ProfileCompletionBanner />
        <Card>
          <CardHeader>
            <CardTitle>Book Appointment</CardTitle>
            <CardDescription>
              Please complete your profile first to book appointments.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 max-w-6xl">
      <ProfileCompletionBanner />
      
      <div className="space-y-4">
        {/* Doctor Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select from our approved doctors</CardTitle>
            <CardDescription>Click on a doctor to book an appointment</CardDescription>
          </CardHeader>
          <CardContent>
            {fetchingDoctors ? (
              <div className="text-center py-4">Loading doctors...</div>
            ) : doctors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No approved doctors available at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {doctors.map((doctor) => (
                  <Card 
                    key={doctor.id} 
                    className="cursor-pointer transition-colors hover:border-primary/50 hover:shadow-md"
                    onClick={() => handleDoctorSelect(doctor)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-2">
                        <Avatar>
                          <AvatarImage src="/DefaultDoctor.png" alt="Doctor" />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getDoctorInitials(doctor)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">
                            Dr. {doctor.firstName} {doctor.lastName}
                          </h3>
                          <div className="space-y-1">
                            <Badge variant="secondary" className="text-xs">
                              {doctor.specialization}
                            </Badge>
                            
                            {/* Rating */}
                            {doctorRatings[doctor.id] && doctorRatings[doctor.id].averageRating != null && (
                              <div className="flex items-center gap-2">
                                {renderStars(doctorRatings[doctor.id].averageRating)}
                                <span className="text-xs text-muted-foreground">
                                  {doctorRatings[doctor.id].averageRating.toFixed(1)} 
                                  ({doctorRatings[doctor.id].totalReviews} reviews)
                                </span>
                              </div>
                            )}
                            
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="w-3 h-3 mr-1" />
                              {doctor.yearsOfExperience} years exp.
                            </div>
                            {doctor.consultationFees && (
                              <div className="flex items-center text-xs text-muted-foreground">
                                <IndianRupee className="w-3 h-3 mr-1" />
                                {doctor.consultationFees}
                              </div>
                            )}
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Languages className="w-3 h-3 mr-1" />
                              {Array.isArray(doctor.languagesSpoken) 
                                ? doctor.languagesSpoken.slice(0, 2).join(', ')
                                : doctor.languagesSpoken
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Book Appointment</DialogTitle>
              <DialogDescription>
                {selectedDoctor && `Book an appointment with Dr. ${selectedDoctor.firstName} ${selectedDoctor.lastName}`}
              </DialogDescription>
            </DialogHeader>
            
            {selectedDoctor && (
              <div className="space-y-6">
                {/* Doctor Info */}
                <div className="flex items-start space-x-4 p-4 bg-muted rounded-lg">
                  <Avatar>
                    <AvatarImage src="/DefaultDoctor.png" alt="Doctor" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getDoctorInitials(selectedDoctor)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedDoctor.specialization}
                    </p>
                    {selectedDoctor.consultationFees && (
                      <div className="flex items-center text-sm mt-1">
                        <IndianRupee className="w-4 h-4" />
                        <span className="ml-1">{selectedDoctor.consultationFees}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Date and Time Selection - Separate Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Side - Date Selection Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Select Date</CardTitle>
                      <CardDescription>Choose your preferred appointment date</CardDescription>
                    </CardHeader>
                    <CardContent>
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

                  {/* Right Side - Time Slot Selection Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Select Time Slot</CardTitle>
                      <CardDescription>
                        {selectedDate ? `Available slots for ${format(selectedDate, "PPP")}` : 'Select a date to view available slots'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {!selectedDate ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Please select a date first</p>
                        </div>
                      ) : fetchingSlots ? (
                        <div className="text-center py-4">Loading available slots...</div>
                      ) : filteredSlots.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>No available slots for this date.</p>
                          <p className="text-sm">Please select a different date.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-80 overflow-y-auto p-2">
                          {filteredSlots.map((slot) => (
                            <Button
                              key={slot.id}
                              variant={selectedSlot?.id === slot.id ? "default" : "outline"}
                              className="h-10 justify-center px-4 py-2 text-sm font-medium transition-all duration-200 hover:scale-105"
                              onClick={() => setSelectedSlot(slot)}
                            >
                              <Clock className="w-4 h-4 mr-1 flex-shrink-0" />
                              <span>{slot.timeFrom} - {slot.timeTo}</span>
                            </Button>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Booking Confirmation */}
                {selectedSlot && (
                  <div className="space-y-4">
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <h4 className="font-medium mb-2">Appointment Summary</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {format(selectedDate, "PPP")}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          {selectedSlot.timeFrom} - {selectedSlot.timeTo}
                        </div>
                      </div>
                    </div>
                    
                    
                    <div className="flex space-x-3">
                      <Button 
                        variant="outline" 
                        onClick={handleModalClose}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleBookAppointment} 
                        disabled={bookingAppointment}
                        className="flex-1"
                      >
                        {bookingAppointment ? "Booking..." : "Confirm Booking"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}