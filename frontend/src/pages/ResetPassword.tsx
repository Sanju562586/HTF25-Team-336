import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { authAPI } from '@/services/api';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, Lock, CheckCircle, Eye, EyeOff, Stethoscope } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ResetPassword = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');

  const passwordRequirements = [
    { regex: /.{8,}/, text: 'At least 8 characters' },
    { regex: /[A-Z]/, text: 'One uppercase letter' },
    { regex: /[a-z]/, text: 'One lowercase letter' },
    { regex: /\d/, text: 'One number' },
    { regex: /[!@#$%^&*]/, text: 'One special character' }
  ];

  const isPasswordValid = (password: string) => {
    return passwordRequirements.every(req => req.regex.test(password));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!isPasswordValid(formData.newPassword)) {
      setError('Password does not meet requirements');
      setLoading(false);
      return;
    }

    try {
      await authAPI.resetPassword({
        username: user?.username || '',
        newPassword: formData.newPassword
      });

      // Update user's first_login status
      if (user) {
        const updatedUser = { ...user, first_login: false };
        setUser(updatedUser);
      }

      toast({
        title: "Password Reset Successful",
        description: "Your password has been updated successfully. Please log in again.",
        className: "bg-green-600 text-white border-none shadow-lg",
      });

      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed. Please try again.');
      toast({
        title: "Password Reset Failed",
        description: err.response?.data?.message || 'Please try again.',
        variant: "destructive",
        className: "bg-red-600 text-white border-none shadow-lg",
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
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-gradient-medical rounded-lg flex items-center justify-center shadow-medical">
              <Stethoscope className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-3xl font-bold text-primary">MedVault</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Reset Your Password</h1>
          <p className="text-muted-foreground">Create a new secure password for your account</p>
        </div>

        <Card className="shadow-elegant border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Security First</CardTitle>
            <p className="text-sm text-muted-foreground">
              Please create a strong password to protect your medical data
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="animate-fade-in">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 h-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 h-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Password Requirements:</Label>
                <div className="space-y-1">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <CheckCircle 
                        className={`h-4 w-4 ${
                          req.regex.test(formData.newPassword) 
                            ? 'text-success' 
                            : 'text-muted-foreground'
                        }`} 
                      />
                      <span className={
                        req.regex.test(formData.newPassword) 
                          ? 'text-success' 
                          : 'text-muted-foreground'
                      }>
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <EnhancedButton
                type="submit"
                variant="medical"
                size="lg"
                className="w-full"
                disabled={loading || !isPasswordValid(formData.newPassword) || formData.newPassword !== formData.confirmPassword}
              >
                {loading ? 'Updating Password...' : 'Update Password'}
              </EnhancedButton>
            </form>
          </CardContent>
        </Card>
        
        <p className="text-center text-muted-foreground text-xs mt-6">
          Your password is encrypted and stored securely
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;