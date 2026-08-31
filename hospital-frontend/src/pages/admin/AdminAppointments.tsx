import React, { useEffect, useState } from "react";
import { api } from "../../api/client";
import type { Appointment } from "../../types";
import { Loader2, CheckCircle, Clock, XCircle, Calendar, RefreshCw } from "lucide-react";

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchAppointments = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<any>("/appointments");
      // Safely unwrap paginated Laravel responses (res.data.data) or direct arrays
      const dataArray: Appointment[] = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
          ? res.data
          : res?.data?.data || [];
      setAppointments(dataArray);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch appointments.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter((app) =>
    statusFilter === "all" ? true : app.status === statusFilter
  );

  const getStatusBadge = (status: string): React.JSX.Element => {
    const s = status?.toLowerCase();
    switch (s) {
      case "completed":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 rounded-full inline-flex items-center w-fit">
            <CheckCircle className="w-3 h-3 mr-1 shrink-0" /> Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50 rounded-full inline-flex items-center w-fit">
            <XCircle className="w-3 h-3 mr-1 shrink-0" /> Cancelled
          </span>
        );
      case "scheduled":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50 rounded-full inline-flex items-center w-fit">
            <Clock className="w-3 h-3 mr-1 shrink-0" /> Scheduled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50 rounded-full inline-flex items-center w-fit">
            <Clock className="w-3 h-3 mr-1 shrink-0" /> Pending
          </span>
        );
    }
  };

  // Strictly-typed extractors resolving nested relational user names
  const getPatientName = (app: Appointment): string => {
    return (
      app.patient_profile?.user?.name ||
      app.patient?.user?.name ||
      (app.patient_profile_id
        ? `Patient #${app.patient_profile_id}`
        : app.patient_id
        ? `Patient #${app.patient_id}`
        : "N/A")
    );
  };

  const getDoctorName = (app: Appointment): string => {
    return (
      app.doctor_profile?.user?.name ||
      app.doctor?.user?.name ||
      (app.doctor_profile_id
        ? `Doctor #${app.doctor_profile_id}`
        : app.doctor_id
        ? `Doctor #${app.doctor_id}`
        : "N/A")
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Appointments Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Monitor and manage all scheduled hospital consultations
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchAppointments}
            disabled={isLoading}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <select
            value={statusFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setStatusFilter(e.target.value)
            }
            className="text-xs sm:text-sm border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-colors"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-sm rounded-lg flex items-center">
          <XCircle className="h-5 w-5 mr-2 text-rose-500 shrink-0" />
          {error}
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Appt ID</th>
                  <th className="px-6 py-3.5">Patient</th>
                  <th className="px-6 py-3.5">Doctor</th>
                  <th className="px-6 py-3.5">Date & Time</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-slate-400 dark:text-slate-500"
                    >
                      <Calendar className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      No appointments found.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                        #{app.id}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                        {getPatientName(app)}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                        {getDoctorName(app)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 dark:text-slate-200">
                          {app.appointment_date}
                        </div>
                        <div className="text-xs text-slate-400 dark:text-slate-500">
                          {app.appointment_time || app.time || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(app.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}