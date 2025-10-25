import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Star, Calendar } from "lucide-react";
import { Review } from "@/types/user";

interface ReviewCardProps {
  review: Review;
  showDoctorInfo?: boolean;
  showPatientInfo?: boolean;
}

export function ReviewCard({ review, showDoctorInfo = false, showPatientInfo = false }: ReviewCardProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with avatar and info */}
          <div className="flex items-start gap-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {showDoctorInfo ? getInitials(review.doctorName) : getInitials(review.patientName)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">
                    {showDoctorInfo ? `Dr. ${review.doctorName}` : review.patientName}
                  </p>
                  {showDoctorInfo && (
                    <Badge variant="outline" className="text-xs mt-1">
                      {review.doctorSpecialization}
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  {renderStars(review.rating)}
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date(review.appointmentDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Comment */}
          {review.comment && (
            <p className="text-sm text-muted-foreground leading-relaxed pl-13">
              "{review.comment}"
            </p>
          )}

          {/* Date created */}
          <div className="text-xs text-muted-foreground pl-13">
            Reviewed on {new Date(review.createdAt).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}