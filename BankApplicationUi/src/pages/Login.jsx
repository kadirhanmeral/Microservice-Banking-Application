import React from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";


function Login() {
    const [user, setUser] = React.useState({ identity: "", password: "" });
    const navigate = useNavigate();

    const login = async (user) => {
        try {
            const response = await axios.post(BASE_URL, user);
            localStorage.setItem("token", response.data);
        } catch (error) {
            if (error.response) {
                console.error("Error during login:", error.response.data);
                console.error("Status code:", error.response.status);
            } else if (error.request) {
                console.error("No response received:", error.request);
            } else {
                console.error("Error setting up the request:", error.message);
            }
        }
    };

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    return (
        <div className="flex flex-col items-center justify-start min-h-[80vh] pt-16 bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">Giriş Yap</h1>

                <input
                    type="text"
                    name="identity"
                    placeholder="TC Kimlik No"
                    value={user.identity}
                    onChange={handleChange}
                    className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Şifre"
                    value={user.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 mb-6 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                    onClick={() => login(user)}
                    className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors font-semibold"
                >
                    Giriş Yap
                </button>
            </div>
        </div>
    );
}

export default Login;
