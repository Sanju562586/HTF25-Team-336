import { useState, useEffect } from 'react';
import { Appointment } from '@/types/user';
import { appointmentsAPI } from '@/services/profileApi';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';

export const useAppointments = () => {
  const { user } = useAuth();
  const { patientProfile, doctorProfile } = useProfile();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = async () => {
    if (!user || (!patientProfile && !doctorProfile)) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      let userAppointments: Appointment[] = [];
      
      if (user.role === 'PATIENT' && patientProfile) {
        userAppointments = await appointmentsAPI.getPatientAppointments(patientProfile.id);
      } else if (user.role === 'DOCTOR' && doctorProfile) {
        userAppointments = await appointmentsAPI.getDoctorAppointments(doctorProfile.id);
        // Filter only approved appointments for doctor's schedule
        userAppointments = userAppointments.filter(apt => apt.status === 'APPROVED');
      }
      
      setAppointments(userAppointments);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user, patientProfile, doctorProfile]);

  // Auto-refresh every 1 minute when user is logged in
  useEffect(() => {
    if (!user || (!patientProfile && !doctorProfile)) {
      return;
    }

    const interval = setInterval(() => {
      fetchAppointments();
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, [user, patientProfile, doctorProfile]);

  // Helper function to check if appointment is upcoming
  const isUpcoming = (appointment: Appointment) => {
    const appointmentDate = new Date(`${appointment.date}T${appointment.timeFrom}`);
    return appointmentDate >= new Date();
  };

  // Get upcoming appointments
  const upcomingAppointments = appointments.filter(isUpcoming);

  // Get past appointments
  const pastAppointments = appointments.filter(apt => !isUpcoming(apt));

  // Get next appointment (earliest upcoming)
  const nextAppointment = upcomingAppointments
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.timeFrom}`);
      const dateB = new Date(`${b.date}T${b.timeFrom}`);
      return dateA.getTime() - dateB.getTime();
    })[0] || null;

  return {
    appointments,
    upcomingAppointments,
    pastAppointments,
    nextAppointment,
    loading,
    error,
    refetch: fetchAppointments
  };
};
