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
import { CalendarIcon, Upload, FileText, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { profileAPI } from "@/services/profileApi";
import { useProfile } from "@/hooks/useProfile";
import { Badge } from "@/components/ui/badge";
import { EnhancedButton } from "@/components/ui/enhanced-button";

const doctorProfileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
  }),
  contactNumber: z.string().min(10, "Contact number must be at least 10 digits"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  specialization: z.string().min(1, "Please select a specialization"),
  yearsOfExperience: z.number().min(0, "Years of experience must be positive"),
  department: z.string().min(1, "Department is required"),
  consultationFees: z.number().optional(),
  languagesSpoken: z.string().min(1, "Please specify languages spoken"),
  licenseNumber: z.string().min(1, "License number is required"),
  governmentIdNumber: z.string().min(1, "Government ID number is required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

type DoctorProfileForm = z.infer<typeof doctorProfileSchema>;

const specializations = [
  "Cardiologist", "Dermatologist", "Neurologist", "Orthopedic", "Pediatrician",
  "Psychiatrist", "Radiologist", "Surgeon", "Urologist", "Gynecologist", "Oncologist"
];
  interface DoctorProfileFormProps {
    initialData?: DoctorProfileForm;
    onSuccess?: (profile: DoctorProfileForm) => void;
    locationFromMap?: { lat: number; lng: number } | null; // NEW
    hideLocationFields?: boolean;                            // NEW
  }

export default function DoctorProfileForm({ initialData, onSuccess, locationFromMap = null,
  hideLocationFields = true }: DoctorProfileFormProps = {}) {
  const { user } = useAuth();
  const { doctorProfile, refetchProfile, loading: profileLoading } = useProfile();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState({
    medicalDegree: null as File | null,
    governmentId: null as File | null,
    affiliationProof: null as File | null,
  });


  const form = useForm<DoctorProfileForm>({
    resolver: zodResolver(doctorProfileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      gender: "MALE",
      dateOfBirth: undefined,
      contactNumber: "",
      address: "",
      specialization: "",
      department: "",
      yearsOfExperience: 0,
      consultationFees: undefined,
      languagesSpoken: "",
      licenseNumber: "",
      governmentIdNumber: "",
      latitude: undefined,
      longitude: undefined,
    },
  });

  // Update form when profile data loads
  useEffect(() => {
    if (doctorProfile) {
      const resetData = {
        firstName: doctorProfile.firstName || "",
        lastName: doctorProfile.lastName || "",
        gender: doctorProfile.gender || "MALE",
        dateOfBirth: doctorProfile.dateOfBirth ? new Date(doctorProfile.dateOfBirth) : new Date(),
        contactNumber: doctorProfile.contactNumber || "",
        address: doctorProfile.address || "",
        specialization: Array.isArray(doctorProfile.specialization) && doctorProfile.specialization.length > 0 
          ? doctorProfile.specialization[0] 
          : "",
        department: doctorProfile.department || "",
        yearsOfExperience: doctorProfile.yearsOfExperience || 0,
        consultationFees: doctorProfile.consultationFees || undefined,
        languagesSpoken: Array.isArray(doctorProfile.languagesSpoken) 
          ? doctorProfile.languagesSpoken.join(", ") 
          : typeof doctorProfile.languagesSpoken === 'string'
          ? doctorProfile.languagesSpoken
          : "",
        licenseNumber: doctorProfile.licenseNumber || "",
        governmentIdNumber: doctorProfile.governmentIdNumber || "",
        latitude: doctorProfile.latitude ?? undefined,
        longitude: doctorProfile.longitude ?? undefined,
      };
      
      form.reset(resetData);
    }
  }, [doctorProfile, form]);
   useEffect(() => {
    if (locationFromMap) {
      form.setValue("latitude", locationFromMap.lat, { shouldValidate: true, shouldDirty: true });
      form.setValue("longitude", locationFromMap.lng, { shouldValidate: true, shouldDirty: true });
    }
  }, [locationFromMap, form]); // NEW

  const handleFileUpload = (documentType: keyof typeof documents) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      setDocuments(prev => ({ ...prev, [documentType]: file }));
    }
  };

  const onSubmit = async (data: DoctorProfileForm) => {
    if (!user) return;

    setLoading(true);
    try {
      let medicalDegreeUrl = doctorProfile?.medicalDegreeUrl;
      let governmentIdUrl = doctorProfile?.governmentIdUrl;
      let affiliationProofUrl = doctorProfile?.affiliationProofUrl;

      // Upload documents if new files are selected
      if (documents.medicalDegree) {
        const result = await profileAPI.uploadDocument(documents.medicalDegree, 'medical_degree');
        medicalDegreeUrl = result.url;
      }

      if (documents.governmentId) {
        const result = await profileAPI.uploadDocument(documents.governmentId, 'government_id');
        governmentIdUrl = result.url;
      }

      if (documents.affiliationProof) {
        const result = await profileAPI.uploadDocument(documents.affiliationProof, 'affiliation_proof');
        affiliationProofUrl = result.url;
      }

      const profileData = {
        user: user,
        userId: user.username,
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth.toISOString().split('T')[0],
        contactNumber: data.contactNumber,
        address: data.address,
        specialization: [data.specialization],
        department: data.department,
        yearsOfExperience: data.yearsOfExperience,
        consultationFees: data.consultationFees,
        languagesSpoken: data.languagesSpoken 
          ? data.languagesSpoken.split(',').map(lang => lang.trim()).filter(lang => lang !== '')
          : [],
        licenseNumber: data.licenseNumber,
        governmentIdNumber: data.governmentIdNumber,
        medicalDegreeUrl,
        governmentIdUrl,
        affiliationProofUrl,
        latitude: data.latitude,
        longitude: data.longitude,
      };

      if (doctorProfile) {
        await profileAPI.updateDoctorProfile(doctorProfile.id, profileData);
      } else {
        await profileAPI.createDoctorProfile(profileData);
      }

      await refetchProfile();
      toast({
        title: "Profile saved successfully",
        description: "Your doctor profile has been submitted for approval.",
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

  const getStatusBadge = () => {
    if (!doctorProfile) return null;
    
    const statusConfig = {
      PENDING: { variant: "secondary" as const, icon: FileText, text: "Pending Approval" },
      APPROVED: { variant: "default" as const, icon: CheckCircle, text: "Approved" },
      REJECTED: { variant: "destructive" as const, icon: XCircle, text: "Rejected" },
    };

    const config = statusConfig[doctorProfile.status as keyof typeof statusConfig] || statusConfig.PENDING;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="mb-4">
        <Icon className="w-3 h-3 mr-1" />
        {config.text}
      </Badge>
    );
  };

  if (profileLoading) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Doctor Profile</CardTitle>
          <CardDescription>
            Complete your professional profile to start creating time slots and accepting appointments.
          </CardDescription>
          {getStatusBadge()}
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Details Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Basic Details</h3>
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
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
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
              </div>

              {/* Professional Details Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Professional Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="specialization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specialization</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select specialization" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {specializations.map((spec) => (
                              <SelectItem key={spec} value={spec}>
                                {spec}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your department" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="yearsOfExperience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years of Experience</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Enter years of experience" 
                            value={field.value}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="consultationFees"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Consultation Fees (Optional)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Enter consultation fees" 
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="languagesSpoken"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Languages Spoken</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., English, Hindi, Tamil" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="licenseNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medical Council Registration Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your registration number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude (optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            placeholder="e.g. 12.971599"
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                          />
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
                        <FormLabel>Longitude (optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="any"
                            placeholder="e.g. 77.594566"
                            value={field.value ?? ''}
                            onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Document Upload Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Document Upload</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Medical Degree Certificate *</label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileUpload('medicalDegree')}
                        className="hidden"
                        id="medical-degree"
                      />
                      <label
                        htmlFor="medical-degree"
                        className="flex items-center space-x-2 px-4 py-2 border border-input rounded-md cursor-pointer hover:bg-accent"
                      >
                        <Upload className="w-4 h-4" />
                        <span className="text-sm">
                          {documents.medicalDegree ? documents.medicalDegree.name : 'Choose file'}
                        </span>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Government ID Proof *</label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileUpload('governmentId')}
                        className="hidden"
                        id="government-id"
                      />
                      <label
                        htmlFor="government-id"
                        className="flex items-center space-x-2 px-4 py-2 border border-input rounded-md cursor-pointer hover:bg-accent"
                      >
                        <Upload className="w-4 h-4" />
                        <span className="text-sm">
                          {documents.governmentId ? documents.governmentId.name : 'Choose file'}
                        </span>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Clinic/Hospital Affiliation (Optional)</label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileUpload('affiliationProof')}
                        className="hidden"
                        id="affiliation-proof"
                      />
                      <label
                        htmlFor="affiliation-proof"
                        className="flex items-center space-x-2 px-4 py-2 border border-input rounded-md cursor-pointer hover:bg-accent"
                      >
                        <Upload className="w-4 h-4" />
                        <span className="text-sm">
                          {documents.affiliationProof ? documents.affiliationProof.name : 'Choose file'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4">
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
                  {loading ? "Saving..." : doctorProfile ? "Update Profile" : "Submit Profile"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}