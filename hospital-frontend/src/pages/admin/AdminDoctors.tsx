import React, { useEffect, useState } from "react";
import { api } from "../../api/client";
import type { DoctorProfile } from "../../types";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  Stethoscope,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";

interface DoctorFormData {
  specialization: string;
  qualification: string;
  consultation_fee: string | number;
  biography: string;
  photo_url: string;
}

const initialFormState: DoctorFormData = {
  specialization: "",
  qualification: "",
  consultation_fee: "",
  biography: "",
  photo_url: "",
};

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form & Modal States
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingDoctor, setEditingDoctor] = useState<DoctorProfile | null>(
    null,
  );
  const [formData, setFormData] = useState<DoctorFormData>(initialFormState);

  // Delete Confirmation Modal State
  const [deletingDoctor, setDeletingDoctor] = useState<DoctorProfile | null>(
    null,
  );

  const fetchDoctors = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<any>("/doctors");
      const dataArray: DoctorProfile[] = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
          ? res.data
          : res?.data?.data || [];
      setDoctors(dataArray);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to load doctors.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleOpenCreateModal = (): void => {
    setEditingDoctor(null);
    setFormData(initialFormState);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (doctor: DoctorProfile): void => {
    setEditingDoctor(doctor);
    setFormData({
      specialization: doctor.specialization || "",
      qualification: doctor.qualification || "",
      consultation_fee: doctor.consultation_fee || "",
      biography: doctor.bio || doctor.biography || "",
      photo_url: doctor.photo_url || "",
    });
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const payload = {
      specialization: formData.specialization,
      qualification: formData.qualification,
      consultation_fee: Number(formData.consultation_fee),
      bio: formData.biography,
      biography: formData.biography, 
      photo_url: formData.photo_url,
    };

    try {
      if (editingDoctor) {
        await api.put(`/doctors/${editingDoctor.id}`, payload);
      } else {
        await api.post("/doctors", payload);
      }
      setIsFormOpen(false);
      fetchDoctors();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to save doctor profile.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!deletingDoctor) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/doctors/${deletingDoctor.id}`);
      setDeletingDoctor(null);
      fetchDoctors();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to delete doctor.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Doctors Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Manage medical staff profiles, biographies, fees, and photo
            credentials
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchDoctors}
            disabled={isLoading}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            title="Refresh List"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add Doctor
          </button>
        </div>
      </div>

      {/* Global Error Alert */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-sm rounded-lg flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)}>
            <X className="h-4 w-4" />
          </button>
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
                  <th className="px-6 py-3.5">Doctor</th>
                  <th className="px-6 py-3.5">Specialization</th>
                  <th className="px-6 py-3.5">Qualification</th>
                  <th className="px-6 py-3.5">Biography</th>
                  <th className="px-6 py-3.5">Fee</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {doctors.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-slate-400 dark:text-slate-500"
                    >
                      <Stethoscope className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      No doctors registered yet.
                    </td>
                  </tr>
                ) : (
                  doctors.map((doc) => (
                    <tr
                      key={doc.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* Doctor Profile Info & Photo */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {doc.photo_url ? (
                            <img
                              src={doc.photo_url}
                              alt={doc.user?.name || "Doctor Profile"}
                              className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center border border-blue-200 dark:border-blue-800">
                              {doc.user?.name ? doc.user.name.charAt(0) : "D"}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {doc.user?.name || `Doctor #${doc.id}`}
                            </div>
                            <div className="text-xs text-slate-400 dark:text-slate-500">
                              {doc.user?.email || "No email linked"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                        {doc.specialization || "N/A"}
                      </td>

                      <td className="px-6 py-4">
                        {doc.qualification || "N/A"}
                      </td>

                      {/* Biography Column */}
                      <td className="px-6 py-4 max-w-xs">
                        <p
                          className="line-clamp-2 text-xs text-slate-500 dark:text-slate-400"
                          title={doc.bio || doc.biography || ""}
                        >
                          {doc.bio || doc.biography || "No biography recorded."}
                        </p>
                      </td>

                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">
                        ${Number(doc.consultation_fee || 0).toFixed(2)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(doc)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
                          title="Edit Profile"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeletingDoctor(doc)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors"
                          title="Delete Doctor"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT DOCTOR MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editingDoctor ? "Edit Doctor Profile" : "Register New Doctor"}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Photo URL
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <ImageIcon className="h-4 w-4" />
                  </span>
                  <input
                    type="url"
                    value={formData.photo_url}
                    onChange={(e) =>
                      setFormData({ ...formData, photo_url: e.target.value })
                    }
                    placeholder="https://example.com/doctor-photo.jpg"
                    className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Specialization
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.specialization}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specialization: e.target.value,
                      })
                    }
                    placeholder="Cardiology"
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Consultation Fee ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.consultation_fee}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        consultation_fee: e.target.value,
                      })
                    }
                    placeholder="150.00"
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Qualification
                </label>
                <input
                  type="text"
                  required
                  value={formData.qualification}
                  onChange={(e) =>
                    setFormData({ ...formData, qualification: e.target.value })
                  }
                  placeholder="MBBS, MD"
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Biography
                </label>
                <textarea
                  rows={3}
                  value={formData.biography}
                  onChange={(e) =>
                    setFormData({ ...formData, biography: e.target.value })
                  }
                  placeholder="Write a brief medical summary or background..."
                  className="w-full text-xs sm:text-sm p-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
                >
                  {isSubmitting && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {editingDoctor ? "Update Doctor" : "Create Doctor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600 dark:text-rose-500">
              <div className="p-2 bg-rose-100 dark:bg-rose-950/50 rounded-full">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Confirm Deletion
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {deletingDoctor.user?.name || `Doctor #${deletingDoctor.id}`}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingDoctor(null)}
                className="px-4 py-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isSubmitting}
                className="inline-flex items-center px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                {isSubmitting && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
