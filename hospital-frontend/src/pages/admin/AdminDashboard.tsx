import React, { useEffect, useState } from "react";
import { api } from "../../api/client";
import {
  Users,
  Stethoscope,
  Building2,
  Calendar,
  ArrowUpRight,
  Loader2,
  AlertCircle,
  Clock,
  TrendingUp,
} from "lucide-react";

interface StatsOverview {
  totalUsers: number;
  totalDoctors: number;
  totalDepartments: number;
  totalAppointments: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsOverview>({
    totalUsers: 0,
    totalDoctors: 0,
    totalDepartments: 0,
    totalAppointments: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [usersRes, docsRes, deptsRes, apptsRes] = await Promise.all([
        api.get<any>("/admin/users").catch(() => []),
        api.get<any>("/doctors").catch(() => []),
        api.get<any>("/departments").catch(() => []),
        api.get<any>("/appointments").catch(() => []),
      ]);

      const usersArr = Array.isArray(usersRes)
        ? usersRes
        : usersRes?.data || [];
      const docsArr = Array.isArray(docsRes) ? docsRes : docsRes?.data || [];
      const deptsArr = Array.isArray(deptsRes)
        ? deptsRes
        : deptsRes?.data || [];
      const apptsArr = Array.isArray(apptsRes)
        ? apptsRes
        : apptsRes?.data || [];

      setStats({
        totalUsers: usersArr.length,
        totalDoctors: docsArr.length,
        totalDepartments: deptsArr.length,
        totalAppointments: apptsArr.length,
      });

      setRecentAppointments(apptsArr.slice(0, 5));
    } catch (err: any) {
      setError(err.message || "Failed to fetch dashboard metrics.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          System metrics and recent activity summary
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-sm rounded-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 text-red-500 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4 transition-colors">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-lg">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Users
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isLoading ? "..." : stats.totalUsers}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4 transition-colors">
          <div className="p-3 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-lg">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Doctors
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isLoading ? "..." : stats.totalDoctors}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4 transition-colors">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Departments
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isLoading ? "..." : stats.totalDepartments}
            </h3>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center space-x-4 transition-colors">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-lg">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Appointments
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {isLoading ? "..." : stats.totalAppointments}
            </h3>
          </div>
        </div>
      </div>

      {/* Recent Activity Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-slate-400 dark:text-slate-500" />
            <h2 className="font-bold text-slate-900 dark:text-white text-base">
              Recent Appointments
            </h2>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : recentAppointments.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-sm">
            No recent appointments recorded.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 font-medium border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3">Patient</th>
                  <th className="px-6 py-3">Doctor</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentAppointments.map((appt) => (
                  <tr
                    key={appt.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {appt.patient_name ||
                        appt.user?.name ||
                        `Patient #${appt.user_id}`}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {appt.doctor?.name || `Doctor #${appt.doctor_id}`}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {appt.appointment_date || appt.date || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">
                        {appt.status || "Scheduled"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
