import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css'

import ProtectedRoute from './models/ProtectedRoute.jsx';
import Layout from './models/layout.jsx';

import Login from './pages/login.jsx'
import Dashboard from './pages/dashboard.jsx';
import NotFound from './pages/Error/404.jsx'

import Table from './pages/Solar_wash/table.jsx'
import Schedule from './pages/Solar_wash/schedule.jsx'
import FastMachine from './pages/Solar_wash/fastMachine.jsx';

import Cams from './pages/Door_cam/Cams.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
          <Route path="/table" element={<ProtectedRoute><Table /></ProtectedRoute>} />
          <Route path="/cams" element={<ProtectedRoute><Cams /></ProtectedRoute>} />
          <Route path="/fast" element={<ProtectedRoute><FastMachine /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>,
)
