import { useState, useEffect } from 'react';
import { Appointment, Review, DoctorRating } from '@/types/user';
import { appointmentsAPI, reviewsAPI } from '@/services/profileApi';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';

export const useDoctorDashboard = () => {
  const { user } = useAuth();
  const { doctorProfile } = useProfile();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState<DoctorRating | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!user || user.role !== 'DOCTOR' || !doctorProfile?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Fetch appointments, reviews, and ratings in parallel
      const [appointmentsData, reviewsData, ratingData] = await Promise.allSettled([
        appointmentsAPI.getDoctorAppointments(doctorProfile.id.toString()),
        reviewsAPI.getDoctorReviews(doctorProfile.id),
        reviewsAPI.getDoctorRating(doctorProfile.id)
      ]);

      // Handle appointments
      if (appointmentsData.status === 'fulfilled') {
        // Filter only approved appointments for doctor's schedule
        const approvedAppointments = appointmentsData.value.filter(apt => apt.status === 'APPROVED');
        setAppointments(approvedAppointments);
      } else {
        console.error('Error fetching appointments:', appointmentsData.reason);
      }

      // Handle reviews
      if (reviewsData.status === 'fulfilled') {
        setReviews(reviewsData.value);
      } else {
        console.error('Error fetching reviews:', reviewsData.reason);
      }

      // Handle rating
      if (ratingData.status === 'fulfilled') {
        setRating(ratingData.value);
      } else {
        console.error('Error fetching rating:', ratingData.reason);
        // Rating might not exist yet, so don't treat as error
      }

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user, doctorProfile?.id]);

  // Auto-refresh every 1 minute when user is logged in
  useEffect(() => {
    if (!user || user.role !== 'DOCTOR' || !doctorProfile?.id) {
      return;
    }

    const interval = setInterval(() => {
      fetchDashboardData();
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, [user, doctorProfile?.id]);

  // Helper function to check if appointment is today
  const isToday = (appointment: Appointment) => {
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    return appointmentDate.toDateString() === today.toDateString();
  };

  // Helper function to check if appointment is upcoming
  const isUpcoming = (appointment: Appointment) => {
    const appointmentDate = new Date(`${appointment.date}T${appointment.timeFrom}`);
    return appointmentDate >= new Date();
  };

  // Get today's appointments
  const todaysAppointments = appointments.filter(isToday);

  // Get upcoming appointments
  const upcomingAppointments = appointments.filter(isUpcoming);

  // Get next few upcoming appointments (for dashboard display)
  const nextAppointments = upcomingAppointments
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.timeFrom}`);
      const dateB = new Date(`${b.date}T${b.timeFrom}`);
      return dateA.getTime() - dateB.getTime();
    })
    .slice(0, 5); // Show next 5 appointments

  // Get unique patients count
  const uniquePatients = new Set(appointments.map(apt => apt.patientId)).size;

  // Get completed appointments count
  const completedAppointments = appointments.filter(apt => !isUpcoming(apt)).length;

  // Get this week's appointments
  const getThisWeekAppointments = () => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= startOfWeek && aptDate <= endOfWeek;
    }).length;
  };

  // Get this month's appointments
  const getThisMonthAppointments = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= startOfMonth && aptDate <= endOfMonth;
    }).length;
  };

  // Get positive reviews percentage
  const getPositiveReviewsPercentage = () => {
    if (reviews.length === 0) return 0;
    const positiveReviews = reviews.filter(review => review.rating >= 4).length;
    return Math.round((positiveReviews / reviews.length) * 100);
  };

  // Get practice status based on various metrics
  const getPracticeStatus = () => {
    const avgRating = rating?.averageRating || 0;
    const totalReviews = rating?.totalReviews || 0;
    const positivePercentage = getPositiveReviewsPercentage();
    
    if (avgRating >= 4.5 && totalReviews >= 10 && positivePercentage >= 80) {
      return { status: 'Excellent', color: 'success', description: 'Outstanding patient satisfaction!' };
    } else if (avgRating >= 4.0 && totalReviews >= 5 && positivePercentage >= 70) {
      return { status: 'Very Good', color: 'primary', description: 'Great patient feedback and engagement' };
    } else if (avgRating >= 3.5 && totalReviews >= 3) {
      return { status: 'Good', color: 'warning', description: 'Solid practice with room for improvement' };
    } else if (totalReviews > 0) {
      return { status: 'Developing', color: 'secondary', description: 'Building patient relationships' };
    } else {
      return { status: 'New Practice', color: 'muted', description: 'Welcome to your practice journey!' };
    }
  };

  return {
    // Raw data
    appointments,
    reviews,
    rating,
    loading,
    error,
    refetch: fetchDashboardData,
    
    // Processed data for dashboard
    todaysAppointments,
    upcomingAppointments,
    nextAppointments,
    uniquePatients,
    completedAppointments,
    thisWeekAppointments: getThisWeekAppointments(),
    thisMonthAppointments: getThisMonthAppointments(),
    positiveReviewsPercentage: getPositiveReviewsPercentage(),
    practiceStatus: getPracticeStatus(),
    
    // Dashboard stats
    stats: {
      todaysAppointmentsCount: todaysAppointments.length,
      activePatients: uniquePatients,
      totalReviews: rating?.totalReviews || 0,
      completedVisits: completedAppointments,
      averageRating: rating?.averageRating || 0
    }
  };
};
