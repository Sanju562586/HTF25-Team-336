import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Shield, Heart, Users, Activity, CheckCircle, Star, Stethoscope, FileText, Clock, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import MedVaultChatbot from '@/components/MedVaultChatbot';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: FileText,
      title: "Digital Records",
      description: "Comprehensive electronic health records accessible anytime, anywhere with advanced search capabilities."
    },
    {
      icon: Clock,
      title: "Smart Scheduling",
      description: "Intelligent appointment booking system with automated reminders and calendar integration."
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "End-to-end encryption and HIPAA compliance ensuring maximum security for sensitive data."
    },
    {
      icon: Award,
      title: "Quality Care",
      description: "Evidence-based insights and analytics to improve patient outcomes and care delivery."
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Patients" },
    { number: "1,200+", label: "Healthcare Providers" },
    { number: "99.9%", label: "Uptime Guarantee" },
    { number: "24/7", label: "Support Available" }
  ];

  const benefits = [
    "Centralized medical record management",
    "Seamless appointment scheduling",
    "Real-time health monitoring",
    "Secure doctor-patient communication",
    "Advanced analytics and reporting",
    "HIPAA compliant infrastructure"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-medical rounded-xl flex items-center justify-center shadow-lg">
                  <Stethoscope className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-background"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">MedVault</h1>
                <p className="text-xs text-muted-foreground">Healthcare Platform</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</a>
              <a href="#about" className="text-muted-foreground hover:text-primary transition-colors">About</a>
              <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</a>
            </div>
            
            <div className="flex items-center space-x-3">
              <EnhancedButton 
                variant="ghost" 
                onClick={() => navigate('/login')}
                className="text-muted-foreground hover:text-primary"
              >
                Sign In
              </EnhancedButton>
              <EnhancedButton 
                variant="medical" 
                onClick={() => navigate('/login')}
                className="shadow-md hover:shadow-lg"
              >
                Get Started
              </EnhancedButton>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-sm text-primary font-medium">
                  <Star className="w-4 h-4 mr-2" />
                  Trusted by 50,000+ Healthcare Professionals
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
                  Modern Healthcare
                  <span className="text-primary block">Management Platform</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                  Streamline your medical practice with secure record management, 
                  intelligent scheduling, and powerful analytics—all in one platform.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <EnhancedButton 
                  variant="medical" 
                  size="xl"
                  onClick={() => navigate('/login')}
                  className="shadow-elegant hover:shadow-xl transform hover:scale-105 transition-all"
                >
                  Start Free Trial
                </EnhancedButton>
                <EnhancedButton 
                  variant="hero" 
                  size="xl"
                  onClick={() => navigate('/login')}
                  className="group"
                >
                  <Activity className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                  Healthcare Portal
                </EnhancedButton>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl md:text-3xl font-bold text-primary">{stat.number}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl p-8 backdrop-blur-sm border border-border/50">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-card rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 bg-success/20 rounded-lg flex items-center justify-center">
                        <Heart className="w-4 h-4 text-success" />
                      </div>
                      <div className="text-xs text-success">Active</div>
                    </div>
                    <div className="text-sm font-medium">Patient Records</div>
                    <div className="text-2xl font-bold text-primary">2,847</div>
                  </div>
                  <div className="bg-card rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4 text-primary" />
                      </div>
                      <div className="text-xs text-primary">Today</div>
                    </div>
                    <div className="text-sm font-medium">Appointments</div>
                    <div className="text-2xl font-bold text-primary">24</div>
                  </div>
                </div>
                <div className="bg-card rounded-xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-medium">Recent Activity</div>
                    <Activity className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-success rounded-full"></div>
                      <div className="text-xs text-muted-foreground">New patient registered</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <div className="text-xs text-muted-foreground">Lab results uploaded</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-secondary rounded-full"></div>
                      <div className="text-xs text-muted-foreground">Appointment scheduled</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Choose MedVault?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Built with healthcare professionals in mind, offering cutting-edge features 
            for modern medical practice management.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-card transition-all duration-300 border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-medical rounded-full mx-auto mb-4 flex items-center justify-center shadow-medical">
                  <feature.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Benefits List */}
        <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-8 shadow-card border border-border/50">
          <h3 className="text-2xl font-bold text-center mb-8 text-foreground">
            Comprehensive Healthcare Management
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                <span className="text-foreground">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center bg-gradient-medical rounded-2xl p-12 shadow-elegant">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Ready to Transform Your Healthcare Management?
          </h2>
          <p className="text-primary-foreground/90 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of healthcare professionals who trust MedVault for 
            secure, efficient medical record management.
          </p>
          <EnhancedButton 
            variant="hero" 
            size="xl"
            onClick={() => navigate('/login')}
            className="bg-white text-primary hover:bg-white/90 shadow-xl hover:text-foreground"
          >
            Get Started Today
          </EnhancedButton>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-border/50">
        <div className="flex flex-col md:flex-row items-center justify-between text-muted-foreground">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-6 h-6 bg-gradient-medical rounded flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-primary">MedVault</span>
          </div>
          <p className="text-sm">
            © 2025 MedVault. All rights reserved. HIPAA Compliant Healthcare Management.
          </p>
        </div>
      </footer>

      {/* MedVault Chatbot */}
      <MedVaultChatbot />
    </div>
  );
};

export default Landing;