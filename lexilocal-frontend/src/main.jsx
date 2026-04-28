import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import TestPage from './pages/TestPage'
import ReportPage from './pages/ReportPage'
import ProtectedRoute from './router/ProtectedRoute'

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/dashboard', element: <ProtectedRoute><DashboardPage /></ProtectedRoute> },
  { path: '/test', element: <ProtectedRoute><TestPage /></ProtectedRoute> },
  { path: '/report/:id', element: <ProtectedRoute><ReportPage /></ProtectedRoute> },
  { path: '/', element: <ProtectedRoute><DashboardPage /></ProtectedRoute> },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
