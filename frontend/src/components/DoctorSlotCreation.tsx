import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { slotsAPI } from "@/services/profileApi";
import { useProfile } from "@/hooks/useProfile";
import { TimeSlot } from "@/types/user";
import { ProfileCompletionBanner } from "@/components/ProfileCompletionBanner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const slotSchema = z.object({
  date: z.date({
    required_error: "Date is required",
  }),
  timeFrom: z.string().min(1, "Start time is required"),
  timeTo: z.string().min(1, "End time is required"),
  duration: z.number().min(15, "Duration must be at least 15 minutes").max(120, "Duration cannot exceed 120 minutes"),
}).refine((data) => {
  const [fromHour, fromMin] = data.timeFrom.split(':').map(Number);
  const [toHour, toMin] = data.timeTo.split(':').map(Number);
  const fromMinutes = fromHour * 60 + fromMin;
  const toMinutes = toHour * 60 + toMin;
  return fromMinutes < toMinutes;
}, {
  message: "End time must be after start time",
  path: ["timeTo"],
});

type SlotForm = z.infer<typeof slotSchema>;

export const DoctorSlotCreation = () => {
  const { user } = useAuth();
  const { doctorProfile, showProfileWarning, isApproved } = useProfile();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [fetchingSlots, setFetchingSlots] = useState(true);
  const [previousTimeFrom, setPreviousTimeFrom] = useState('');
  const [previousTimeTo, setPreviousTimeTo] = useState('');

  // Get tomorrow's date and current time for defaults
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const form = useForm<SlotForm>({
    resolver: zodResolver(slotSchema),
    defaultValues: {
      date: getTomorrowDate(),
      timeFrom: getCurrentTime(),
      duration: 30 // Default to 30 minutes
    }
  });

  useEffect(() => {
    if (doctorProfile && isApproved) {
      fetchSlots();
    }
  }, [doctorProfile, isApproved]);

  const fetchSlots = async () => {
    if (!doctorProfile) return;

    setFetchingSlots(true);
    try {
      const doctorSlots = await slotsAPI.getDoctorSlots(doctorProfile.id);
      setSlots(doctorSlots);
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your time slots.",
        variant: "destructive",
      });
    } finally {
      setFetchingSlots(false);
    }
  };

  // Function to format date as YYYY-MM-DD in local timezone (not UTC)
  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const onSubmit = async (data: SlotForm) => {
    if (!doctorProfile) return;

    if (showProfileWarning && showProfileWarning()) {
      return;
    }

    setLoading(true);
    try {
      // Prepare the slot request data for backend with proper local date format
      const slotRequest = {
        doctorId: doctorProfile.id,
        date: formatLocalDate(data.date), // Use local date format, not UTC
        timeFrom: data.timeFrom,
        timeTo: data.timeTo,
        duration: data.duration,
        // Send timezone information to backend
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };

      // Send the request to backend which will handle slot generation
      await slotsAPI.createTimeSlots(slotRequest);
      
      toast({
        title: "Time slots created",
        description: `Time slots have been successfully created.`,
      });

      form.reset({
        date: getTomorrowDate(),
        timeFrom: getCurrentTime(),
        duration: data.duration // Keep the same duration for next creation
      });
      fetchSlots();
    } catch (error) {
      console.error('Error creating slots:', error);
      toast({
        title: "Error",
        description: "Failed to create time slots. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    try {
      await slotsAPI.deleteTimeSlot(slotId);
      toast({
        title: "Time slot deleted",
        description: "The time slot has been successfully deleted.",
      });
      fetchSlots();
    } catch (error) {
      console.error('Error deleting slot:', error);
      toast({
        title: "Error",
        description: "Failed to delete time slot. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to format date for display (adjusts for timezone issues)
  const formatDisplayDate = (dateString: string): string => {
    try {
      // Parse the date string as local time (not UTC)
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      
      return format(date, "PPP");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  if (!doctorProfile) {
    return (
      <div className="animate-fade-in">
        <ProfileCompletionBanner />
        <Card>
          <CardHeader>
            <CardTitle>Time Slot Management</CardTitle>
            <CardDescription>
              Please complete your profile first to create time slots.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <ProfileCompletionBanner />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create Time Slot Form */}
        <Card className="shadow-card border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Create Time Slots</span>
            </CardTitle>
            <CardDescription>
              Set your availability time range and choose the duration for each slot.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date <= new Date(new Date().setHours(0, 0, 0, 0))}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="timeFrom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Available From</FormLabel>
                        <FormControl>
                          <Input 
                            type="time" 
                            {...field}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              field.onChange(e);
                              
                              // Check if minutes were just selected (time format: HH:MM)
                              if (newValue && previousTimeFrom) {
                                const [prevHour, prevMin] = previousTimeFrom.split(':');
                                const [newHour, newMin] = newValue.split(':');
                                
                                // If hour stayed same but minute changed, or if both hour and minute are set
                                if ((prevHour === newHour && prevMin !== newMin) || 
                                    (newHour && newMin && newMin !== '00')) {
                                  e.target.blur();
                                }
                              }
                              
                              setPreviousTimeFrom(newValue);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="timeTo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Available Until</FormLabel>
                        <FormControl>
                          <Input 
                            type="time" 
                            {...field}
                            onChange={(e) => {
                              const newValue = e.target.value;
                              field.onChange(e);
                              
                              // Check if minutes were just selected (time format: HH:MM)
                              if (newValue && previousTimeTo) {
                                const [prevHour, prevMin] = previousTimeTo.split(':');
                                const [newHour, newMin] = newValue.split(':');
                                
                                // If hour stayed same but minute changed, or if both hour and minute are set
                                if ((prevHour === newHour && prevMin !== newMin) || 
                                    (newHour && newMin && newMin !== '00')) {
                                  e.target.blur();
                                }
                              }
                              
                              setPreviousTimeTo(newValue);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slot Duration (minutes)</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="15">15 minutes</SelectItem>
                          <SelectItem value="30">30 minutes</SelectItem>
                          <SelectItem value="45">45 minutes</SelectItem>
                          <SelectItem value="60">60 minutes</SelectItem>
                          <SelectItem value="90">90 minutes</SelectItem>
                          <SelectItem value="120">120 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-accent/30 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 inline mr-1" />
                    We'll automatically create slots of the selected duration within your availability window.
                  </p>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading || !isApproved} 
                  className="w-full"
                >
                  {loading ? "Creating Slots..." : "Create Time Slots"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Available Slots List */}
        <Card className="shadow-card border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Your Time Slots</CardTitle>
            <CardDescription>
              Manage your created time slots.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {fetchingSlots ? (
              <div className="text-center py-4">Loading slots...</div>
            ) : slots.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No time slots created yet.</p>
                <p className="text-sm">Create your first time slots to get started.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {slots.map((slot) => {
                      const [fromHour, fromMin] = slot.timeFrom.split(':').map(Number);
                      const [toHour, toMin] = slot.timeTo.split(':').map(Number);
                      const duration = (toHour * 60 + toMin) - (fromHour * 60 + fromMin);
                      
                      return (
                        <TableRow key={slot.id}>
                          <TableCell>{formatDisplayDate(slot.date)}</TableCell>
                          <TableCell>{slot.timeFrom} - {slot.timeTo}</TableCell>
                          <TableCell>{duration} minutes</TableCell>
                          <TableCell>
                            <Badge variant={slot.isAvailable ? "secondary" : "outline"}>
                              {slot.isAvailable ? "Available" : "Booked"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSlot(slot.id)}
                              disabled={!slot.isAvailable}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
