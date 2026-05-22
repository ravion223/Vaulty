import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, permission }) => {
    const role = localStorage.getItem('role');
    const storedPermissions = JSON.parse(localStorage.getItem('permissions') || "[]");

    if (role === 'Super Admin') {
        return children;
    }

    if (permission && !storedPermissions.includes(permission)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;