import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import MainLayout from "../layots/MainLayout"
import Clients from "./pages/Clients"
import Accounts from "./pages/Accounts"
import Dashboard from "./pages/Dashboard"
import Transactions from "./pages/Transactions"

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={ <Dashboard /> } />
          <Route path="/clients" element={<Clients /> } />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/transactions" element={<Transactions />} />
        </Routes>
      </MainLayout>
    </Router>
    );
}

export default App