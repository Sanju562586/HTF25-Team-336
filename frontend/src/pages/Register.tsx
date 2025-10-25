import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { authAPI } from '@/services/api';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, User, Mail, UserCheck, ArrowLeft, Stethoscope } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export type UserRole = 'ADMIN' | 'DOCTOR' | 'PATIENT';

const Register = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: undefined as UserRole,
    password: ''
  });
  const [error, setError] = useState('');

  // Check if user is admin
  React.useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/login');
    }
  }, [user, navigate]);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.role) {
      setError('Please select a role');
      setLoading(false);
      return;
    }

    // Generate random password automatically
    const randomPassword = generateRandomPassword();

    try {
      await authAPI.register({
        name: formData.name,
        email: formData.email,
        password: randomPassword,
        role: formData.role
      });

      toast({
        title: "User Registered Successfully",
        description: `${formData.name} has been registered as ${formData.role.toLowerCase()} with a randomly generated password.`,
      });

      // Reset form
      setFormData({ name: '', email: '', password: '', role: user?.role || undefined });

      // Navigate back to admin dashboard
      navigate('/admin-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      toast({
        title: "Registration Failed",
        description: err.response?.data?.message || 'Please try again.',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRoleChange = (value: string) => {
    setFormData({
      ...formData,
      role: value as 'ADMIN' | 'DOCTOR' | 'PATIENT'
    });
  };

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <button 
            onClick={() => navigate('/admin-dashboard')}
            className="inline-flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Admin Dashboard</span>
          </button>
          
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-medical rounded-lg flex items-center justify-center shadow-medical">
              <Stethoscope className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-3xl font-bold text-primary">MedVault</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Register New User</h1>
          <p className="text-muted-foreground">Add a new user to the system</p>
        </div>

        <Card className="shadow-elegant border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-xl flex items-center justify-center space-x-2">
              <UserCheck className="w-5 h-5" />
              <span>User Registration</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="animate-fade-in">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>


              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select user role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Administrator</SelectItem>
                    <SelectItem value="DOCTOR">Doctor</SelectItem>
                    <SelectItem value="PATIENT">Patient</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <EnhancedButton
                type="submit"
                variant="medical"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Registering User...' : 'Register User'}
              </EnhancedButton>
            </form>

            
          </CardContent>
        </Card>
        
        <p className="text-center text-muted-foreground text-xs mt-6">
          New users will need to reset their password on first login
        </p>
      </div>
    </div>
  );
};

export default Register;