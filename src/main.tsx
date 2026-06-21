// main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import './app/theme.css';

import LandingPage from './marketing/LandingPage';
import PrivacyPolicy from './marketing/PrivacyPolicy';
import AccountDeletion from './marketing/AccountDeletion';

import { AuthProvider } from './auth/AuthProvider';
import { RequireAuth } from './auth/RequireAuth';
import AppShell from './app/AppShell';
import LoginScreen from './app/LoginScreen';
import HomeScreen from './features/home/HomeScreen';
import CalendarScreen from './features/calendar/CalendarScreen';
import SettingsScreen from './features/settings/SettingsScreen';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Marketing site (unchanged) */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/delete-account" element={<AccountDeletion />} />

            {/* Authenticated product */}
            <Route path="/app/login" element={<LoginScreen />} />
            <Route
              path="/app"
              element={
                <RequireAuth>
                  <AppShell />
                </RequireAuth>
              }
            >
              <Route index element={<HomeScreen />} />
              <Route path="calendar" element={<CalendarScreen />} />
              <Route path="settings" element={<SettingsScreen />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
