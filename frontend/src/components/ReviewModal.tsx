import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { reviewsAPI } from "@/services/profileApi";
import { Appointment } from "@/types/user";

interface ReviewModalProps {
  appointment: Appointment;
  trigger: React.ReactNode;
  onReviewSubmitted?: () => void;
}

export function ReviewModal({ appointment, trigger, onReviewSubmitted }: ReviewModalProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await reviewsAPI.createReview({
        appointmentId: appointment.id,
        rating,
        comment: comment.trim() || undefined,
      });

      toast({
        title: "Review submitted successfully",
        description: "Thank you for your feedback!",
      });

      setOpen(false);
      setRating(0);
      setComment('');
      onReviewSubmitted?.();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStar = (starNumber: number) => {
    const filled = starNumber <= (hoveredRating || rating);
    return (
      <Star
        key={starNumber}
        className={`w-8 h-8 cursor-pointer transition-colors ${
          filled ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
        onClick={() => setRating(starNumber)}
        onMouseEnter={() => setHoveredRating(starNumber)}
        onMouseLeave={() => setHoveredRating(0)}
      />
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Your Experience</DialogTitle>
          <DialogDescription>
            Share your feedback about your appointment with Dr. {appointment.doctorName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Appointment Details */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center text-sm">
              <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
              {new Date(appointment.date).toLocaleDateString()}
            </div>
            <div className="flex items-center text-sm">
              <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
              {appointment.timeFrom} - {appointment.timeTo}
            </div>
            <Badge variant="outline" className="text-xs">
              {appointment.specialization}
            </Badge>
          </div>

          {/* Rating */}
          <div className="text-center">
            <p className="text-sm font-medium mb-3">Rate your experience</p>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map(renderStar)}
            </div>
            {rating > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {rating === 1 && "Poor"}
                {rating === 2 && "Fair"} 
                {rating === 3 && "Good"}
                {rating === 4 && "Very Good"}
                {rating === 5 && "Excellent"}
              </p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Additional Comments (Optional)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share more about your experience..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={submitting || rating === 0}
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}