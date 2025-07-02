import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Header() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const isLoggedIn = !!token;

    const decoded = token ? JSON.parse(atob(token.split('.')[1])) : {};
    const role = decoded.role || '';

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return (
        <nav className="bg-blue-700 text-white shadow-md px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div
                className="text-2xl font-semibold cursor-pointer hover:opacity-80 transition"
                onClick={() => navigate("/")}
            >
                Bank Application
            </div>

            <div className="mt-3 sm:mt-0 flex flex-wrap gap-4 items-center text-sm sm:text-base">
                {!isLoggedIn ? (
                    <>
                        <Link
                            to="/login"
                            className="hover:text-gray-200 hover:underline transition duration-150"
                        >
                            Giriş Yap
                        </Link>
                        <Link
                            to="/register"
                            className="hover:text-gray-200 hover:underline transition duration-150"
                        >
                            Kayıt Ol
                        </Link>
                    </>
                ) : (
                    <>
                        <Link
                            to="/account"
                            className="hover:text-gray-200 hover:underline transition duration-150"
                        >
                            Hesap
                        </Link>


                        <button
                            onClick={handleLogout}
                            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md text-white font-medium transition duration-150"
                        >
                            Çıkış Yap
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Header;
