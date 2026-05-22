import React from "react";

const AccessGuard = ({ permission, children }) => {
    const role = localStorage.getItem('role');
    const storedPermissions = JSON.parse(localStorage.getItem('permissions') || "[]");

    if (role === "Super Admin") {
        return <>{children}</>;
    }

    if (!storedPermissions.includes(permission)) {
        return null;
    }

    return <>{children}</>
}

export default AccessGuard;