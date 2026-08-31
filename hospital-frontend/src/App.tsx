import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import AdminDepartments from "./pages/admin/AdminDepartments";

import Login from "./pages/Login";
import Register from "./pages/Register";
import PatientAppointments from "./pages/PatientAppointments";
import { ThemeProvider } from "./context/ThemeContext";

// Admin Views
import AdminLayout from "./components/admin/AdminLayout";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminDoctors from "./pages/admin/AdminDoctors";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminAppointments from "./pages/admin/AdminAppointments";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Patient Routes */}
            <Route
              element={<ProtectedRoute allowedRoles={["patient", "admin"]} />}
            >
              <Route
                path="/patient/appointments"
                element={<PatientAppointments />}
              />
            </Route>

            {/* Protected Admin Nested Layout */}
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="/admin/doctors" element={<AdminDoctors />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="appointments" element={<AdminAppointments />} />
                <Route path="doctors" element={<AdminDoctors />} />
                <Route path="departments" element={<AdminDepartments />} />{" "}
                {/* 2. Add sub-route */}
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
