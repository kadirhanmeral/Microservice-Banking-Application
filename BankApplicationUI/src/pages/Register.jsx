import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_CONFIG = {
  GATEWAY_URL: 'http://localhost:8081',
  USER_SERVICE: '/api/users',
};

function Register() {
    const [user, setUser] = useState({
        identity: "",
        password: "",
        emailId: "",
        firstName: "",
        lastName: "",
        contactNumber: ""
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (Object.values(user).some(value => !value)) {
            setError("Please fill in all fields");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setSuccess("");

            const response = await axios.post(`${API_CONFIG.GATEWAY_URL}${API_CONFIG.USER_SERVICE}/register`, user);
            
            if (response.data.responseCode === "200") {
                setSuccess("Registration successful! You can now login.");
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            } else {
                setError(response.data.responseMessage || "Registration failed");
            }
        } catch (error) {
            if (error.response?.data?.responseMessage) {
                setError(error.response.data.responseMessage);
            } else {
                setError("Registration failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
        if (error) setError("");
        if (success) setSuccess("");
    };

    return (
        <div className="flex flex-col items-center justify-start min-h-[80vh] pt-16 bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">Register</h1>

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
                        className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                    />

                    <input
                        type="email"
                        name="emailId"
                        placeholder="Email"
                        value={user.emailId}
                        onChange={handleChange}
                        className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                    />

                    <input
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        value={user.firstName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                    />

                    <input
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        value={user.lastName}
                        onChange={handleChange}
                        className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                    />

                    <input
                        type="text"
                        name="contactNumber"
                        placeholder="Contact Number"
                        value={user.contactNumber}
                        onChange={handleChange}
                        className="w-full px-4 py-3 mb-6 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                    />

                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>

                    <div className="mt-4 text-center">
                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="text-blue-600 hover:text-blue-800"
                        >
                            Already have an account? Login
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Register;
