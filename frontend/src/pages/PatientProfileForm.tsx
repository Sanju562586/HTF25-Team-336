import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, CalendarIcon, Upload, User } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { profileAPI } from "@/services/profileApi";
import { useProfile } from "@/hooks/useProfile";
import { PatientProfile } from "@/types/user";
import { EnhancedButton } from "@/components/ui/enhanced-button";

interface PatientProfileFormProps {
  initialData?: PatientProfile;
  onSuccess?: (profile: PatientProfile) => void;
  locationFromMap?: { lat: number; lng: number } | null; // NEW
  hideLocationFields?: boolean;                            // NEW
}

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const patientProfileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
  }),
  contactNumber: z.string().min(10, "Contact number must be at least 10 digits"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  emergencyContact: z.string().optional(),
  governmentIdNumber: z.string().min(1, "Government ID number is required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

type PatientProfileForm = z.infer<typeof patientProfileSchema>;

export default function PatientProfileForm({ initialData, onSuccess, locationFromMap = null,
  hideLocationFields = true }: PatientProfileFormProps = {}) {
  const { user } = useAuth();
  const { patientProfile, refetchProfile } = useProfile();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [governmentIdFile, setGovernmentIdFile] = useState<File | null>(null);

  // Use initialData if provided, otherwise use patientProfile from context
  const profileData = initialData || patientProfile;

  const form = useForm<PatientProfileForm>({
    resolver: zodResolver(patientProfileSchema),
    defaultValues: profileData ? {
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      gender: profileData.gender,
      dateOfBirth: new Date(profileData.dateOfBirth),
      contactNumber: profileData.contactNumber,
      address: profileData.address,
      emergencyContact: profileData.emergencyContact,
      governmentIdNumber: profileData.governmentIdNumber,
      latitude: profileData.latitude ?? undefined,
      longitude: profileData.longitude ?? undefined,
    } : {},
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setGovernmentIdFile(file);
    }
  };

  const onSubmit = async (data: PatientProfileForm) => {
    if (!user) return;

    setLoading(true);
    try {
      let governmentIdUrl = profileData?.governmentIdUrl;

      // Upload government ID if new file is selected
      if (governmentIdFile) {
        const result = await profileAPI.uploadDocument(governmentIdFile, 'government_id');
        governmentIdUrl = result.url;
      }

      const profilePayload = {
        userId: user.username,
        user,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        dateOfBirth: formatDate(data.dateOfBirth),
        contactNumber: data.contactNumber,
        address: data.address,
        emergencyContact: data.emergencyContact,
        governmentIdNumber: data.governmentIdNumber,
        governmentIdUrl,
        status: profileData?.status || 'PENDING',
        latitude: data.latitude,
        longitude: data.longitude,
      };

      let result;
      if (profileData) {
        result = await profileAPI.updatePatientProfile(profileData.id, profilePayload);
      } else {
        result = await profileAPI.createPatientProfile(profilePayload);
      }

      if (onSuccess) {
        onSuccess(result);
      } else {
        await refetchProfile();
      }

      toast({
        title: "Profile saved successfully",
        description: profileData 
          ? "Your patient profile has been updated." 
          : "Your profile has been created and submitted for verification.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (locationFromMap) {
      form.setValue("latitude", locationFromMap.lat, { shouldValidate: true, shouldDirty: true });
      form.setValue("longitude", locationFromMap.lng, { shouldValidate: true, shouldDirty: true });
    }
  }, [locationFromMap, form]); // NEW
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Patient Profile</CardTitle>
          <CardDescription>
            Complete your profile to start booking appointments with doctors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Personal Details Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Personal Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your first name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="MALE">Male</SelectItem>
                            <SelectItem value="FEMALE">Female</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => {
                      const years = Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => 1900 + i).reverse();
                      const months = [
                        "January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"
                      ];

                      const selectedDate = field.value ? new Date(field.value) : null;
                      const selectedYear = selectedDate?.getFullYear() || "";
                      const selectedMonth = selectedDate ? selectedDate.getMonth() : "";
                      const selectedDay = selectedDate?.getDate() || "";

                      // Days in month
                      const daysInMonth = selectedYear && selectedMonth !== "" 
                        ? new Date(Number(selectedYear), Number(selectedMonth) + 1, 0).getDate()
                        : 31;

                      return (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <div className="grid grid-cols-3 gap-2">
                            {/* Year Select */}
                            <Select
                              value={selectedYear.toString()}
                              onValueChange={(val) => {
                                const year = Number(val);
                                const month = selectedMonth === "" ? 0 : Number(selectedMonth);
                                const day = selectedDay || 1;
                                field.onChange(new Date(year, month, day));
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Year" />
                              </SelectTrigger>
                              <SelectContent className="max-h-60">
                                {years.map((year) => (
                                  <SelectItem key={year} value={year.toString()}>
                                    {year}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {/* Month Select */}
                            <Select
                              value={selectedMonth.toString()}
                              onValueChange={(val) => {
                                const month = Number(val);
                                const year = selectedYear || new Date().getFullYear();
                                const day = selectedDay || 1;
                                field.onChange(new Date(year, month, day));
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Month" />
                              </SelectTrigger>
                              <SelectContent>
                                {months.map((m, index) => (
                                  <SelectItem key={index} value={index.toString()}>
                                    {m}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            {/* Day Select */}
                            <Select
                              value={selectedDay.toString()}
                              onValueChange={(val) => {
                                const day = Number(val);
                                const year = selectedYear || new Date().getFullYear();
                                const month = selectedMonth === "" ? 0 : Number(selectedMonth);
                                field.onChange(new Date(year, month, day));
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Day" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                                  <SelectItem key={d} value={d.toString()}>
                                    {d}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="contactNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your contact number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emergencyContact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emergency Contact (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter emergency contact number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter your complete address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="governmentIdNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Government ID Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your Aadhaar/Passport number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Replace your latitude/longitude FormFields block */}
                  {!hideLocationFields ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="latitude"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Latitude</FormLabel>
                            <FormControl>
                              <Input type="number" step="any" value={field.value ?? ''} disabled readOnly />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="longitude"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Longitude</FormLabel>
                            <FormControl>
                              <Input type="number" step="any" value={field.value ?? ''} disabled readOnly />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ) : null}

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Government ID Upload</label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="government-id-file"
                      />
                      <label
                        htmlFor="government-id-file"
                        className="flex items-center space-x-2 px-4 py-2 border border-input rounded-md cursor-pointer hover:bg-accent flex-1"
                      >
                        <Upload className="w-4 h-4" />
                        <span className="text-sm">
                          {governmentIdFile ? governmentIdFile.name : 'Choose file'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <EnhancedButton 
                variant="glass" 
                size="lg"
                onClick={() => window.history.back()}
                className="w-full md:w-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </EnhancedButton>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Saving..." : profileData ? "Update Profile" : "Save Profile"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}