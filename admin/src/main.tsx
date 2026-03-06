import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import NotFoundPage from './pages/NotFoundPage'
import * as React from 'react'
import AdminLayout from './layouts/AdminLayout'
import OverviewPage from './pages/OverviewPage'
import SignInPage from './pages/SignInPage'
import PostsPage from './pages/PostsPage'
import AuthLayout from './layouts/AuthLayout'
import ReportsPage from './pages/ReportsPage'
import CollegePage from './pages/CollegePage'
import UserPage from './pages/UserPage'
import LogPage from './pages/LogPage'
import FeedbackPage from './pages/FeedbackPage'
import BannedWordsPage from './pages/BannedWordsPage'
import BranchPage from './pages/BranchPage'

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
        path: "branches",
        element: <BranchPage />,
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
        path: "banned-words",
        element: <BannedWordsPage />,
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
    ]
  },
]);

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
