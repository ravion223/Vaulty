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

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await apiClient.post('token/', {
                username, password
            });

            const { access, refresh, role_name, permissions } = response.data;

            localStorage.setItem('access_token', access);
            localStorage.setItem('refresh_token', refresh);
            
            localStorage.setItem('username', username);

            localStorage.setItem('role_name', role_name);
            localStorage.setItem('permissions', permissions); 

            navigate('/dashboard');
        } catch(error) {
            console.error("Error authenticating: ", error);
            setError('Invalid username or password')
        } finally {
            setLoading(false);
        };
    }
    return (
        <div className="min-h-screen bg-mauve-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-mauve-100 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-semibold text-mauve-900 mb-2">
                        VaultCore
                    </h1>
                    <p>
                        Login to system
                    </p>
                </div>
                {error && (
                    <div className="mb-6 p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                        { error }
                    </div>
                )}
                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-mauve-700">
                            Username
                        </label>
                        <div className="relative w-full max-w-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaUserShield className="text-mauve-700" />
                            </div>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-2 border border-mauve-200 rounded-lg 
                                    shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2
                                    focus:ring-emerald-500 transition-colors duration-300 ease-in-out"
                                placeholder="Enter your username"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-mauve-700">
                            Password
                        </label>
                        <div className="relative w-full max-w-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <RiLockPasswordFill className="text-mauve-700" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-2 border border-mauve-200 rounded-lg 
                                    shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2
                                    focus:ring-emerald-500 transition-colors duration-300 ease-in-out"
                                placeholder="Enter your password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-4 text-mauve-700 hover:text-emerald-600 transition-colors"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>
                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 text-emerald-50 
                        px-4 py-2 font-semibold text-sm rounded-2xl
                        hover:bg-emerald-500 transition-colors duration-300
                        disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? "Login..." : 'Sign in'}
                    </button>
                </form>
            </div>
        </div>
    )
    
}

export default LoginPage;