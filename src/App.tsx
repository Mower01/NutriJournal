import React from 'react'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import JournalPage from './pages/JournalPage'
import FoodsPage from './pages/FoodsPage'
import SupplementsPage from './pages/SupplementsPage'
import BilanPage from './pages/BilanPage'
import SimulatorsPage from './pages/SimulatorsPage'
import GoalsPage from './pages/GoalsPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'journal', element: <JournalPage /> },
      { path: 'foods', element: <FoodsPage /> },
      { path: 'supplements', element: <SupplementsPage /> },
      { path: 'bilan', element: <BilanPage /> },
      { path: 'simulators', element: <SimulatorsPage /> },
      { path: 'goals', element: <GoalsPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
