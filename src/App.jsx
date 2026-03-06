import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Register from "./pages/Register";
import ProfilePreview from "./pages/ProfilePreview";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ChangePassword from "./pages/ChangePassword";

import Matches from "./pages/Matches";
import MatchProfile from "./pages/MatchProfile";
import Interests from "./pages/Interests";

import AdminDashboard from "./pages/AdminDashboard";
import AdminUserProfile from "./pages/AdminUserProfile";
import AdminEditUser from "./pages/AdminEditUser";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

function App() {
  return (
    <Routes>
      {/* Home routes */}
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />

      {/* Public */}
      <Route path="/register" element={<Register />} />
      <Route path="/preview" element={<ProfilePreview />} />
      <Route path="/login" element={<Login />} />

      {/* User Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Matches */}
      <Route
        path="/matches"
        element={
          <ProtectedRoute>
            <Matches />
          </ProtectedRoute>
        }
      />
      <Route
        path="/matches/:id"
        element={
          <ProtectedRoute>
            <MatchProfile />
          </ProtectedRoute>
        }
      />

      {/* ✅ Interests */}
      <Route
        path="/interests"
        element={
          <ProtectedRoute>
            <Interests />
          </ProtectedRoute>
        }
      />

      {/* Change Password */}
      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        }
      />

      {/* Admin Dashboard */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          </ProtectedRoute>
        }
      />

      {/* Admin Full Profile */}
      <Route
        path="/admin/profile/:id"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminUserProfile />
            </AdminRoute>
          </ProtectedRoute>
        }
      />

      {/* Admin Edit Profile */}
      <Route
        path="/admin/profile/:id/edit"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminEditUser />
            </AdminRoute>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route
        path="*"
        element={
          <div style={{ padding: 40, textAlign: "center" }}>
            <h2>404 - Page Not Found</h2>
          </div>
        }
      />
    </Routes>
  );
}

export default App;