import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const apiUrl = import.meta.env.VITE_API_URL;

function Register() {
    const [user, setUser] = React.useState({
        identity: "",
        password: "",
        emailId: "",
        firstName: "",
        lastName: "",
        contactNumber: "",
    });

    const [fieldErrors, setFieldErrors] = React.useState({});
    const [generalError, setGeneralError] = React.useState("");

    const navigate = useNavigate();

    const register = async (user) => {
        try {
            const response = await axios.post(`${apiUrl}/api/users/register`, user);
            setFieldErrors({});
            setGeneralError("");

            if (response.status === 200) {
                console.log("Kayıt başarılı");
                navigate("/login");
            }
        } catch (error) {
            if (error.response && error.response.data) {
                const responseData = error.response.data;

                if (Array.isArray(responseData.errors)) {
                    const errorsByField = {};
                    responseData.errors.forEach((err) => {
                        errorsByField[err.field] = err.defaultMessage;
                    });
                    setFieldErrors(errorsByField);
                    setGeneralError("");
                } else {
                    setGeneralError(
                        error.response.data.errorMessage || "Beklenmeyen bir hata oluştu."
                    );
                    setFieldErrors({});
                }
            } else {
                setGeneralError("Beklenmeyen bir hata oluştu.");
                setFieldErrors({});
                console.error("Unexpected error", error);
            }
        }
    };

    const handleChange = (e) => {
        setUser({ ...user, [e.target.name]: e.target.value });
    };

    return (
        <div className="flex flex-col items-center justify-start min-h-[80vh] pt-16 bg-gray-50 px-4">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold mb-6 text-center text-blue-700">
                    Kayıt Ol
                </h1>

                {generalError && (
                    <div className="mb-4 text-center text-red-600 font-semibold">
                        {generalError}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <input
                            type="text"
                            name="identity"
                            placeholder="T.C. Kimlik Numarası"
                            value={user.identity}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${fieldErrors.identity
                                ? "border-red-500 focus:ring-red-400"
                                : "border-gray-300 focus:ring-blue-400"
                                }`}
                        />
                        {fieldErrors.identity && (
                            <p className="mt-1 text-sm text-red-500">{fieldErrors.identity}</p>
                        )}
                    </div>

                    <div>
                        <input
                            type="password"
                            name="password"
                            placeholder="Şifre"
                            value={user.password}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${fieldErrors.password
                                ? "border-red-500 focus:ring-red-400"
                                : "border-gray-300 focus:ring-blue-400"
                                }`}
                        />
                        {fieldErrors.password && (
                            <p className="mt-1 text-sm text-red-500">{fieldErrors.password}</p>
                        )}
                    </div>

                    <div>
                        <input
                            type="email"
                            name="emailId"
                            placeholder="Email"
                            value={user.emailId}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${fieldErrors.emailId
                                ? "border-red-500 focus:ring-red-400"
                                : "border-gray-300 focus:ring-blue-400"
                                }`}
                        />
                        {fieldErrors.emailId && (
                            <p className="mt-1 text-sm text-red-500">{fieldErrors.emailId}</p>
                        )}
                    </div>

                    <div>
                        <input
                            type="text"
                            name="firstName"
                            placeholder="Ad"
                            value={user.firstName}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${fieldErrors.firstName
                                ? "border-red-500 focus:ring-red-400"
                                : "border-gray-300 focus:ring-blue-400"
                                }`}
                        />
                        {fieldErrors.firstName && (
                            <p className="mt-1 text-sm text-red-500">{fieldErrors.firstName}</p>
                        )}
                    </div>

                    <div>
                        <input
                            type="text"
                            name="lastName"
                            placeholder="Soyad"
                            value={user.lastName}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${fieldErrors.lastName
                                ? "border-red-500 focus:ring-red-400"
                                : "border-gray-300 focus:ring-blue-400"
                                }`}
                        />
                        {fieldErrors.lastName && (
                            <p className="mt-1 text-sm text-red-500">{fieldErrors.lastName}</p>
                        )}
                    </div>

                    <div>
                        <input
                            type="text"
                            name="contactNumber"
                            placeholder="Telefon Numarası"
                            value={user.contactNumber}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${fieldErrors.contactNumber
                                ? "border-red-500 focus:ring-red-400"
                                : "border-gray-300 focus:ring-blue-400"
                                }`}
                        />
                        {fieldErrors.contactNumber && (
                            <p className="mt-1 text-sm text-red-500">{fieldErrors.contactNumber}</p>
                        )}
                    </div>

                    <button
                        onClick={() => register(user)}
                        className="w-full py-3 mt-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Kayıt Ol
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Register;
