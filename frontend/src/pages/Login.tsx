import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { authAPI } from '@/services/api';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, Mail, Lock, ArrowLeft, Stethoscope } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const response = await authAPI.login(formData);
    setUser({
      username: response.username,
      role: response.role,
      first_login: response.first_login,
      message: response.message,
      isProfileComplete: false
    });

    toast({
      title: "Login Successful",
      description: `Welcome back, ${response.role}!`,
      variant: "success",
    });

    console.log("Login Response:", response);

    // Handle first login redirect
    if (response.first_login === true) {
      navigate('/reset-password');
    } else {
      // Role-based dashboard redirect
      switch (response.role) {
        case 'ADMIN':
          navigate('/admin-dashboard');
          break;
        case 'DOCTOR':
          navigate('/doctor-dashboard');
          break;
        case 'PATIENT':
          navigate('/patient-dashboard');
          break;
        default:
          navigate('/');
      }
    }
  } catch (err) {
    setError(err.response?.data?.message || 'Login failed. Please try again.');
    toast({
      title: "Login Failed",
      description: err.response?.data?.message || 'Please check your credentials and try again.',
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

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-medical rounded-lg flex items-center justify-center shadow-medical">
              <Stethoscope className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-3xl font-bold text-primary">MedVault</span>
          </div>
          <p className="text-muted-foreground">Sign in to your account</p>
        </div>

        <Card className="shadow-elegant border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="animate-fade-in">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              <EnhancedButton
                type="submit"
                variant="medical"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </EnhancedButton>
            </form>
          </CardContent>
        </Card>
        
        <p className="text-center text-muted-foreground text-sm mt-6">
          Protected by enterprise-grade security
        </p>
      </div>
    </div>
  );
};

export default Login;