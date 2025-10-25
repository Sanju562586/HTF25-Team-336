import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { Heart, Home, ArrowLeft, Stethoscope } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4">
      <div className="text-center max-w-md animate-fade-in">
        {/* MedVault Logo */}
        <div className="flex items-center justify-center space-x-2 mb-8">
          <div className="w-12 h-12 bg-gradient-medical rounded-lg flex items-center justify-center shadow-medical">
            <Stethoscope className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-3xl font-bold text-primary">MedVault</span>
        </div>

        {/* 404 Content */}
        <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 shadow-card">
          <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-bold text-foreground mb-4">Page Not Found</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            The page you're looking for doesn't exist or has been moved. 
            Let's get you back to managing your healthcare data.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <EnhancedButton 
              variant="medical" 
              size="lg"
              asChild
            >
              <Link to="/">
                <Home className="w-4 h-4" />
                Back to Home
              </Link>
            </EnhancedButton>
            
            <EnhancedButton 
              variant="glass" 
              size="lg"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </EnhancedButton>
          </div>
        </div>
        
        <p className="text-muted-foreground text-sm mt-6">
          If you believe this is an error, please contact support
        </p>
      </div>
    </div>
  );
};


export default NotFound;
