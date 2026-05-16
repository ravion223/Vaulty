import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import MainLayout from "../layots/MainLayout"
import Clients from "./pages/Clients"
import Accounts from "./pages/Accounts"
import Dashboard from "./pages/Dashboard"
import Transactions from "./pages/Transactions"
import LoginPage from "./pages/LoginPage"
import PrivateRoute from "../src/components/PrivateRoute"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />}/>

        <Route element={<PrivateRoute />}>

          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="clients" element={<Clients /> } />
            <Route path="accounts" element={<Accounts />} />
            <Route path="transactions" element={<Transactions />} />
          </Route>
          
        </Route>

      </Routes>
    </Router>
    );
}

export default App;