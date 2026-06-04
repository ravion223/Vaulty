import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import MainLayout from "./layots/MainLayout"
import Clients from "./pages/Clients"
import Accounts from "./pages/Accounts"
import DashboardPage from "./pages/DashboardPage"
import Transactions from "./pages/Transactions"
import LoginPage from "./pages/LoginPage"
import PrivateRoute from "../src/components/PrivateRoute"
import ProtectedRoute from './components/ProtectedRoute'
import FraudAlertsPage from './pages/FraudAlertsPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />}/>

        <Route element={<PrivateRoute />}>

          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="clients" element={
              <ProtectedRoute permission="view_clients">
                <Clients />
              </ProtectedRoute>
            } />
            <Route path="accounts" element={<Accounts />} />
            <Route path="transactions" element={
              <ProtectedRoute permission="view_transactions">
                <Transactions />
              </ProtectedRoute>
            } />
            <Route path="fraud-alerts" element={
              <ProtectedRoute permission="view_transactions">
                <FraudAlertsPage />
              </ProtectedRoute>
            } />
          </Route>
          
        </Route>

      </Routes>
    </Router>
    );
}

export default App;