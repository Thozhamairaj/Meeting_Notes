import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { LandingPage } from "@/pages/Landing";
import { AuthPage } from "@/pages/Auth";
import { SignupPage } from "@/pages/Signup";
import { SSOCallbackPage } from "@/pages/SSOCallback";
import { DashboardPage } from "@/pages/Dashboard";
import { HistoryPage } from "@/pages/History";
import { PlatformLayout } from "@/layouts/PlatformLayout";

function ProtectedRoute({ children }: React.PropsWithChildren) {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      </div>
    );
  }
  if (!isSignedIn) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function AuthRoute({ children }: React.PropsWithChildren) {
  const { isSignedIn, isLoaded } = useAuth();
  if (!isLoaded) return null;
  if (isSignedIn) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthRoute><AuthPage /></AuthRoute>} />
      <Route path="/signup" element={<AuthRoute><SignupPage /></AuthRoute>} />
      <Route path="/sso-callback" element={<SSOCallbackPage />} />
      <Route
        path="/dashboard"
        element={<ProtectedRoute><PlatformLayout><DashboardPage /></PlatformLayout></ProtectedRoute>}
      />
      <Route
        path="/history"
        element={<ProtectedRoute><PlatformLayout><HistoryPage /></PlatformLayout></ProtectedRoute>}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
