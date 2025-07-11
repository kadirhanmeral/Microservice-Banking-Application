import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Header() {
    const navigate = useNavigate();
    const { isAuthenticated, user, name, isAdmin, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav className="bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-lg border-b border-blue-600">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4">
                    {/* Logo/Brand */}
                    <div
                        className="text-2xl font-bold cursor-pointer hover:text-blue-200 transition-colors duration-200 mb-4 sm:mb-0"
                        onClick={() => navigate("/")}
                    >
                        <span className="text-blue-200">Bank</span>
                        <span className="text-white">Application</span>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex flex-wrap items-center gap-6 text-sm sm:text-base">
                        {!isAuthenticated ? (
                            <>
                                <Link
                                    to="/login"
                                    className="text-gray-200 hover:text-white hover:bg-blue-700 px-4 py-2 rounded-lg transition-all duration-200 font-medium"
                                >
                                    Giriş Yap
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg"
                                >
                                    Kayıt Ol
                                </Link>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-6">


                                    <div className="hidden md:flex items-center gap-4">
                                        {!isAdmin && (
                                            <>
                                                <Link
                                                    to="/payments"
                                                    className="text-gray-200 hover:text-white hover:bg-blue-700 px-3 py-2 rounded-md transition-all duration-200 font-medium"
                                                >
                                                    Ödemeler
                                                </Link>
                                                <Link
                                                    to="/loans"
                                                    className="text-gray-200 hover:text-white hover:bg-blue-700 px-3 py-2 rounded-md transition-all duration-200 font-medium"
                                                >
                                                    Krediler
                                                </Link>
                                                <Link
                                                    to="/accounts"
                                                    className="text-gray-200 hover:text-white hover:bg-blue-700 px-3 py-2 rounded-md transition-all duration-200 font-medium"
                                                >
                                                    Hesaplar
                                                </Link>
                                            </>
                                        )}
                                        {isAdmin && (
                                            <>
                                                <Link
                                                    to="/users"
                                                    className="text-gray-200 hover:text-white hover:bg-blue-700 px-3 py-2 rounded-md transition-all duration-200 font-medium"
                                                >
                                                    Kullanıcılar
                                                </Link>
                                                <Link
                                                    to="/loan-approval"
                                                    className="text-gray-200 hover:text-white hover:bg-blue-700 px-3 py-2 rounded-md transition-all duration-200 font-medium"
                                                >
                                                    Kredi Onay
                                                </Link>
                                            </>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleLogout}
                                        className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2.5 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 border border-red-400/20 flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Çıkış Yap
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {isAuthenticated && (
                    <div className="md:hidden border-t border-blue-600 pt-4">
                        <div className="flex flex-wrap gap-3">
                            {!isAdmin && (
                                <>
                                    <Link
                                        to="/payments"
                                        className="text-gray-200 hover:text-white hover:bg-blue-700 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium"
                                    >
                                        Ödemeler
                                    </Link>
                                    <Link
                                        to="/loans"
                                        className="text-gray-200 hover:text-white hover:bg-blue-700 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium"
                                    >
                                        Krediler
                                    </Link>
                                    <Link
                                        to="/accounts"
                                        className="text-gray-200 hover:text-white hover:bg-blue-700 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium"
                                    >
                                        Hesaplar
                                    </Link>
                                </>
                            )}
                            {isAdmin && (
                                <>
                                    <Link
                                        to="/users"
                                        className="text-gray-200 hover:text-white hover:bg-blue-700 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium"
                                    >
                                        Kullanıcılar
                                    </Link>
                                    <Link
                                        to="/loan-approval"
                                        className="text-gray-200 hover:text-white hover:bg-blue-700 px-3 py-2 rounded-md transition-all duration-200 text-sm font-medium"
                                    >
                                        Kredi Onay
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Header;
