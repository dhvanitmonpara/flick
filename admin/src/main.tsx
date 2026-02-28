import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import NotFoundPage from './pages/NotFoundPage'
import * as React from 'react'
import AdminLayout from './layouts/AdminLayout'
import OverviewPage from './pages/OverviewPage'
import SignInPage from './pages/SignInPage'
import PostsPage from './pages/PostsPage'
import AdminVerificationPage from './pages/AdminVerificationPage'
import AuthLayout from './layouts/AuthLayout'
import ReportsPage from './pages/ReportsPage'
import CollegePage from './pages/CollegePage'
import UserPage from './pages/UserPage'
import LogPage from './pages/LogPage'
import FeedbackPage from './pages/FeedbackPage'

// router
const router = createBrowserRouter([
  {
    path: "/",
    element: <AdminLayout />,
    children: [
      {
        path: "",
        element: <OverviewPage />,
      },
      {
        path: "users",
        element: <UserPage />,
      },
      {
        path: "p/:id",
        element: <PostsPage />,
      },
      {
        path: "c/:id",
        element: <PostsPage />,
      },
      {
        path: "u/:id",
        element: <PostsPage />,
      },
      {
        path: "logs",
        element: <LogPage />,
      },
      {
        path: "colleges",
        element: <CollegePage />,
      },
      {
        path: "reports",
        element: <ReportsPage />,
      },
      {
        path: "feedbacks",
        element: <FeedbackPage />,
      },
      {
        path: "settings",
        element: <OverviewPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      }
    ]
  },
  {
    path: "auth",
    element: <AuthLayout />,
    children: [
      {
        path: "signin",
        element: <SignInPage />,
      },
      {
        path: "verify/:email",
        element: <AdminVerificationPage />,
      },
    ]
  },
]);

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)