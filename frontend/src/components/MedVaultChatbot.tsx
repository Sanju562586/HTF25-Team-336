import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  X, 
  Minimize2, 
  Maximize2, 
  Bot, 
  User,
  Loader2,
  Stethoscope,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatbotProps {
  className?: string;
}

const GEMINI_API_KEY = 'AIzaSyDPIV9_O8XLWhcYqBB5M_N0J1xI2rQ3f50';

const MedVaultChatbot: React.FC<ChatbotProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Welcome message when chatbot opens
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: getWelcomeMessage(),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, user]);

  const getWelcomeMessage = () => {
    const userRole = user?.role;
    const userName = user?.username || 'there';
    
    switch (userRole) {
      case 'PATIENT':
        return `Hello ${userName}! 👋 I'm your MedVault assistant. I can help you with:
        
• Booking appointments with doctors
• Managing your profile and health records
• Understanding appointment statuses
• Emergency request procedures
• Reviewing doctors and providing feedback
• Document permission management

What would you like to know about?`;
      
      case 'DOCTOR':
        return `Hello Dr. ${userName}! 👋 I'm your MedVault assistant. I can help you with:
        
• Managing your appointment schedule
• Creating availability slots
• Handling booking requests
• Viewing patient medical records
• Managing emergency requests
• Understanding reviews and ratings
• Profile management

How can I assist you today?`;
      
      case 'ADMIN':
        return `Hello ${userName}! 👋 I'm your MedVault assistant. I can help you with:
        
• User registration and management
• System analytics and reports
• Managing doctor and patient accounts
• Understanding platform features
• Administrative procedures

What administrative task can I help you with?`;
      
      default:
        return `Welcome to MedVault! 👋 I'm your healthcare assistant. I can help you understand:
        
• How to use our medical appointment system
• Features for patients and doctors
• Security and privacy measures
• Getting started with the platform

What would you like to know about MedVault?`;
    }
  };

  const getMedVaultContext = () => {
    return `You are a helpful assistant for MedVault, a comprehensive medical appointment scheduling and record management platform. Here's what you need to know about the system:

CORE FEATURES:
- Multi-role system: Admin, Doctor, Patient
- Secure appointment scheduling and management
- Electronic health records management
- Emergency request system
- Reviews and ratings for doctors
- Document permission management
- Real-time notifications

USER ROLES & CAPABILITIES:

PATIENTS can:
- Book appointments with available doctors
- View and manage their appointment history
- Complete and update their health profile
- Submit emergency requests for urgent care
- Rate and review doctors after appointments
- Manage their health records and medical documents
- Grant/revoke document access permissions to doctors
- View appointment statuses (pending, confirmed, completed, cancelled)

DOCTORS can:
- Create availability slots for appointments
- View and manage their appointment schedule
- Approve or reject patient booking requests
- Access patient medical records (with permission)
- Handle emergency requests from patients
- View their reviews and ratings from patients
- Update their professional profile and specializations
- Manage patient medical records during appointments

ADMINS can:
- Register new users (doctors and patients)
- View system analytics and user statistics
- Manage user accounts and permissions
- Monitor platform usage and performance

APPOINTMENT PROCESS:
1. Doctors create availability slots
2. Patients browse available slots and book appointments
3. Doctors receive booking requests for approval
4. Once approved, appointments are confirmed
5. After completion, patients can leave reviews

SECURITY & PRIVACY:
- HIPAA compliant infrastructure
- End-to-end encryption for sensitive data
- Role-based access control
- Secure authentication system
- Document permission management

IMPORTANT: Never share sensitive information like passwords, API keys, or personal medical data. Always direct users to appropriate sections of the application for sensitive operations.

Current user role: ${user?.role || 'Guest'}
Current user: ${user?.username || 'Anonymous'}`;
  };

  const generateResponse = async (userMessage: string): Promise<string> => {
    try {
      const context = getMedVaultContext();
      
      const prompt = `${context}

User Question: "${userMessage}"

Please provide a helpful, accurate response about MedVault's features and functionality. Keep responses concise but informative. If the question is about sensitive operations (like changing passwords, accessing medical records, etc.), guide them to the appropriate section of the application rather than providing direct instructions.

Response:`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return getFallbackResponse(userMessage);
    }
  };

  const getFallbackResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Appointment related queries
    if (lowerMessage.includes('appointment') || lowerMessage.includes('book') || lowerMessage.includes('schedule')) {
      if (user?.role === 'PATIENT') {
        return "To book an appointment: Go to your dashboard → Click 'Book Appointment' → Select a doctor and available time slot → Submit your request. The doctor will review and approve your booking.";
      } else if (user?.role === 'DOCTOR') {
        return "To manage appointments: Go to 'Create Slots' to set your availability, then check 'Booking Requests' to approve patient requests. View your schedule in 'My Appointments'.";
      }
      return "MedVault offers comprehensive appointment scheduling. Patients can book appointments with doctors, and doctors can manage their availability and approve requests.";
    }
    
    // Profile related queries
    if (lowerMessage.includes('profile') || lowerMessage.includes('update') || lowerMessage.includes('information')) {
      return "You can update your profile by going to the 'My Profile' section in your dashboard. Make sure to complete all required fields for full platform access.";
    }
    
    // Emergency related queries
    if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent')) {
      if (user?.role === 'PATIENT') {
        return "For emergency requests: Go to 'Emergency Request' in your dashboard to submit urgent medical requests. Doctors will be notified immediately.";
      } else if (user?.role === 'DOCTOR') {
        return "Emergency requests from patients appear in your 'Emergency Requests' section. You can respond to urgent patient needs and manage your emergency availability.";
      }
      return "MedVault has an emergency request system for urgent medical needs, connecting patients with available doctors quickly.";
    }
    
    // Reviews related queries
    if (lowerMessage.includes('review') || lowerMessage.includes('rating') || lowerMessage.includes('feedback')) {
      if (user?.role === 'PATIENT') {
        return "After completing an appointment, you can leave reviews and ratings for doctors in the 'My Reviews' section of your dashboard.";
      } else if (user?.role === 'DOCTOR') {
        return "You can view patient reviews and ratings in the 'Reviews & Ratings' section of your dashboard to track patient satisfaction.";
      }
      return "MedVault includes a review system where patients can rate and review doctors after appointments to help maintain quality care.";
    }
    
    // Medical records queries
    if (lowerMessage.includes('record') || lowerMessage.includes('medical') || lowerMessage.includes('health')) {
      return "MedVault provides secure medical record management. Patients can manage their health records and control doctor access permissions through the 'Health Record' and 'Document Permissions' sections.";
    }
    
    // General help
    return "I'm here to help you navigate MedVault! You can ask me about appointments, profiles, emergency requests, medical records, reviews, or any other platform features. What specific area would you like help with?";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const botResponse = await generateResponse(userMessage.text);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I'm having trouble responding right now. Please try again in a moment, or contact support if the issue persists.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (!isOpen) {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <EnhancedButton
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-medical shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          size="lg"
        >
          <MessageCircle className="w-6 h-6 text-primary-foreground" />
        </EnhancedButton>
        
        {/* Tooltip */}
        <div className="absolute bottom-16 right-0 bg-card border border-border rounded-lg px-3 py-2 shadow-lg opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <p className="text-sm text-foreground whitespace-nowrap">Need help? Ask me anything!</p>
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-border"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <Card className={`w-96 shadow-2xl border-border/50 bg-card/95 backdrop-blur-md transition-all duration-300 ${
        isMinimized ? 'h-16' : 'h-[500px]'
      }`}>
        <CardHeader className="pb-3 border-b border-border/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-medical rounded-full flex items-center justify-center">
                <Stethoscope className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-lg">MedVault Assistant</CardTitle>
                <p className="text-xs text-muted-foreground">Healthcare Support</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <EnhancedButton
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="w-8 h-8 p-0"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </EnhancedButton>
              <EnhancedButton
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 p-0"
              >
                <X className="w-4 h-4" />
              </EnhancedButton>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[calc(500px-80px)]">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.sender === 'user'
                          ? 'bg-gradient-medical text-primary-foreground'
                          : 'bg-muted text-foreground border border-border/30'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        {message.sender === 'bot' && (
                          <Bot className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
                        )}
                        {message.sender === 'user' && (
                          <User className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary-foreground" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {message.text}
                          </p>
                          <p className={`text-xs mt-2 ${
                            message.sender === 'user' 
                              ? 'text-primary-foreground/70' 
                              : 'text-muted-foreground'
                          }`}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl px-4 py-3 border border-border/30">
                      <div className="flex items-center space-x-2">
                        <Bot className="w-4 h-4 text-primary" />
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t border-border/30 p-4">
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me about MedVault features..."
                    className="w-full resize-none rounded-xl border border-border/30 bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 max-h-20"
                    rows={1}
                    disabled={isLoading}
                  />
                </div>
                <EnhancedButton
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="w-10 h-10 p-0 rounded-xl bg-gradient-medical"
                >
                  <Send className="w-4 h-4 text-primary-foreground" />
                </EnhancedButton>
              </div>
              
              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-accent/50 text-xs"
                  onClick={() => setInputValue("How do I book an appointment?")}
                >
                  <HelpCircle className="w-3 h-3 mr-1" />
                  Book Appointment
                </Badge>
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-accent/50 text-xs"
                  onClick={() => setInputValue("How do I update my profile?")}
                >
                  <HelpCircle className="w-3 h-3 mr-1" />
                  Update Profile
                </Badge>
                <Badge 
                  variant="outline" 
                  className="cursor-pointer hover:bg-accent/50 text-xs"
                  onClick={() => setInputValue("What are emergency requests?")}
                >
                  <HelpCircle className="w-3 h-3 mr-1" />
                  Emergency Help
                </Badge>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default MedVaultChatbot;
