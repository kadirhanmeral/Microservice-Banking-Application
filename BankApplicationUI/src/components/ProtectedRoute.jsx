import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    console.log("=== PROTECTED ROUTE DEBUG ===");
    console.log("isAuthenticated:", isAuthenticated);
    console.log("loading:", loading);
    console.log("current location:", location.pathname);

    // LocalStorage'dan token kontrolü
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log("LocalStorage token:", token);
    console.log("LocalStorage user:", user);

    if (loading) {
        console.log("Loading state, showing spinner");
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-700"></div>
            </div>
        );
    }

    // Token varsa authenticated kabul et
    if (token && user) {
        console.log("Token found, rendering children");
        return children;
    }

    if (!isAuthenticated) {
        console.log("Not authenticated, redirecting to login");
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    console.log("Authenticated, rendering children");
    return children;
};

export default ProtectedRoute; 