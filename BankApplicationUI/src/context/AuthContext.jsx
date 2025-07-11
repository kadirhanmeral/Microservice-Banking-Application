import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserInfoFromToken, isAdminOrManager } from '../utils/jwtUtils';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [name, setName] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    // Initial load from localStorage
    useEffect(() => {
        const t = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        console.log("=== AUTH CONTEXT INIT ===");
        console.log("Initial token:", t);
        console.log("Initial userData:", userData);
        
        if (t && userData) {
            try {
                const parsedUser = JSON.parse(userData);
                setIsAuthenticated(true);
                setUser(parsedUser);
                setToken(t);
                
                // Extract name from token
                const userInfo = getUserInfoFromToken(t);
                if (userInfo && userInfo.name) {
                    setName(userInfo.name);
                }
                
                // Check if user is admin
                const adminStatus = isAdminOrManager(t);
                setIsAdmin(adminStatus);
                
                console.log("User authenticated from localStorage");
            } catch (error) {
                console.error("Error parsing user data:", error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = (jwt, userData) => {
        console.log("=== AUTH CONTEXT LOGIN ===");
        console.log("JWT:", jwt);
        console.log("UserData:", userData);
        
        localStorage.setItem('token', jwt);
        localStorage.setItem('user', JSON.stringify(userData));
        setIsAuthenticated(true);
        setUser(userData);
        setToken(jwt);
        
        // Extract name from token
        const userInfo = getUserInfoFromToken(jwt);
        if (userInfo && userInfo.name) {
            setName(userInfo.name);
        }
        
        // Check if user is admin
        const adminStatus = isAdminOrManager(jwt);
        setIsAdmin(adminStatus);
        
        console.log("Login completed, isAuthenticated:", true);
        console.log("User set:", userData);
    };

    const logout = () => {
        console.log("=== AUTH CONTEXT LOGOUT ===");
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
        setToken(null);
        setName(null);
        setIsAdmin(false);
    };

    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    const value = {
        isAuthenticated,
        user,
        name,
        isAdmin,
        login,
        logout,
        getAuthHeader,
        loading
    };

    console.log("=== AUTH CONTEXT RENDER ===");
    console.log("Current state:", { isAuthenticated, user, loading });

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}; 