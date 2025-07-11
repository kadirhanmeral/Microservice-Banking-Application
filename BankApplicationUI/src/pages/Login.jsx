import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { isAdminOrManager } from "../utils/jwtUtils";

const BASE_URL = 'http://localhost:8572/realms/banking-service/protocol/openid-connect/token';
const CLIENT_ID = "banking-service-client";
const CLIENT_SECRET = "MV3ZixOpL7A79aM54oJD9Sy37LA9ldp3";

function Login() {
    const [user, setUser] = useState({ identity: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (userData) => {
        try {
            setLoading(true);
            setError("");

            const params = new URLSearchParams();
            params.append("client_id", CLIENT_ID);
            params.append("client_secret", CLIENT_SECRET);
            params.append("grant_type", "password");
            params.append("username", userData.identity);
            params.append("password", userData.password);
            params.append("scope", "openid offline_access");

            const response = await axios.post(BASE_URL, params, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });

            if (response.data.access_token) {
                const { access_token, refresh_token } = response.data;
                login(access_token, { identity: userData.identity });

                setTimeout(() => {
                    try {
                        const token = access_token;
                        if (isAdminOrManager(token)) {
                            navigate("/users", { replace: true });
                        } else {
                            navigate("/payments", { replace: true });
                        }
                    } catch (e) {
                        navigate("/payments", { replace: true });
                    }
                }, 500);
            } else {
                setError("Login failed. Please check your credentials.");
            }

        } catch (error) {
            if (error.response?.status === 401) {
                setError("Invalid username or password. Please check your credentials.");
            } else if (error.response?.status === 400) {
                setError("Invalid request. Please check your credentials.");
            } else {
                setError("Login failed. Please check your credentials.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (user.identity && user.password) {
            handleLogin(user);
        } else {
            setError("Please fill in all fields");
        }
    };

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
        if (error) setError("");
    };

    return (
        <div className="flex flex-col items-center justify-start min-h-[80vh] pt-16 bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">Login</h1>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="identity"
                        placeholder="Identity Number"
                        value={user.identity}
                        onChange={handleChange}
                        className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={user.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 mb-6 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                    />

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;
