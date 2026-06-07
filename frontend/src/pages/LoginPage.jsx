import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { FaUserShield } from "react-icons/fa";
import { RiLockPasswordFill } from "react-icons/ri";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";


const LoginPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();

    const handleAdminDemoLogin = () => {
        setUsername('demo_admin');
        setPassword('VaultyAdmin2026!');
    }

    const handleOfficerDemoLogin = () => {
        setUsername('demo_officer');
        setPassword('VaultyOfficer2026!');
    }

    const handleManagerDemoLogin = () => {
        setUsername('demo_manager');
        setPassword('VaultyManager2026!');
    }

    const handleAnalystDemoLogin = () => {
        setUsername('demo_analyst');
        setPassword('VaultyAnalyst2026!');
    }

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await apiClient.post('token/', {
                username, password
            });

            const { access, refresh, user } = response.data;

            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            
            localStorage.setItem('username', username);

            localStorage.setItem('role_name', user.role);
            localStorage.setItem('permissions', JSON.stringify(user.permissions)); 

            navigate('/dashboard');
        } catch(error) {
            console.error("Error authenticating: ", error);
            setError('Invalid username or password')
        } finally {
            setLoading(false);
        };
    }
    return (
        <div className="min-h-screen bg-mauve-900 flex flex-col items-center justify-center p-4 selection:bg-indigo-500 selection:text-white">
            
                <div className="text-center mb-6">
                    <h1 className="text-4xl font-extrabold text-white mb-1.5 font-mono tracking-light">
                        Vaulty<span className="text-indigo-400">.</span>
                    </h1>
                    <p className='text-sm text-indigo-200/70 font-medium tracking-wide'>
                        Login to dashboard system
                    </p>
                </div>
                
            <div className="bg-mauve-200 p-8 rounded-2xl shadow-xl border border-mauve-800/20 w-full transition-all max-w-md duration-300">
                <div className='mb-6 p-4 bg-mauve-50/30 border border-mauve-200 rounded-xl'>
                    <div className="flex items-center gap-2 mb-3 justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse"></span>
                        <h3 className="text-xs uppercase tracking-widest font-bold text-mauve-700 font-mono">
                            Quick Demo Access
                        </h3>
                    </div>
                    <div className='grid grid-cols-2 gap-2'>
                        <button
                            onClick={handleAdminDemoLogin}
                            className={`py-2 px-3 text-xs font-mono font-semibold rounded-lg border transition-all duration-200 text-center cursor-pointer ${
                                username === 'demo_admin'
                                    ? "bg-mauve-700 text-white border-mauve-900 shadow-sm"
                                    : "bg-mauve-50 text-mauve-600 border-mauve-200 hover:bg-mauve-100 hover:text-mauve-900"
                            }`}
                        >
                            As Super Admin
                        </button>
                        <button
                            onClick={handleOfficerDemoLogin}
                            className={`py-2 px-3 text-xs font-mono font-semibold rounded-lg border transition-all duration-200 text-center cursor-pointer ${
                                username === 'demo_officer'
                                    ? "bg-mauve-700 text-white border-mauve-900 shadow-sm"
                                    : "bg-mauve-50 text-mauve-600 border-mauve-200 hover:bg-mauve-100 hover:text-mauve-900"
                            }`}
                        >
                            As Officer
                        </button>
                        <button
                            onClick={handleManagerDemoLogin}
                            className={`py-2 px-3 text-xs font-mono font-semibold rounded-lg border transition-all duration-200 text-center cursor-pointer ${
                                username === 'demo_manager'
                                    ? "bg-mauve-700 text-white border-mauve-900 shadow-sm"
                                    : "bg-mauve-50 text-mauve-600 border-mauve-200 hover:bg-mauve-100 hover:text-mauve-900"
                            }`}
                        >
                            As Manager
                        </button>
                        <button
                            onClick={handleAnalystDemoLogin}
                            className={`py-2 px-3 text-xs font-mono font-semibold rounded-lg border transition-all duration-200 text-center cursor-pointer ${
                                username === 'demo_analyst'
                                    ? "bg-mauve-700 text-white border-mauve-900 shadow-sm"
                                    : "bg-mauve-50 text-mauve-600 border-mauve-200 hover:bg-mauve-100 hover:text-mauve-900"
                            }`}
                        >
                            As Analyst
                        </button>
                    </div>
                </div>
                {error && (
                    <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        { error }
                    </div>
                )}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block mb-1.5 text-xs font-bold uppercase tracking-wider text-mauve-600 font-mono">
                            Username
                        </label>
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <FaUserShield className="text-mauve-500" />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-2 border border-mauve-200 rounded-xl 
                                    shadow-sm placeholder-mauve-400 focus:outline-none focus:ring-2
                                    focus:ring-indigo-500 transition-colors duration-300 ease-in-out
                                    bg-mauve-50/30 text-mauve-900"
                                placeholder="Enter your username"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block mb-1.5 text-xs font-bold uppercase tracking-wider text-mauve-600 font-mono">
                            Password
                        </label>
                        <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <RiLockPasswordFill className="text-mauve-500" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full pl-10 pr-10 py-2 border border-mauve-200 rounded-xl 
                                    shadow-sm placeholder-mauve-400 focus:outline-none focus:ring-2
                                    focus:ring-indigo-500 transition-colors duration-300 ease-in-out
                                    bg-mauve-50/30 text-mauve-900"
                                placeholder="Enter your password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-mauve-400 hover:text-indigo-600 transition-colors cursor-pointer"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>
                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full mt-2 bg-mauve-700 text-indigo-100 
                        px-4 py-2.5 font-semibold text-sm rounded-xl
                        hover:bg-mauve-600 transition-colors duration-300
                        disabled:opacity-70 disabled:cursor-not-allowed shadow-md cursor-pointer
                        "
                    >
                        {loading ? "Login..." : 'Sign in'}
                    </button>
                </form>
            </div>
        </div>
    )
    
}

export default LoginPage;