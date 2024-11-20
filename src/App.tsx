import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth-store';
import { Chat } from './pages/chat';
import { Landing } from './pages/landing';
import { Login } from './pages/login';
import { Register } from './pages/register';
import { Documentation } from './pages/documentation';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <div className="flex h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/documentation" element={<Documentation />} />
        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          }
        />
      </Routes>
    </div>
  );
}