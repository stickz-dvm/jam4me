import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import React from "react";

import { Layout } from "./components/Layout";
import { DjLayout } from "./components/DjLayout";
import { LandingPage } from "./components/pages/LandingPage";
import { LoginPage } from "./components/pages/LoginPage";
import { RegisterPage } from "./components/pages/RegisterPage";
import { ForgotPasswordPage } from "./components/pages/ForgotPasswordPage";
import { OnboardingPage } from "./components/pages/OnboardingPage";
import { DjOnboardingPage } from "./components/pages/DjOnboardingPage";
import { PartiesPage } from "./components/pages/PartiesPage";
import { PartyDetailPage } from "./components/pages/PartyDetailPage";
import { DjDashboardPage } from "./components/pages/DjDashboardPage";
import { DjPartyManagementPage } from "./components/pages/DjPartyManagementPage";
import { WalletPage } from "./components/pages/WalletPage";
import { DjWalletPage } from "./components/pages/DjWalletPage";
import { ProfilePage } from "./components/pages/ProfilePage";
import { SupportPage } from "./components/pages/SupportPage";
import { DjSupportPage } from "./components/pages/DjSupportPage";
import { MusicPosterDemo } from "./components/pages/MusicPosterDemo";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { WalletProvider } from "./context/WalletContext";
import { PartyProvider } from "./context/PartyContext";
import { SpotifyProvider } from "./context/SpotifyContext";

// Protected route component for general users
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, getUserType } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 w-full h-full rounded-full border-4 border-primary/20 border-t-accent animate-spin"></div>
        </div>
      </div>
    );
  }

  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // If the user is a DJ, redirect them to the DJ dashboard
  const userType = getUserType();
  if (userType === "HUB_DJ") {
    return <Navigate to="/dj/dashboard" />;
  }

  return <>{children}</>;
}

// Protected route component for DJs
function DjProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, isDj, getUserType } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative w-16 h-16">
          <div className="absolute top-0 w-full h-full rounded-full border-4 border-primary/20 border-t-accent animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Check if user is a DJ from the stored user type
  const userType = getUserType();
  if (userType !== "HUB_DJ") {
    return <Navigate to="/parties" />;
  }

  return <>{children}</>;
}

// Main app with providers
function AppWithProviders() {
  return (
    <AuthProvider>
      <WalletProvider>
        <PartyProvider>
          <SpotifyProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/music-demo" element={<MusicPosterDemo />} />
                
                {/* User protected routes */}
                <Route element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route path="/onboarding" element={<OnboardingPage />} />
                  <Route path="/home" element={<PartiesPage />} />
                  <Route path="/parties" element={<PartiesPage />} />
                  <Route path="/party/:partyId" element={<PartyDetailPage />} />
                  <Route path="/wallet" element={<WalletPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/support" element={<SupportPage />} />
                </Route>
                
                {/* DJ protected routes */}
                <Route element={
                  <DjProtectedRoute>
                    <DjLayout />
                  </DjProtectedRoute>
                }>
                  <Route path="/dj/onboarding" element={<DjOnboardingPage />} />
                  <Route path="/dj/dashboard" element={<DjDashboardPage />} />
                  <Route path="/dj/party/:partyId" element={<DjPartyManagementPage />} />
                  <Route path="/dj/wallet" element={<DjWalletPage />} />
                  <Route path="/dj/profile" element={<ProfilePage />} />
                  <Route path="/dj/support" element={<DjSupportPage />} />
                </Route>
                
                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </BrowserRouter>
            <Toaster 
              position="top-center"
              toastOptions={{
                style: {
                  background: 'var(--card)',
                  color: 'var(--card-foreground)',
                  border: '1px solid var(--border)'
                },
                className: 'glass'
              }}
              expand  
            />
          </SpotifyProvider>
        </PartyProvider>
      </WalletProvider>
    </AuthProvider>
  );
}

export default function App() {
  return <AppWithProviders />;
}