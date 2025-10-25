import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { reviewsAPI, appointmentsAPI } from "@/services/profileApi";
import { Review, Appointment } from "@/types/user";
import { ReviewCard } from "./ReviewCard";
import { ReviewModal } from "./ReviewModal";
import { cn } from "@/lib/utils";

export function PatientReviewsTab() {
  const { user } = useAuth();
  const { patientProfile } = useProfile();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [completedAppointments, setCompletedAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewableAppointments, setReviewableAppointments] = useState<Appointment[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'reviews'>('pending');
  const [pendingPage, setPendingPage] = useState(1);
  const [reviewsPage, setReviewsPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    if (patientProfile) {
      fetchReviews();
      fetchCompletedAppointments();
    }
  }, [patientProfile]);

  const fetchReviews = async () => {
    if (!patientProfile) return;

    try {
      const patientReviews = await reviewsAPI.getPatientReviews(patientProfile.id);
      setReviews(patientReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your reviews.",
        variant: "destructive",
      });
    }
  };

  const fetchCompletedAppointments = async () => {
    if (!patientProfile) return;

    setLoading(true);
    try {
      const appointments = await appointmentsAPI.getPatientAppointments(patientProfile.id);
      
      // Filter completed appointments
      const completed = appointments.filter(apt => {
        const appointmentDateTime = new Date(`${apt.date}T${apt.timeTo}`);
        return apt.status === 'APPROVED' && appointmentDateTime < new Date();
      });

      setCompletedAppointments(completed);

      // Check which appointments can be reviewed
      const reviewable: Appointment[] = [];
      for (const appointment of completed) {
        try {
          const { canReview, hasReviewed } = await reviewsAPI.canReviewAppointment(appointment.id);
          if (canReview && !hasReviewed) {
            reviewable.push(appointment);
          }
        } catch (error) {
          console.error(`Error checking review status for appointment ${appointment.id}:`, error);
        }
      }
      
      setReviewableAppointments(reviewable);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch appointments.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmitted = () => {
    fetchReviews();
    fetchCompletedAppointments();
    // Reset to first page when new review is submitted
    setPendingPage(1);
    setReviewsPage(1);
  };

  // Pagination logic for pending reviews
  const pendingStartIndex = (pendingPage - 1) * itemsPerPage;
  const paginatedPendingReviews = reviewableAppointments.slice(
    pendingStartIndex,
    pendingStartIndex + itemsPerPage
  );
  const totalPendingPages = Math.ceil(reviewableAppointments.length / itemsPerPage);

  // Pagination logic for your reviews
  const reviewsStartIndex = (reviewsPage - 1) * itemsPerPage;
  const paginatedReviews = reviews.slice(
    reviewsStartIndex,
    reviewsStartIndex + itemsPerPage
  );
  const totalReviewsPages = Math.ceil(reviews.length / itemsPerPage);

  const handlePendingPageChange = (newPage: number) => {
    setPendingPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReviewsPageChange = (newPage: number) => {
    setReviewsPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to first page when switching tabs
  useEffect(() => {
    setPendingPage(1);
    setReviewsPage(1);
  }, [activeTab]);

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-4">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reviews Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 mx-auto mb-2 text-yellow-400 fill-yellow-400" />
            <p className="text-2xl font-bold">{averageRating}</p>
            <p className="text-sm text-muted-foreground">Average Rating</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{reviews.length}</p>
            <p className="text-sm text-muted-foreground">Total Reviews</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{reviewableAppointments.length}</p>
            <p className="text-sm text-muted-foreground">Pending Reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'pending'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Pending Reviews
          {reviewableAppointments.length > 0 && (
            <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
              {reviewableAppointments.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'reviews'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Your Reviews
          {reviews.length > 0 && (
            <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
              {reviews.length}
            </span>
          )}
        </button>
      </div>

      {/* Pending Reviews Section */}
      {activeTab === 'pending' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Pending Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paginatedPendingReviews.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-semibold">{appointment.doctorName}</p>
                    <p className="text-sm text-muted-foreground">{appointment.specialization}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(appointment.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {appointment.timeFrom} - {appointment.timeTo}
                      </div>
                    </div>
                  </div>
                  <ReviewModal
                    appointment={appointment}
                    trigger={
                      <Button size="sm">
                        Write Review
                      </Button>
                    }
                    onReviewSubmitted={handleReviewSubmitted}
                  />
                </div>
              ))}
            </div>
          </CardContent>

          {/* Pagination for Pending Reviews */}
          {totalPendingPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePendingPageChange(pendingPage - 1)}
                disabled={pendingPage === 1}
                className="gap-1 pl-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPendingPages) }, (_, i) => {
                  let pageNum;
                  if (totalPendingPages <= 5) {
                    pageNum = i + 1;
                  } else if (pendingPage <= 3) {
                    pageNum = i + 1;
                  } else if (pendingPage >= totalPendingPages - 2) {
                    pageNum = totalPendingPages - 4 + i;
                  } else {
                    pageNum = pendingPage - 2 + i;
                  }
                  
                  if (pageNum < 1 || pageNum > totalPendingPages) return null;
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={pendingPage === pageNum ? "default" : "outline"}
                      size="sm"
                      className="w-10 h-10 p-0"
                      onClick={() => handlePendingPageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePendingPageChange(pendingPage + 1)}
                disabled={pendingPage === totalPendingPages}
                className="gap-1 pr-2"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Your Reviews Section */}
      {activeTab === 'reviews' && reviews.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              Your Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paginatedReviews.map((review) => (
                <ReviewCard key={review.id} review={review} showPatientInfo={false} />
              ))}
            </div>

            {/* Pagination for Your Reviews */}
            {totalReviewsPages > 1 && (
              <div className="flex items-center justify-between px-2 pt-4 mt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReviewsPageChange(reviewsPage - 1)}
                  disabled={reviewsPage === 1}
                  className="gap-1 pl-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalReviewsPages) }, (_, i) => {
                    let pageNum;
                    if (totalReviewsPages <= 5) {
                      pageNum = i + 1;
                    } else if (reviewsPage <= 3) {
                      pageNum = i + 1;
                    } else if (reviewsPage >= totalReviewsPages - 2) {
                      pageNum = totalReviewsPages - 4 + i;
                    } else {
                      pageNum = reviewsPage - 2 + i;
                    }
                    
                    if (pageNum < 1 || pageNum > totalReviewsPages) return null;
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={reviewsPage === pageNum ? "default" : "outline"}
                        size="sm"
                        className="w-10 h-10 p-0"
                        onClick={() => handleReviewsPageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReviewsPageChange(reviewsPage + 1)}
                  disabled={reviewsPage === totalReviewsPages}
                  className="gap-1 pr-2"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty state for Your Reviews */}
      {activeTab === 'reviews' && reviews.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-medium">No reviews yet</h3>
            <p className="text-muted-foreground mt-1">
              Your reviews will appear here once you submit them.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}