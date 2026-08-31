import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { Appointment } from '../types';
import { Calendar, Clock, Stethoscope, AlertCircle, Loader2, XCircle } from 'lucide-react';

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const data = await api.get<Appointment[]>('/appointments');
      setAppointments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load appointments.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;

    try {
      setCancellingId(id);
      await api.patch(`/appointments/${id}/cancel`);
      setAppointments((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: 'cancelled' } : item))
      );
    } catch (err: any) {
      alert(err.message || 'Could not cancel appointment.');
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-green-100 text-green-800 rounded-full">Confirmed</span>;
      case 'completed':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">Completed</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">Pending</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-sm text-gray-500">Manage and view your scheduled doctor consultations</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-center border border-red-200 text-sm">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 text-red-500" />
          {error}
        </div>
      )}

      {appointments.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center shadow-sm">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No appointments scheduled</h3>
          <p className="text-sm text-gray-500">You haven't booked any consultations yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                      <Stethoscope className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {appointment.doctor?.user?.name || `Doctor #${appointment.doctor_id}`}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {appointment.doctor?.specialization || 'General Healthcare'}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(appointment.status)}
                </div>

                <div className="space-y-2 border-t border-b border-gray-100 py-3 my-3 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>{appointment.appointment_date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span>{appointment.time_slot}</span>
                  </div>
                </div>
              </div>

              {appointment.status === 'pending' && (
                <button
                  onClick={() => handleCancel(appointment.id)}
                  disabled={cancellingId === appointment.id}
                  className="w-full mt-2 py-2 px-3 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
                >
                  {cancellingId === appointment.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <XCircle className="h-4 w-4" />
                      <span>Cancel Appointment</span>
                    </>
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}