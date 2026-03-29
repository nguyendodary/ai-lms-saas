import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./lib/auth-context";
import HomePage from "@/pages/home";
import SignInPage from "@/pages/sign-in";
import SignUpPage from "@/pages/sign-up";
import DashboardPage from "@/pages/dashboard";
import ProfilePage from "@/pages/profile";
import CompanionsPage from "@/pages/companions";
import SessionPage from "@/pages/session";
import SessionsPage from "@/pages/sessions";
import AnalyticsPage from "@/pages/analytics";
import PricingPage from "@/pages/pricing";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { supabaseUser, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }
  
  if (!supabaseUser) {
    return <Navigate to="/sign-in" replace />;
  }
  
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/dashboard/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/dashboard/companions" element={<ProtectedRoute><CompanionsPage /></ProtectedRoute>} />
        <Route path="/dashboard/companions/:id" element={<ProtectedRoute><SessionPage /></ProtectedRoute>} />
        <Route path="/dashboard/sessions" element={<ProtectedRoute><SessionsPage /></ProtectedRoute>} />
        <Route path="/dashboard/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
